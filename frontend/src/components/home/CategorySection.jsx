
import React from 'react';

export const CategorySection = ({
  categories = [],
  selectedCategoryId = 'all',
  onSelectCategory = () => {},
  loading = false,
}) => {
  const allCategoryItem = {
    id: 'all',
    slug: 'all',
    name: 'ALL',
  };

  const displayCategories = [
    allCategoryItem,
    ...categories.filter((cat) => String(cat.id) !== 'all'),
  ];

  return (
    <section
      id="shop-by-category"
      aria-label="Shop by Category"
      className="w-full bg-[#F8F3E9] pt-3 pb-1 border-b border-[#EAE1D2]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADING */}
<div className="mb-0">
  <h2 className="text-2xl sm:text-3xl font-serif text-[#29231D] text-center leading-tight mb-1">
    Shop by Category
  </h2>

  <p className="text-sm sm:text-base text-[#766A59] text-left leading-tight mt-3 mb-2">
    Explore Our Jewellery Collections
  </p>
</div>

        {/* CATEGORY NAMES */}
        {loading ? (
          <div className="flex justify-start gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="w-14 h-3 bg-[#EFE5D5] rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className="flex items-center justify-start gap-6 sm:gap-9 overflow-x-auto py-1 hide-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {displayCategories.map((category) => {
              const isAll = category.id === 'all';

              const isSelected = isAll
                ? selectedCategoryId === 'all'
                : String(selectedCategoryId) === String(category.id) ||
                  selectedCategoryId === category.slug;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    onSelectCategory(
                      isAll ? 'all' : category.id,
                      category.name
                    )
                  }
                  aria-pressed={isSelected}
                  className={`
                    flex-shrink-0 whitespace-nowrap
                    text-xs sm:text-sm tracking-wide
                    border-b-2 pb-1
                    transition-colors duration-200
                    ${
                      isSelected
                        ? 'font-semibold text-[#A78343] border-[#C6A15B]'
                        : 'font-medium text-[#29231D] border-transparent hover:text-[#A78343] hover:border-[#C6A15B]'
                    }
                  `}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default CategorySection;
