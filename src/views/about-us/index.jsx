import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { useDocumentTitle, useRecommendedProducts, useScrollTop } from '@/hooks';
import React from 'react';

const AboutUs = () => {
  useDocumentTitle('Recommended Products | AIFA - Baby Cloud');
  useScrollTop();

  return (
    <main className="content">
      <div className="featured">
        <div className="banner">
          <div className="banner-desc">
            <h1>About</h1>
          </div>
          <div className="banner-img">
            <img src="/banner-2.jpeg" alt="" />
          </div>
        </div>
        <div className="display">
          <div className="product-display-grid">

          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutUs;
