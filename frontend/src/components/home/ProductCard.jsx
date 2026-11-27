
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

/**
 * RAJ BARATHAM NEEDS
 * Flipkart-Style Luxury Jewellery Product Card
 *
 * Backend image fields:
 * product.main_image
 * product.side_images[].image_url
 */

export const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);

  // Wishlist
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);
  };

  // ======================================================
  // PRODUCT IMAGE RESOLVER - DJANGO API COMPATIBLE
  // ======================================================

  const getProductImage = () => {
    // 1. Main image from Django backend
    if (
      typeof product.main_image === 'string' &&
      product.main_image.trim() !== ''
    ) {
      return product.main_image;
    }

    // 2. First side image from Django backend
    if (
      Array.isArray(product.side_images) &&
      product.side_images.length > 0
    ) {
      const firstSideImage = product.side_images[0]?.image_url;

      if (firstSideImage) {
        return firstSideImage;
      }
    }

    // 3. Support older API image fields if present
    if (product.primary_image?.card_url) {
      return product.primary_image.card_url;
    }

    if (product.primary_image?.image_url) {
      return product.primary_image.image_url;
    }

    if (typeof product.primary_image === 'string') {
      return product.primary_image;
    }

    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      return firstImage?.card_url || firstImage?.image_url || null;
    }

    if (product.image) {
      return product.image;
    }

    // 4. Category-based fallback
    const catSlug = (
      (
        typeof product.category === 'object'
          ? product.category?.slug || product.category?.name
          : product.category
      ) || ''
    ).toLowerCase();

    if (
      catSlug.includes('necklace') ||
      catSlug.includes('haram') ||
      catSlug.includes('choker')
    ) {
      return '/images/categories/necklaces.jpg';
    }

    if (
      catSlug.includes('earring') ||
      catSlug.includes('jhumka')
    ) {
      return '/images/categories/earrings.jpg';
    }

    if (
      catSlug.includes('bangle') ||
      catSlug.includes('valayal') ||
      catSlug.includes('bracelet')
    ) {
      return '/images/categories/bangles.jpg';
    }

    if (catSlug.includes('pendant')) {
      return '/images/categories/pendants.jpg';
    }

    if (
      catSlug.includes('dance') ||
      catSlug.includes('salangai')
    ) {
      return '/images/products/salangai.jpg';
    }

    // 5. Final fallback
    return '/images/products/temple_jewellery.jpg';
  };

  const imageUrl = getProductImage();

  // ======================================================
  // CATEGORY
  // ======================================================

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : product.category || null;

  // ======================================================
  // PRICE FORMATTING
  // ======================================================

  const formatINR = (val) => {
    if (val === null || val === undefined || val === '') {
      return null;
    }

    const num = Number(val);

    if (isNaN(num)) {
      return val;
    }

    return `₹${num.toLocaleString('en-IN')}`;
  };

  const hasDiscount =
    product.sale_price &&
    product.price &&
    Number(product.price) > Number(product.sale_price);

  const displayPrice = formatINR(
    hasDiscount
      ? product.sale_price
      : product.price || product.sale_price
  );

  const originalPrice = hasDiscount
    ? formatINR(product.price)
    : null;

  const discountPercent = hasDiscount
    ? Math.round(
        (
          (Number(product.price) - Number(product.sale_price)) /
          Number(product.price)
        ) * 100
      )
    : null;

  // ======================================================
  // STOCK STATUS
  // ======================================================

  const stockQty = product.stock_quantity;

  const isAvailable =
    stockQty === undefined ||
    stockQty === null ||
    Number(stockQty) > 0;

  // ======================================================
  // PRODUCT URL
  // ======================================================

  const productUrl = `/products/${product.id || product.slug}`;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <article className="group relative flex flex-col h-full bg-white border border-[#E8DFD0] rounded-[14px] p-2 sm:p-2.5 md:p-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#AD873D]/50 transition-all duration-300">

      <Link
        to={productUrl}
        className="flex flex-col h-full focus:outline-none"
      >

        {/* PRODUCT IMAGE CONTAINER */}

        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden bg-[#ffffff] p-0 m-0 box-border flex items-center justify-center">

          {/* WISHLIST HEART */}

          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={
              isFavorited
                ? 'Remove from wishlist'
                : 'Add to wishlist'
            }
            className={`
              absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full
              bg-white/95 border border-[#E8DFD0]/80 shadow-2xs
              flex items-center justify-center transition-transform duration-200
              hover:scale-110 active:scale-95
              ${
                isFavorited
                  ? 'text-[#AD873D]'
                  : 'text-[#33291E]/70 hover:text-[#AD873D]'
              }
            `}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isFavorited
                  ? 'fill-[#AD873D] text-[#AD873D]'
                  : 'stroke-[1.6]'
              }`}
            />
          </button>

          {/* PRODUCT IMAGE */}

          <img
            src={imageUrl}
            alt={product.name || 'Temple Jewellery Creation'}
            loading="lazy"
            className="block w-full h-full p-0 m-0 object-contain object-center rounded-[12px] transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                '/images/products/temple_jewellery.jpg';
            }}
          />

        </div>

        {/* PRODUCT INFORMATION */}

        <div className="pt-2 sm:pt-2.5 pb-0.5 px-0.5 flex flex-col flex-grow justify-between">

          <div>

            {/* CATEGORY */}

            {categoryName && (
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#766A59] font-sans line-clamp-1 mb-0.5">
                {categoryName}
              </p>
            )}

            {/* PRODUCT NAME */}

            <h3 className="font-serif text-xs sm:text-[13.5px] md:text-sm text-[#33291E] font-medium leading-snug line-clamp-1 sm:line-clamp-2 group-hover:text-[#AD873D] transition-colors duration-200">
              {product.name}
            </h3>

          </div>

          {/* PRICE AND AVAILABILITY */}

          <div className="mt-1.5 sm:mt-2">

            {/* PRICE ROW */}

            <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5 leading-none">

              {displayPrice ? (
                <>
                  <span className="text-xs sm:text-[13.5px] md:text-sm font-sans font-bold text-[#33291E]">
                    {displayPrice}
                  </span>

                  {originalPrice && (
                    <span className="text-[10px] sm:text-[11px] font-sans text-stone-400 line-through">
                      {originalPrice}
                    </span>
                  )}

                  {discountPercent && (
                    <span className="text-[9.5px] sm:text-[10.5px] font-sans font-semibold text-[#AD873D]">
                      {discountPercent}% off
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] sm:text-xs font-sans text-[#766A59]">
                  Price Upon Request
                </span>
              )}

            </div>

            {/* STOCK STATUS & QUICK ADD TO BAG */}

            <div className="mt-2 flex items-center justify-between gap-1">

              {!isAvailable ? (
                <span className="inline-block text-[8px] sm:text-[9px] font-sans font-medium text-amber-800 bg-[#F5F0E6] px-1.5 py-0.5 rounded-2xs">
                  Made to Order
                </span>
              ) : (
                <span className="inline-block text-[8px] sm:text-[9px] font-sans font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-2xs">
                  In Stock
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                title="Add to Shopping Bag"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#292522] text-white hover:bg-[#D4AF37] hover:text-[#241A12] text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-2xs"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Add</span>
              </button>

            </div>

          </div>

        </div>

      </Link>

    </article>
  );
};

export default ProductCard;
