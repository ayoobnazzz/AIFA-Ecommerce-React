/* eslint-disable react/jsx-props-no-spreading */
import { AppliedFilters, ProductGrid, ProductList } from '@/components/product';
import { SearchBar, FiltersToggle } from '@/components/common';
import { FilterOutlined } from '@ant-design/icons';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { selectFilter } from '@/selectors/selector';
// import SearchBar from './SearchBar';

const Shop = () => {
  useDocumentTitle('Shop | AIFA - Baby Cloud');
  useScrollTop();

  const store = useSelector((state) => ({
    filteredProducts: selectFilter(state.products.items, state.filter),
    products: state.products,
    requestStatus: state.app.requestStatus,
    isLoading: state.app.loading
  }), shallowEqual);

  return (
    <main className="content">
      <section className="product-list-wrapper">
        <AppliedFilters filteredProductsCount={store.filteredProducts.length} />
        <div style={{display: "flex" }}>

      <div>
        <FiltersToggle>
          <button className="button-muted button-small" type="button">
            Filters &nbsp;
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
