import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, Headphones, Minus, Plus, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

/**
 * RAJ BARATHAM NEEDS — Luxury Product Information & Purchasing Component
 * 
 * Flipkart-style layout adapted to luxury jewellery:
 * - Category & Title
 * - Dynamic Pricing (INR ₹, strikethrough, discount %)
 * - Verified Stock / Made to Order state
 * - Quantity Selector with +/- buttons
 * - Prominent side-by-side equal-width "ADD TO CART" & "BUY NOW" action buttons
 * - Luxury Benefits Panel (Authenticity, Free Shipping, Easy Returns, Support)
 */
export const ProductInfo = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity, showNotification } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);

  // Category name
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : product.category || 'Traditional Jewellery';

  // Currency formatting (INR ₹)
  const formatINR = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    if (isNaN(num)) return val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Price calculations
  const hasDiscount =
    product.sale_price &&
    product.price &&
    Number(product.price) > Number(product.sale_price);

  const displayPrice = formatINR(hasDiscount ? product.sale_price : (product.price || product.sale_price));
  const originalPrice = hasDiscount ? formatINR(product.price) : null;
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
    : null;

  // Stock status
  const stockQty = product.stock_quantity;
  const isAvailable = stockQty === undefined || stockQty === null || Number(stockQty) > 0;

  // Quantity controls
  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    // Direct checkout navigation for Buy Now: pass selected product and quantity without cart duplication
    navigate(`/checkout?productId=${product.id}&quantity=${quantity}`, {
      state: {
        productId: product.id,
        quantity,
      },
    });
  };

  // Description text
  const descriptionText = product.short_description || product.description || 
    'Exquisitely handcrafted traditional jewellery piece featuring sacred heritage motifs and authentic South Indian craftsmanship.';

  return (
    <div className="flex flex-col space-y-5 sm:space-y-6">
      {/* 1. Category and Title */}
      <div>
        {categoryName && (
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#76695C] font-semibold mb-1">
            {categoryName}
          </span>
        )}
        <h1 className="font-serif text-2xl sm:text-3xl md:text-[32px] text-[#241A12] font-normal leading-tight tracking-tight">
          {product.name}
        </h1>
        {product.sku && (
          <p className="text-[11px] font-mono text-[#76695C] mt-1">
            SKU: <span className="font-semibold text-[#241A12]">{product.sku}</span>
          </p>
        )}
      </div>

      {/* 2. Rating & Reviews — ONLY if actual data is available */}
      {product.rating && (
        <div className="flex items-center gap-2 text-xs text-[#76695C]">
          <span className="inline-flex items-center gap-1 bg-[#F8F4EB] text-[#241A12] border border-[#E9DFCE] px-2 py-0.5 rounded font-semibold text-xs">
            ★ {Number(product.rating).toFixed(1)}
          </span>
          {product.review_count && (
            <span>({product.review_count} verified reviews)</span>
          )}
        </div>
      )}

      {/* 3. Pricing Section */}
      <div className="pt-2 pb-1 border-y border-[#E9DFCE]/80">
        <div className="flex items-baseline flex-wrap gap-2.5 sm:gap-3">
          {displayPrice ? (
            <>
              <span className="text-2xl sm:text-3xl font-sans font-bold text-[#241A12] tracking-tight">
                {displayPrice}
              </span>
              {originalPrice && (
                <span className="text-sm sm:text-base font-sans text-[#76695C] line-through">
                  {originalPrice}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs sm:text-sm font-sans font-bold text-[#D4AF37] bg-[#F8F4EB] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  {discountPercent}% OFF
                </span>
              )}
            </>
          ) : (
            <span className="text-base font-serif text-[#76695C]">Price Upon Request</span>
          )}
        </div>
        <p className="text-[11px] text-[#76695C] mt-1">Inclusive of all taxes. Free shipping across India.</p>
      </div>

      {/* 4. Stock & Made to Order Status */}
      <div className="flex items-center gap-2">
        {isAvailable ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            In Stock — Ready to Dispatch
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F4EB] text-amber-900 border border-[#D4AF37]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            Made to Order (Crafted with Care)
          </span>
        )}
      </div>

      {/* 5. Product Overview Description */}
      <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed line-clamp-3">
        {descriptionText}
      </p>

      {/* 6. Quantity Selector */}
      <div className="pt-2">
        <label className="block text-[11px] uppercase tracking-wider text-[#241A12] font-semibold mb-2">
          Quantity
        </label>
        <div className="inline-flex items-center border border-[#E9DFCE] rounded-xl bg-white shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-10 h-10 flex items-center justify-center text-[#241A12] hover:bg-[#F8F4EB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-[#241A12] select-none font-mono">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            aria-label="Increase quantity"
            className="w-10 h-10 flex items-center justify-center text-[#241A12] hover:bg-[#F8F4EB] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7. Action Shopping Buttons: [ 🛍 ADD TO CART ]  [ ⚡ BUY NOW ] */}
      <div className="pt-2 grid grid-cols-2 gap-3 sm:gap-4">
        {/* ADD TO CART */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-6 py-3.5 sm:py-4 bg-[#D4AF37] hover:bg-[#C49A24] active:bg-[#B58C1F] text-[#241A12] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] shrink-0 text-[#241A12]" />
          <span className="truncate">Add to Cart</span>
        </button>

        {/* BUY NOW */}
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-6 py-3.5 sm:py-4 bg-[#241A12] hover:bg-black active:bg-neutral-900 text-[#F8F4EB] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] fill-[#D4AF37] text-[#D4AF37] shrink-0" />
          <span className="truncate">Buy Now</span>
        </button>
      </div>

      {/* 7b. Wishlist Quick Action */}
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
          isFavorited
            ? 'bg-[#F8F4EB] border-[#D4AF37] text-[#AD873D]'
            : 'bg-white border-[#E9DFCE] text-[#76695C] hover:border-[#AD873D] hover:text-[#241A12]'
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#AD873D] text-[#AD873D]' : 'stroke-[1.8]'}`} />
        <span>{isFavorited ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
      </button>

      {/* 8. Luxury Benefits Panel */}
      <div className="mt-6 pt-5 border-t border-[#E9DFCE] grid grid-cols-2 gap-3 sm:gap-4 bg-[#F8F4EB] p-4 rounded-2xl border border-[#E9DFCE]">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-[#D4AF37] border border-[#E9DFCE] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#241A12]">100% Authentic</h4>
            <p className="text-[10.5px] text-[#76695C] leading-tight mt-0.5">Heritage temple craft</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-[#D4AF37] border border-[#E9DFCE] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Truck className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#241A12]">Free Shipping</h4>
            <p className="text-[10.5px] text-[#76695C] leading-tight mt-0.5">Across all India</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-[#D4AF37] border border-[#E9DFCE] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <RotateCcw className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#241A12]">Easy Returns</h4>
            <p className="text-[10.5px] text-[#76695C] leading-tight mt-0.5">7-day replacement</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-[#D4AF37] border border-[#E9DFCE] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Headphones className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#241A12]">Artisan Support</h4>
            <p className="text-[10.5px] text-[#76695C] leading-tight mt-0.5">Dedicated concierge</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
