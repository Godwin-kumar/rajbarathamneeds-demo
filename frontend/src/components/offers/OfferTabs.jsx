import React, { useState } from 'react';
import { Tag, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

/**
 * Special Offer Information Tabs
 * - Offer Details & Benefits
 * - Step-by-Step How to Redeem
 * - Applicable Jewellery Collections
 * - Terms & Conditions
 */
export const OfferTabs = ({ promotion }) => {
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { id: 'details', label: 'Offer Benefits', icon: Sparkles },
    { id: 'redeem', label: 'How to Redeem', icon: CheckCircle2 },
    { id: 'eligible', label: 'Eligible Jewellery', icon: Tag },
    { id: 'terms', label: 'Terms & Conditions', icon: ShieldAlert },
  ];

  const discountText =
    promotion?.formatted_discount ||
    (promotion?.discount_type === 'PERCENTAGE'
      ? `${Number(promotion?.discount_value || 0)}% OFF`
      : `FLAT ₹${Number(promotion?.discount_value || 0).toLocaleString('en-IN')} OFF`);

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
        {/* 1. OFFER BENEFITS TAB */}
        {activeTab === 'details' && (
          <div className="space-y-4 text-[#241A12] animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-[#241A12]">
              Special Privilege Overview
            </h3>
            <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed">
              Celebrate timeless South Indian tradition with our exclusive seasonal privilege. Enjoy <strong className="text-[#241A12]">{discountText}</strong> on exquisite authentic temple jewellery creations, handcrafted by master artisans.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A12] mb-1">
                  Guaranteed Savings
                </h4>
                <p className="text-xs text-[#76695C] leading-relaxed">
                  Applicable instantly upon entering the voucher coupon code during checkout with no hidden charges.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A12] mb-1">
                  Complimentary Pan-India Shipping
                </h4>
                <p className="text-xs text-[#76695C] leading-relaxed">
                  Every order on this promotion qualifies for free insured domestic express dispatch across India.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. HOW TO REDEEM TAB */}
        {activeTab === 'redeem' && (
          <div className="space-y-4 text-[#241A12] animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-[#241A12]">
              Simple 4-Step Redemption Guide
            </h3>

            <ol className="space-y-3 pt-1 text-xs sm:text-sm text-[#76695C]">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#241A12] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-[#241A12] block">Copy the Coupon Voucher</strong>
                  <span>Click the "Copy Code" button above to copy <strong className="font-mono text-[#241A12]">{promotion?.coupon_code || 'the coupon code'}</strong> to your clipboard.</span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#241A12] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-[#241A12] block">Select Your Favourite Pieces</strong>
                  <span>Explore the eligible creations shown below and click "Add to Cart".</span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#241A12] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#241A12] block">Paste at Checkout</strong>
                  <span>During bag review or checkout, paste the coupon code in the voucher field to apply your discount.</span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]/80">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#241A12] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-[#241A12] block">Enjoy Temple Craftsmanship</strong>
                  <span>Your handcrafted piece is dispatched with certificate packaging and live AWB parcel tracking.</span>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* 3. ELIGIBLE JEWELLERY TAB */}
        {activeTab === 'eligible' && (
          <div className="space-y-4 text-[#241A12] animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-[#241A12]">
              Eligible Jewellery Categories
            </h3>
            <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed">
              This promotion applies across our signature traditional Indian temple jewellery collections:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                <span className="text-xs sm:text-sm font-medium text-[#241A12]">Temple Necklaces, Chokers &amp; Kasu Malai</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                <span className="text-xs sm:text-sm font-medium text-[#241A12]">Kemp Stone Jhumkas &amp; Chandbalis</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                <span className="text-xs sm:text-sm font-medium text-[#241A12]">Artisan Bangles, Kadas &amp; Vankis</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F4EB] border border-[#E9DFCE]">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                <span className="text-xs sm:text-sm font-medium text-[#241A12]">Classical Bharatanatyam Dance Jewellery Sets</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. TERMS & CONDITIONS TAB */}
        {activeTab === 'terms' && (
          <div className="space-y-4 text-[#241A12] animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-[#241A12]">
              Promotional Terms &amp; Guidelines
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-[#76695C]">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Offer is valid on eligible items while active stock lasts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Cannot be combined with any other coupon code or promotional voucher in a single order.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Discounts are calculated on the product selling price prior to applicable taxes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>Standard 7-day hassle-free replacement policy applies for damaged or defective items.</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferTabs;
