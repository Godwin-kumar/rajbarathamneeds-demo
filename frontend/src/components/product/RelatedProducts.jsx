import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '../home/ProductCard';

/**
 * "You May Also Like" Related Products Section
 * - Horizontal carousel with navigation arrows
 * - Excludes currently viewed product
 * - "View All" link directing to Shop by Category
 * - Consistent with luxury theme: White, Ivory, Champagne Gold
 */
export const RelatedProducts = ({ products = [], currentProductId }) => {
  const scrollRef = useRef(null);

  // Filter out currently active product
  const related = products.filter(
    (p) => String(p.id) !== String(currentProductId) && p.slug !== currentProductId
  );

  if (!related || related.length === 0) return null;

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full mt-14 sm:mt-16 pt-10 border-t border-[#E9DFCE]">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
        <div>
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#76695C] font-semibold block mb-1">
            Handcrafted Suggestions
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#241A12] font-normal leading-tight">
            You May Also Like
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/#shop-by-category"
            className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] hover:text-[#C49A24] inline-flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full border border-[#E9DFCE] bg-white hover:bg-[#F8F4EB] text-[#241A12] flex items-center justify-center transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full border border-[#E9DFCE] bg-white hover:bg-[#F8F4EB] text-[#241A12] flex items-center justify-center transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL CONTAINER */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {related.slice(0, 10).map((product) => (
          <div
            key={product.id || product.slug}
            className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[260px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
