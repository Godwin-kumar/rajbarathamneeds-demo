import React, { useState } from 'react';
import { Sparkles, Shield, Truck, Star, Info } from 'lucide-react';

/**
 * Flipkart-Style Product Information Tabs
 * - Product Details (Material, specifications, weight)
 * - Care Instructions (Cleaning, storage, durability)
 * - Shipping Info (Domestic courier delivery, transit protection)
 * - Reviews (Verified customer thoughts or professional empty state)
 */
export const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { id: 'details', label: 'Product Details', icon: Info },
    { id: 'care', label: 'Care Instructions', icon: Sparkles },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
    { id: 'reviews', label: 'Customer Reviews', icon: Star },
  ];

  // Category name
  const categoryName =
    typeof product?.category === 'object' && product?.category !== null
      ? product?.category.name
      : product?.category || 'Traditional Jewellery';

  return (
    <div className="w-full bg-white border border-[#E9DFCE] rounded-2xl overflow-hidden shadow-2xs mt-10">
      {/* TABS HEADER */}
      <div className="flex items-center overflow-x-auto border-b border-[#E9DFCE] bg-[#F8F4EB]/50 px-2 sm:px-4 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap
                transition-all duration-200 border-b-2
                ${
                  isActive
                    ? 'border-[#D4AF37] text-[#241A12] bg-white font-bold shadow-2xs'
                    : 'border-transparent text-[#76695C] hover:text-[#241A12] hover:bg-white/60'
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#76695C]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TABS CONTENT BODY */}
      <div className="p-5 sm:p-8">
        {/* 1. PRODUCT DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="space-y-6 text-[#241A12] animate-fade-in">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#241A12] mb-2">
                Craftsmanship &amp; Heritage
              </h3>
              <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed">
                {product?.description || product?.short_description || 
                  'Each piece at RAJ BARATHAM NEEDS is meticulously fashioned by master South Indian artisans using time-honoured temple jewellery casting techniques. Designed to celebrate spiritual grace, classical dance, and auspicious celebrations.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E9DFCE]/60">
              <div className="p-3.5 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="text-[11px] uppercase tracking-wider text-[#76695C] font-semibold block">
                  Primary Material
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#241A12] mt-0.5 block">
                  Traditional Brass Alloy with 24K Micro Gold Polish
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="text-[11px] uppercase tracking-wider text-[#76695C] font-semibold block">
                  Stone Adornments
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#241A12] mt-0.5 block">
                  Authentic Kemp Stones &amp; Seed Pearls
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="text-[11px] uppercase tracking-wider text-[#76695C] font-semibold block">
                  Jewellery Classification
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#241A12] mt-0.5 block">
                  {categoryName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="text-[11px] uppercase tracking-wider text-[#76695C] font-semibold block">
                  Stock Reference (SKU)
                </span>
                <span className="text-xs sm:text-sm font-mono font-medium text-[#241A12] mt-0.5 block">
                  {product?.sku || 'RBN-JW-AUTH'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. CARE INSTRUCTIONS TAB */}
        {activeTab === 'care' && (
          <div className="space-y-4 text-[#241A12] animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-[#241A12]">
              Preserving Your Temple Jewellery
            </h3>
            <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed">
              Traditional micro-gold plated jewellery retains its divine luster for generations when cared for properly.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#76695C]">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong className="text-[#241A12]">Avoid Chemical Exposure:</strong> Apply cosmetics, perfumes, lotions, and hairsprays before wearing your jewellery.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong className="text-[#241A12]">Gentle Cleaning:</strong> After each use, wipe down with a soft, lint-free cotton cloth to remove perspiration and skin oils. Never use chemical dips or abrasive cleaners.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong className="text-[#241A12]">Airtight Storage:</strong> Store in individual airtight ziplock bags or velvet-lined boxes away from moisture and humidity.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0"></span>
                <span>
                  <strong className="text-[#241A12]">Keep Dry:</strong> Remove jewellery before swimming, bathing, or performing intense physical workouts.
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* 3. SHIPPING & RETURNS TAB */}
        {activeTab === 'shipping' && (
          <div className="space-y-4 text-[#241A12] animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-[#241A12]">
              Domestic Logistics &amp; Delivery Promise
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#241A12] mb-1">
                  Express Dispatch
                </h4>
                <p className="text-xs text-[#76695C] leading-relaxed">
                  In-stock pieces are dispatched within 24–48 hours from Tamil Nadu via verified courier partners (Blue Dart, DTDC, India Post Speed Post).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#241A12] mb-1">
                  Complimentary Shipping
                </h4>
                <p className="text-xs text-[#76695C] leading-relaxed">
                  We provide 100% Free Shipping on all domestic prepaid orders across India with live AWB parcel tracking updates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#241A12] mb-1">
                  Tamper-Evident Packaging
                </h4>
                <p className="text-xs text-[#76695C] leading-relaxed">
                  Every order is packed in a protective rigid jewellery box with tamper-evident security tape for complete transit peace of mind.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#241A12] mb-1">
                  7-Day Replacement Policy
                </h4>
                <p className="text-xs text-[#76695C] leading-relaxed">
                  In the rare event of transit damage or manufacturing discrepancy, contact our concierge within 7 days for a swift replacement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. CUSTOMER REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            {/* If product has actual reviews, render them; otherwise render elegant luxury empty state */}
            {Array.isArray(product?.reviews) && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-[#241A12]">{rev.author || 'Verified Buyer'}</span>
                      <span className="text-[11px] text-[#76695C]">{rev.date || 'Recent'}</span>
                    </div>
                    <div className="text-xs text-[#D4AF37] mb-1">
                      {'★'.repeat(rev.rating || 5)}
                    </div>
                    <p className="text-xs text-[#76695C] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-10 max-w-md mx-auto">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F8F4EB] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Star className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#241A12] mb-1">
                  No Reviews Yet
                </h4>
                <p className="text-xs text-[#76695C] leading-relaxed">
                  Be the first to share your experience with this handcrafted jewellery piece. Verified buyer reviews will be showcased here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
