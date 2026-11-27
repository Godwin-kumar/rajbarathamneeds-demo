import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Tag, ShieldCheck, Truck, RotateCcw, Sparkles, ArrowDown, Gift } from 'lucide-react';
import { useCart } from '../../context/CartContext';

/**
 * RAJ BARATHAM NEEDS — Special Offer Purchasing & Information Panel
 * 
 * Includes:
 * - Offer Category / Privilege Tag
 * - Dynamic Title & Headline
 * - High-Impact Discount Presentation
 * - Interactive Coupon Code Copy Box with instant visual feedback
 * - "SHOP THIS OFFER" CTA scrolling smoothly to eligible jewellery
 * - Luxury Benefits Panel
 */
export const OfferInfo = ({ promotion, onScrollToProducts }) => {
  const [copied, setCopied] = useState(false);
  const { showNotification } = useCart();

  if (!promotion) return null;

  const handleCopyCode = () => {
    if (!promotion.coupon_code) return;
    navigator.clipboard?.writeText(promotion.coupon_code);
    setCopied(true);
    showNotification(`Coupon code "${promotion.coupon_code}" copied to clipboard!`);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const discountText =
    promotion.formatted_discount ||
    (promotion.discount_type === 'PERCENTAGE'
      ? `${Number(promotion.discount_value || 0)}% OFF`
      : promotion.discount_value
      ? `FLAT ₹${Number(promotion.discount_value).toLocaleString('en-IN')} OFF`
      : 'EXCLUSIVE DISCOUNT');

  return (
    <div className="flex flex-col space-y-5 sm:space-y-6">
      {/* 1. Header & Badge */}
      <div>
        <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#76695C] font-semibold mb-1">
          {promotion.badge_text || 'FESTIVE PRIVILEGE'}
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-[32px] text-[#241A12] font-normal leading-tight tracking-tight">
          {promotion.title}
        </h1>
      </div>

      {/* 2. Large Discount Showcase */}
      <div className="pt-2 pb-3 border-y border-[#E9DFCE]/80">
        <div className="flex items-baseline flex-wrap gap-2.5 sm:gap-3">
          <span className="text-3xl sm:text-4xl font-sans font-bold text-[#241A12] tracking-tight">
            {discountText}
          </span>
          <span className="text-xs sm:text-sm font-sans font-semibold text-[#D4AF37] bg-[#F8F4EB] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
            Limited Period
          </span>
        </div>
        <p className="text-[11px] text-[#76695C] mt-1.5">
          Applicable on selected handcrafted temple jewellery creations. Free Pan-India insured delivery.
        </p>
      </div>

      {/* 3. Description */}
      {promotion.description && (
        <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed">
          {promotion.description}
        </p>
      )}

      {/* 4. Interactive Coupon Code Box */}
      {promotion.coupon_code && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F4EB] border-2 border-dashed border-[#D4AF37] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#241A12] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Exclusive Coupon Code</span>
            </span>
            <span className="text-[10.5px] text-[#76695C] font-medium">Click to copy</span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-[#E9DFCE]">
            <span className="font-mono text-base sm:text-lg font-bold text-[#241A12] tracking-wider select-all pl-1">
              {promotion.coupon_code}
            </span>

            <button
              type="button"
              onClick={handleCopyCode}
              aria-label={`Copy coupon code ${promotion.coupon_code}`}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
                ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] shadow-2xs'
                }
              `}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-[#76695C] mt-2">
            Apply this voucher code at checkout to claim your verified discount.
          </p>
        </div>
      )}

      {/* 5. Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-3">
        <button
          type="button"
          onClick={onScrollToProducts}
          className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 bg-[#D4AF37] hover:bg-[#C49A24] active:bg-[#B58C1F] text-[#241A12] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          <span>Shop Products on This Offer</span>
          <ArrowDown className="w-4 h-4 stroke-[2.5]" />
        </button>

        <Link
          to="/offers"
          className="sm:w-auto px-5 py-3.5 sm:py-4 rounded-xl border-2 border-[#E9DFCE] bg-white hover:bg-[#F8F4EB] hover:border-[#D4AF37] text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#241A12] flex items-center justify-center gap-2 transition-all duration-200"
        >
          <span>All Offers</span>
        </Link>
      </div>

      {/* 6. Luxury Benefits Panel */}
      <div className="mt-6 pt-5 border-t border-[#E9DFCE] grid grid-cols-2 gap-3 sm:gap-4 bg-[#F8F4EB] p-4 rounded-2xl border border-[#E9DFCE]">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-[#D4AF37] border border-[#E9DFCE] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Gift className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#241A12]">Verified Discount</h4>
            <p className="text-[10.5px] text-[#76695C] leading-tight mt-0.5">Guaranteed voucher</p>
          </div>
        </div>

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
            <p className="text-[10.5px] text-[#76695C] leading-tight mt-0.5">Pan-India express</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-[#D4AF37] border border-[#E9DFCE] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <RotateCcw className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#241A12]">Easy 7-Day Returns</h4>
            <p className="text-[10.5px] text-[#76695C] leading-tight mt-0.5">Hassle-free exchange</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferInfo;
