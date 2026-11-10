import React from 'react';
import SectionHeading from '../common/SectionHeading';
import ProductCard from './ProductCard';
import ImagePlaceholder from '../common/ImagePlaceholder';

/**
 * Section: Featured Products
 * Consumes featured creations from Django REST API.
 */
export const FeaturedProducts = ({ products = [], loading = false }) => {
  const placeholderSlots = [
    { id: 'feat-ph-1', slotNum: '01', badge: 'Signature' },
    { id: 'feat-ph-2', slotNum: '02', badge: 'Signature' },
    { id: 'feat-ph-3', slotNum: '03', badge: 'Masterpiece' },
    { id: 'feat-ph-4', slotNum: '04', badge: 'Masterpiece' },
  ];

  return (
    <section
      aria-label="Featured Products"
      className="py-16 md:py-24 bg-luxury-white border-b border-luxury-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Signature Pieces"
          title="Featured Creations"
          viewAllLink="/collections"
          viewAllText="Explore All"
          alignment="left"
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-luxury-ivory animate-pulse" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 touch-scroll-x hide-scrollbar">
            {products.map((product) => (
              <div
                key={product.id}
                className="w-64 sm:w-72 md:w-auto flex-shrink-0 touch-scroll-item"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Neutral featured placeholders preserving layout */
          <div className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 touch-scroll-x hide-scrollbar">
            {placeholderSlots.map((slot) => (
              <div
                key={slot.id}
                className="w-64 sm:w-72 md:w-auto flex-shrink-0 touch-scroll-item"
              >
                <div className="relative overflow-hidden bg-luxury-ivory-light border border-luxury-border">
                  {slot.badge && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-luxury-white text-luxury-text-primary text-[10px] uppercase tracking-[0.2em] font-medium border border-luxury-border">
                      {slot.badge}
                    </span>
                  )}
                  <ImagePlaceholder
                    aspectRatio="aspect-[4/5]"
                    label={`[Featured Piece ${slot.slotNum}]`}
                    sublabel="Manage in Django Admin"
                    iconType="gem"
                  />
                </div>
                <div className="pt-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-text-secondary mb-1">
                    [Masterpiece Collection]
                  </p>
                  <h3 className="font-serif text-base sm:text-lg text-luxury-text-primary font-normal">
                    [Featured Piece {slot.slotNum}]
                  </h3>
                  <p className="mt-1 text-xs font-sans text-luxury-text-primary font-medium">
                    [Price Upon Request]
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
