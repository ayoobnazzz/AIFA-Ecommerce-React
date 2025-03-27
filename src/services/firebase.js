import { initializeApp } from "firebase/app";
import { getAuth, 
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         GoogleAuthProvider,
         FacebookAuthProvider,
         signInWithPopup,
         sendPasswordResetEmail,
         updatePassword,
         reauthenticateWithCredential,
         EmailAuthProvider,
         updateEmail,
         setPersistence,
         browserLocalPersistence,
         onAuthStateChanged } from "firebase/auth";
import { getFirestore, 
         collection,
         doc,
         getDoc,
         setDoc,
         updateDoc,
         query,
         where,
         orderBy,
         startAfter,
         limit,
         getDocs,
         or,
         and  } from "firebase/firestore";
import { getStorage, 
         ref, 
         uploadBytes, 
         getDownloadURL,
         deleteObject } from "firebase/storage";
import firebaseConfig from "./config";

class Firebase {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  // AUTH ACTIONS ------------
  createAccount = (email, password) => 
    createUserWithEmailAndPassword(this.auth, email, password);

  signIn = (email, password) => 
    signInWithEmailAndPassword(this.auth, email, password);

  signInWithGoogle = () => 
    signInWithPopup(this.auth, new GoogleAuthProvider());

  signInWithFacebook = () => 
    signInWithPopup(this.auth, new FacebookAuthProvider());

  signOut = () => this.auth.signOut();

  passwordReset = (email) => sendPasswordResetEmail(this.auth, email);

  passwordUpdate = (password) =>
    updatePassword(this.auth.currentUser, password);

  reauthenticate = (currentPassword) => {
    const credential = EmailAuthProvider.credential(
      this.auth.currentUser.email,
      currentPassword
    );
    return reauthenticateWithCredential(this.auth.currentUser, credential);
  };

  updateEmail = (newEmail) =>
    updateEmail(this.auth.currentUser, newEmail);

  setAuthPersistence = () =>
    setPersistence(this.auth, browserLocalPersistence);

  addUser = (id, user) => this.db.collection("users").doc(id).set(user);

  getUser = (id) => this.db.collection("users").doc(id).get();

  updateProfile = (id, updates) => 
    updateDoc(doc(this.db, "users", id), updates);


  
  changePassword = (currentPassword, newPassword) =>
    new Promise((resolve, reject) => {
      this.reauthenticate(currentPassword)
        .then(() => {
          const user = this.auth.currentUser;
          user
            .updatePassword(newPassword)
            .then(() => {
              resolve("Password updated successfully!");
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

  reauthenticate = (currentPassword) => {
    const user = this.auth.currentUser;
    const cred = app.auth.EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    return user.reauthenticateWithCredential(cred);
  };

  updateEmail = (currentPassword, newEmail) =>
    new Promise((resolve, reject) => {
      this.reauthenticate(currentPassword)
        .then(() => {
          const user = this.auth.currentUser;
          user
            .updateEmail(newEmail)
            .then(() => {
              resolve("Email Successfully updated");
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

  updateProfile = (id, updates) =>
    this.db.collection("users").doc(id).update(updates);

  onAuthStateChanged = () =>
    new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user);
        } else {
          reject(new Error("Auth State Changed failed"));
        }
      });
    });

  saveBasketItems = (items, userId) =>
    updateDoc(doc(this.db, "users", userId), { basket: items });

  onAuthStateChanged = (callback) =>
    onAuthStateChanged(this.auth, callback);

  setAuthPersistence = () =>
    this.auth.setPersistence(app.auth.Auth.Persistence.LOCAL);

  // // PRODUCT ACTIONS --------------

  getSingleProduct = (id) => getDoc(doc(this.db, "products", id));

  getProducts = async (lastRefKey) => {
    try {
      const productsRef = collection(this.db, "products");
      let q = query(
        productsRef,
        orderBy("dateAdded", "desc"),
        limit(12)
      );

      if (lastRefKey) {
        q = query(q, startAfter(lastRefKey));
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      return {
        products,
        lastKey: snapshot.docs[snapshot.docs.length - 1],
        total: (await getDocs(productsRef)).size
      };
    } catch (error) {
      throw new Error(error.message || "Failed to fetch products");
    }
  };

  searchProducts = async (searchKey) => {
    const searchTerm = searchKey.toLowerCase().trim();
    const searchWords = searchTerm.split(/[\s-]+/g).filter(w => w.length > 2);
  
    try {
      const productsRef = collection(this.db, "products");
      const queries = [];
      
      // Separate queries for each search field
      if (searchTerm.length > 0) {
        // Name search
        queries.push(query(
          productsRef,
          where("name_lower", ">=", searchTerm),
          where("name_lower", "<=", searchTerm + '\uf8ff'),
          limit(25)
        ));
  
        // Brand search
        queries.push(query(
          productsRef,
          where("brand_lower", ">=", searchTerm),
          where("brand_lower", "<=", searchTerm + '\uf8ff'),
          limit(25)
        ));
  
        // Description search
        queries.push(query(
          productsRef,
          where("description_lower", ">=", searchTerm),
          where("description_lower", "<=", searchTerm + '\uf8ff'),
          limit(25)
        ));
      }
  
      // Keywords search
      if (searchWords.length > 0) {
        queries.push(query(
          productsRef,
          where("keywords", "array-contains-any", searchWords),
          limit(25)
        ));
      }
  
      // Execute all queries in parallel
      const snapshots = await Promise.all(queries.map(q => getDocs(q)));
      
      // Merge and deduplicate results
      const mergedProducts = [];
      const seenIds = new Set();
  
      snapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            mergedProducts.push({ id: doc.id, ...doc.data() });
          }
        });
      });
  
      return {
        products: mergedProducts,
        total: mergedProducts.length,
        lastKey: null
      };
    } catch (error) {
      throw new Error(error.message || "Search failed");
    }
  };

  getFeaturedProducts = async (itemsCount = 12) => {
    const q = query(
      collection(this.db, "products"),
      where("isFeatured", "==", true),
      limit(itemsCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  };

  getRecommendedProducts = async (itemsCount = 12) => {
    const q = query(
      collection(this.db, "products"),
      where("isRecommended", "==", true),
      limit(itemsCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  };

  addProduct = (id, product) =>
    setDoc(doc(this.db, "products", id), product);

  generateKey = () => doc(collection(this.db, "products")).id;

  storeImage = async (id, folder, imageFile) => {
    const storageRef = ref(this.storage, `${folder}/${id}`);
    await uploadBytes(storageRef, imageFile);
    return getDownloadURL(storageRef);
  };

  deleteImage = (id) => 
    deleteObject(ref(this.storage, `products/${id}`));

  editProduct = (id, updates) =>
    updateDoc(doc(this.db, "products", id), updates);

  removeProduct = (id) =>
    deleteDoc(doc(this.db, "products", id));
}

const firebaseInstance = new Firebase();

export default firebaseInstance;
