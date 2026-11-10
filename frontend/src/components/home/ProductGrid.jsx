import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

/**
 * Responsive Product Grid & Working Pagination for RAJ BARATHAM NEEDS
 * 
 * Exact Layout Specifications:
 * - Mobile: 3 columns × 3 rows = 9 products per page
 * - Tablet: 3 columns × 3 rows = 9 products per page
 * - Desktop: 4 columns × 3 rows = 12 products per page
 * - Large Desktop: 4 columns × 3 rows = 12 products per page
 * 
 * Features:
 * - Responsive screen detection dynamically switching between 9 and 12 items per page
 * - Working Previous, Next, and Page Number buttons
 * - Returns to Page 1 on category/filter change
 * - Smooth scroll to top of collection when changing pages
 * - Dynamic product count calculation without item duplication or loss
 */
export const ProductGrid = ({
  products = [],
  selectedCategoryName = 'ALL',
  selectedCategoryId = 'all',
  searchQuery = '',
  loading = false,
  error = null,
}) => {
  // Screen size detection: Desktop/Large Desktop (>= 1024px) vs Mobile/Tablet (< 1024px)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Exact pagination rules: 12 on Desktop / 9 on Mobile & Tablet
  const itemsPerPage = isDesktop ? 12 : 9;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Return to page 1 whenever category or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryName, selectedCategoryId, searchQuery]);

  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Clamping check on screen resize to avoid out-of-range pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Compute products for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentProducts = useMemo(() => {
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, startIndex, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);

    // Smooth scroll to top of product grid
    const target = document.getElementById('product-collection');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate pagination number list (e.g. 1, 2, 3...)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <section
      id="product-collection"
      aria-label="Jewellery Products Collection"
      className="w-full bg-[#FFFFFF] pt-2 pb-8 sm:pt-3 sm:pb-10"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Error State */}
        {error && (
          <div className="p-8 text-center bg-[#FAF7F2] border border-[#EAE3D6] max-w-lg mx-auto">
            <p className="font-serif text-lg text-[#29231D] mb-2">Unable to Load Collection</p>
            <p className="text-xs text-[#766A59] leading-relaxed">
              We encountered a temporary issue connecting to the catalogue. Please refresh or try again in a moment.
            </p>
          </div>
        )}

        {/* Loading Skeletons matching exact layout */}
        {loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E8DFD0] rounded-[14px] p-2 sm:p-2.5 md:p-3 flex flex-col animate-pulse"
              >
                <div className="aspect-square bg-stone-100 rounded-[12px] w-full mb-2 sm:mb-2.5" />
                <div className="h-2.5 bg-[#EFE5D5] w-1/3 mb-1.5 rounded" />
                <div className="h-3.5 bg-[#EFE5D5] w-3/4 mb-1.5 rounded" />
                <div className="h-2.5 bg-[#EFE5D5] w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Product Grid: 2 cols Mobile / 3 cols Tablet / 4 cols Desktop */}
        {!loading && !error && currentProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}

        {/* Empty Collection State */}
        {!loading && !error && totalItems === 0 && (
          <div className="py-14 sm:py-16 px-6 text-center bg-[#FAF7F2] border border-[#EAE3D6] max-w-xl mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-[#C6A15B]/50 flex items-center justify-center text-[#A78343]">
              <span className="font-serif text-xl">✧</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl text-[#29231D] mb-2">
              No products available in this collection yet
            </h3>
            <p className="text-xs text-[#766A59] max-w-md mx-auto leading-relaxed">
              Our artisans are currently crafting new authentic creations for this category.
              Please explore our other collections or check back soon.
            </p>
          </div>
        )}

        {/* Luxury Gold & Ivory Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 sm:mt-14 pt-8 border-t border-[#EAE1D2] flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Page info caption */}
            <p className="text-[11px] sm:text-xs text-[#766A59] tracking-wider uppercase order-2 sm:order-1">
              Page <span className="font-semibold text-[#29231D]">{currentPage}</span> of{' '}
              <span className="font-semibold text-[#29231D]">{totalPages}</span>
            </p>

            {/* Pagination Navigation Buttons */}
            <nav
              aria-label="Product pagination"
              className="inline-flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2"
            >
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className={`
                  inline-flex items-center justify-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xs border text-xs font-medium tracking-wider uppercase transition-all duration-200
                  ${
                    currentPage === 1
                      ? 'bg-[#FAF7F2] text-[#B8AE9F] border-[#E5D7C2] cursor-not-allowed opacity-50'
                      : 'bg-white text-[#29231D] border-[#EAE1D2] hover:border-[#C6A15B] hover:text-[#A78343] hover:bg-[#FDFBF6] shadow-xs'
                  }
                `}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1 stroke-[2]" />
                <span className="hidden xs:inline">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              {getPageNumbers().map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      min-w-[32px] sm:min-w-[38px] h-8 sm:h-9 px-2 rounded-xs border text-xs font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-[#29231D] text-white border-[#29231D] shadow-xs font-semibold'
                          : 'bg-white text-[#29231D] border-[#EAE1D2] hover:border-[#C6A15B] hover:text-[#A78343] hover:bg-[#FDFBF6]'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className={`
                  inline-flex items-center justify-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xs border text-xs font-medium tracking-wider uppercase transition-all duration-200
                  ${
                    currentPage === totalPages
                      ? 'bg-[#FAF7F2] text-[#B8AE9F] border-[#E5D7C2] cursor-not-allowed opacity-50'
                      : 'bg-white text-[#29231D] border-[#EAE1D2] hover:border-[#C6A15B] hover:text-[#A78343] hover:bg-[#FDFBF6] shadow-xs'
                  }
                `}
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 stroke-[2]" />
              </button>
            </nav>

          </div>
        )}

      </div>
    </section>
  );
};

export default ProductGrid;
