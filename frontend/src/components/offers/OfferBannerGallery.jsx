import React, { useState } from 'react';
import { ZoomIn, X, Clock, Sparkles } from 'lucide-react';

/**
 * Luxury Promotional Offer Banner & Lightbox Gallery
 * - High-resolution banner presentation with 2.08:1 proportions
 * - Click-to-zoom fullscreen lightbox
 * - Gold accents, ivory borders, no prohibited colors
 */
export const OfferBannerGallery = ({ promotion }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fallback image resolver matching local project assets
  const getBannerUrl = (promo) => {
    if (!promo) return '/images/products/temple_jewellery.jpg';
    if (promo.banner_image_url) return promo.banner_image_url;
    if (promo.banner_url) return promo.banner_url;
    if (promo.image) return promo.image;

    const titleLower = (promo.title || '').toLowerCase();
    if (titleLower.includes('necklace') || titleLower.includes('choker') || titleLower.includes('haram')) {
      return '/images/categories/necklaces.jpg';
    }
    if (titleLower.includes('earring') || titleLower.includes('jhumka') || titleLower.includes('ruby')) {
      return '/images/categories/earrings.jpg';
    }
    if (titleLower.includes('bangle') || titleLower.includes('valayal')) {
      return '/images/categories/bangles.jpg';
    }
    if (titleLower.includes('pendant') || titleLower.includes('salangai')) {
      return '/images/categories/pendants.jpg';
    }
    return '/images/products/temple_jewellery.jpg';
  };

  const bannerUrl = getBannerUrl(promotion);

  // Format discount highlight
  const discountText =
    promotion?.formatted_discount ||
    (promotion?.discount_type === 'PERCENTAGE'
      ? `${Number(promotion?.discount_value || 0)}% OFF`
      : promotion?.discount_value
      ? `FLAT ₹${Number(promotion?.discount_value).toLocaleString('en-IN')} OFF`
      : 'SPECIAL OFFER');

  // Format validity
  const formatValidity = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const validityText = formatValidity(promotion?.end_date);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* MAIN BANNER CONTAINER */}
      <div className="relative w-full aspect-[550/265] sm:aspect-[16/9] md:aspect-[550/265] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E9DFCE] shadow-sm group">
        <img
          src={bannerUrl}
          alt={promotion?.title || 'Special Promotional Offer'}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
          onError={(e) => {
            e.currentTarget.src = '/images/products/temple_jewellery.jpg';
          }}
        />

        {/* Gradient Overlay for Crisp Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] text-[#241A12] shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{promotion?.badge_text || 'EXCLUSIVE PRIVILEGE'}</span>
            </span>

            {validityText && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/95 font-medium bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Valid till {validityText}</span>
              </span>
            )}
          </div>

          {/* Bottom Heading preview */}
          <div>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold font-sans text-white tracking-tight drop-shadow-sm">
              {discountText}
            </span>
          </div>
        </div>

        {/* Zoom trigger button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Enlarge promotional banner"
          className="absolute bottom-4 right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-[#E9DFCE] text-[#241A12] hover:text-[#D4AF37] hover:border-[#D4AF37] shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ZoomIn className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.8]" />
        </button>
      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#241A12]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close zoomed view"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={bannerUrl}
              alt={promotion?.title || 'Special Offer Banner'}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/15"
              onError={(e) => {
                e.currentTarget.src = '/images/products/temple_jewellery.jpg';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferBannerGallery;
