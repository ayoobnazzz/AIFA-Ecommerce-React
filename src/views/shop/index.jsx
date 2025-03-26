import { useParams } from 'react-router-dom';
import { useDidMount } from '@/hooks';
import { AppliedFilters, ProductGrid, ProductList } from '@/components/product';
import { SearchBar, FiltersToggle } from '@/components/common';
import { FilterOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { selectFilter } from '@/selectors/selector';
// import SearchBar from './SearchBar';

const Shop = () => {
  const { searchTerm } = useParams();
  const dispatch = useDispatch();
  useDocumentTitle('Shop | AIFA - Baby Cloud');
  useScrollTop();

  useDidMount(() => {
    if (searchTerm) {
      dispatch(searchProduct(searchTerm));
    }
  });

  const store = useSelector((state) => ({
    filteredProducts: selectFilter(
      state.products.searchedProducts.items.length > 0 
        ? state.products.searchedProducts.items
        : state.products.items,
      state.filter
    ),
    products: state.products,
    requestStatus: state.app.requestStatus,
    isLoading: state.app.loading
  }), shallowEqual);

  return (
    <main className="content">
      <section className="product-list-wrapper">
        <AppliedFilters filteredProductsCount={store.filteredProducts.length} />
        <div style={{display: "flex", marginBottom: "4rem" }}>

      <div>
        <FiltersToggle>
          <button className="button-muted button-small" type="button">
            Filters
            <FilterOutlined />
          </button>
        </FiltersToggle>
        </div>
        <div>
        <SearchBar />

        </div>


        </div>

        <ProductList {...store}>
          <ProductGrid products={store.filteredProducts} />
        </ProductList>
      </section>
    </main>
  );
};

export default Shop;
