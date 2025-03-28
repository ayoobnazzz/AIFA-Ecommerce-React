/* eslint-disable jsx-a11y/label-has-associated-control */
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { ImageLoader } from '@/components/common';
import {
  CustomCreatableSelect, CustomInput, CustomTextarea
} from '@/components/formik';
import {
  Field, FieldArray, Form, Formik
} from 'formik';
import { useFileHandler } from '@/hooks';
import PropType from 'prop-types';
import React from 'react';
import * as Yup from 'yup';
import { CloseOutlined } from '@ant-design/icons';

// Default brand names that I used. You can use what you want
const brandOptions = [
  { value: 'Baby Blossom', label: 'Baby Blossom' },
  { value: 'Happy Huggies', label: 'Happy Huggies' },
  { value: 'CuddleCloud', label: 'CuddleCloud' },
  { value: 'Gentle Beginnings', label: 'Gentle Beginnings' }
];

const FormSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required.')
    .max(60, 'Product name must only be less than 60 characters.'),
  brand: Yup.string()
    .required('Brand name is required.'),
  price: Yup.number()
    .positive('Price is invalid.')
    .integer('Price should be an integer.')
    .required('Price is required.'),
  description: Yup.string()
    .required('Description is required.'),
  maxQuantity: Yup.number()
    .positive('Max quantity is invalid.')
    .integer('Max quantity should be an integer.')
    .required('Max quantity is required.'),
  keywords: Yup.array()
    .of(Yup.string())
    .min(1, 'Please enter at least 1 keyword for this product.'),
  sizes: Yup.array()
    .of(Yup.string())
    .min(1, 'Size is Required for this product'),
  isFeatured: Yup.boolean(),
  isRecommended: Yup.boolean()
});

const ProductForm = ({ product, onSubmit, isLoading }) => {
  const initFormikValues = {
    name: product?.name || '',
    brand: product?.brand || '',
    price: product?.price || 0,
    maxQuantity: product?.maxQuantity || 0,
    description: product?.description || '',
    keywords: product?.keywords || [],
    sizes: product?.sizes || [],
    isFeatured: product?.isFeatured || false,
    isRecommended: product?.isRecommended || false
  };

  const {
    imageFile,
    isFileLoading,
    onFileChange,
    removeImage
  } = useFileHandler({ image: {}, imageCollection: product?.imageCollection || [] });

  const onSubmitForm = (form) => {
    // Generate keywords from product data
    const generateKeywords = (text) => 
      text.toLowerCase()
      .split(/[\s-]+/g) // Split by spaces and hyphens
      .filter(word => word.length > 2); // Ignore short words
  
    const nameKeywords = generateKeywords(form.name);
    const descKeywords = generateKeywords(form.description);
    const brandKeywords = generateKeywords(form.brand);
    const userKeywords = form.keywords.map(k => k.toLowerCase());
  
    // Merge all keywords and remove duplicates
    const mergedKeywords = [...new Set([
      ...nameKeywords,
      ...descKeywords,
      ...brandKeywords,
      ...userKeywords
    ])];
  
    // Use optional chaining for product.image
    const hasThumbnail = imageFile.image.file || product?.image;
    const hasCollectionImages = imageFile.imageCollection?.length > 0;
  
    if (hasThumbnail || hasCollectionImages) {
      onSubmit({
        ...form,
        keywords: mergedKeywords,
        quantity: 1,
        name_lower: form.name.toLowerCase(),
        brand_lower: form.brand.toLowerCase(),
        description_lower: form.description.toLowerCase(),
        dateAdded: new Date().getTime(),
        image: imageFile?.image?.file || product?.image || '',
        imageCollection: imageFile.imageCollection || []
      });
    } else {
      alert('Product thumbnail image is required.');
    }
  };

  return (
    <div>
      <Formik
        initialValues={initFormikValues}
        validateOnChange
        validationSchema={FormSchema}
        onSubmit={onSubmitForm}
      >
        {({ values, setValues }) => (
          <Form className="product-form">
            <div className="product-form-inputs">
              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="name"
                    type="text"
                    label="* Product Name"
                    placeholder="Gago"
                    style={{ textTransform: 'capitalize' }}
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={{ label: values.brand, value: values.brand }}
                    name="brand"
                    iid="brand"
                    options={brandOptions}
                    disabled={isLoading}
                    placeholder="Select/Create Brand"
                    label="* Brand"
                  />
                </div>
              </div>
              <div className="product-form-field">
                <Field
                  disabled={isLoading}
                  name="description"
                  id="description"
                  rows={3}
                  label="* Product Description"
                  component={CustomTextarea}
                />
              </div>
              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="price"
                    id="price"
                    type="number"
                    label="* Price"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="maxQuantity"
                    type="number"
                    id="maxQuantity"
                    label="* Max Quantity"
                    component={CustomInput}
                  />
                </div>
              </div>
              <div className="d-flex">
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={values.keywords.map((key) => ({ value: key, label: key }))}
                    name="keywords"
                    iid="keywords"
                    isMulti
                    disabled={isLoading}
                    placeholder="Create/Select Keywords"
                    label="* Keywords"
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomCreatableSelect
                    defaultValue={values.sizes.map((key) => ({ value: key, label: key }))}
                    name="sizes"
                    iid="sizes"
                    // type="number"
                    options={[{ value: "Newborn Up to 5 lbs", label: "Newborn Up to 5 lbs" }, { value: "Newborn Up to 5 - 8 lbs", label: "Newborn Up to 5 - 8 lbs" }, { value: "Infant 0 - 3 months", label: "Infant 0 - 3 months" }, { value: "Infant 3 - 6 months", label: "Infant 3 - 6 months" }, { value: "Infant 6 - 12 months", label: "Infant 6 - 12 months" }, { value: "Infant 12 - 18 months", label: "Infant 12 - 18 months" }, { value: "Infant 18 - 24 months", label: "Infant 18 - 24 months" }]}
                    isMulti
                    disabled={isLoading}
                    placeholder="Create/Select Sizes"
                    label="* Sizes"
                  />
                </div>
              </div>
              <div className="product-form-field">
                <span className="d-block padding-s">Image Collection</span>
                {!isFileLoading && (
                  <label htmlFor="product-input-file-collection">
                    <input
                      disabled={isLoading}
                      hidden
                      id="product-input-file-collection"
                      multiple
                      onChange={(e) => onFileChange(e, { name: 'imageCollection', type: 'multiple' })}
                      readOnly={isLoading}
                      type="file"
                    />
                    Choose Images
                  </label>
                )}
              </div>
              <div className="product-form-collection">
                {imageFile.imageCollection.map((image) => (
                  <div className="product-form-collection-image" key={image.id}>
                    <ImageLoader
                      alt=""
                      src={image.url}
                    />
                    <button
                      className="product-form-delete-image"
                      onClick={() => removeImage({ id: image.id, name: 'imageCollection' })}
                      title="Delete Image"
                      type="button"
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                ))}
              </div>
              <br />
              <div className="d-flex">
                <div className="product-form-field">
                  <input
                    checked={values.isFeatured}
                    className=""
                    id="featured"
                    onChange={(e) => setValues({ ...values, isFeatured: e.target.checked })}
                    type="checkbox"
                  />
                  <label htmlFor="featured">
                    <h5 className="d-flex-grow-1 margin-0">
                      &nbsp; Add to Featured &nbsp;
                    </h5>
                  </label>
                </div>
                <div className="product-form-field">
                  <input
                    checked={values.isRecommended}
                    className=""
                    id="recommended"
                    onChange={(e) => setValues({ ...values, isRecommended: e.target.checked })}
                    type="checkbox"
                  />
                  <label htmlFor="recommended">
                    <h5 className="d-flex-grow-1 margin-0">
                      &nbsp; Add to Recommended &nbsp;
                    </h5>
                  </label>
                </div>
              </div>
              <br />
              <br />
              <br />
              <div className="product-form-field product-form-submit">
                <button
                  className="button"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
                  &nbsp;
                  {isLoading ? 'Saving Product' : 'Save Product'}
                </button>
              </div>
            </div>
            {/* ----THUBMNAIL ---- */}
            <div className="product-form-file">
              <div className="product-form-field">
                <span className="d-block padding-s">* Thumbnail</span>
                {!isFileLoading && (
                  <label htmlFor="product-input-file">
                    <input
                      disabled={isLoading}
                      hidden
                      id="product-input-file"
                      onChange={(e) => onFileChange(e, { name: 'image', type: 'single' })}
                      readOnly={isLoading}
                      type="file"
                    />
                    Choose Image
                  </label>
                )}
              </div>
              <div className="product-form-image-wrapper">
                {(imageFile.image.url || product.image) && (
                  <ImageLoader
                    alt=""
                    className="product-form-image-preview"
                    src={imageFile.image.url || product.image}
                  />
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

ProductForm.propTypes = {
  product: PropType.shape({
    name: PropType.string,
    brand: PropType.string,
    price: PropType.number,
    maxQuantity: PropType.number,
    description: PropType.string,
    keywords: PropType.arrayOf(PropType.string),
    imageCollection: PropType.arrayOf(PropType.object),
    sizes: PropType.arrayOf(PropType.string),
    image: PropType.string,
    isFeatured: PropType.bool,
    isRecommended: PropType.bool,
    // availableColors: PropType.arrayOf(PropType.string)
  }).isRequired,
  onSubmit: PropType.func.isRequired,
  isLoading: PropType.bool.isRequired
};

export default ProductForm;