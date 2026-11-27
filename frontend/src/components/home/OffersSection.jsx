import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Copy, Check, Clock, ArrowRight } from 'lucide-react';
import { promotionService } from '../../services/promotionService';

/**
 * RAJ BARATHAM NEEDS — Flipkart-Style Special Offer Banner Cards
 * 
 * Exact Specifications:
 * - Card Dimensions (Desktop): 550px width × 265px height
 * - Aspect Ratio: Approximately 2.08:1 (550 / 265)
 * - Border Radius: 16px (rounded-[16px])
 * - Gap between cards: 30px (gap-[30px])
 * - Flex-shrink: 0 (shrink-0)
 * - Image occupies entire card (100% width, 100% height, object-fit: cover, no whitespace)
 * - Exactly 3 promotional offer cards arranged horizontally in a single row
 * - Responsive: desktop 550×265px, tablet horizontal scroll, mobile 2.08:1 scaled cards
 * - Theme: RAJ BARATHAM NEEDS Ivory (#F7F3EA) + Antique Gold (#B08B45) + Dark Brown (#382C20)
 */
export const OffersSection = ({ promotions: initialPromotions = [], isStandalonePage = false }) => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState(initialPromotions);
  const [loading, setLoading] = useState(!initialPromotions || initialPromotions.length === 0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const scrollContainerRef = useRef(null);
  const autoplayTimerRef = useRef(null);

  // Fallback image resolver matching local project assets if an offer lacks a URL
  const getOfferImage = (promo) => {
    if (promo.banner_image_url) return promo.banner_image_url;
    if (promo.banner_url) return promo.banner_url;
    if (promo.image) return promo.image;

    const titleLower = (promo.title || '').toLowerCase();
    if (titleLower.includes('necklace') || titleLower.includes('choker') || titleLower.includes('haram')) {
      return '/images/categories/necklaces.jpg';
    }
    if (titleLower.includes('bridal') || titleLower.includes('ruby') || titleLower.includes('kemp') || titleLower.includes('earring')) {
      return '/images/categories/earrings.jpg';
    }
    if (titleLower.includes('bangle') || titleLower.includes('valayal') || titleLower.includes('vanki')) {
      return '/images/categories/bangles.jpg';
    }
    if (titleLower.includes('pendant') || titleLower.includes('salangai') || titleLower.includes('bell')) {
      return '/images/categories/pendants.jpg';
    }
    return '/images/products/temple_jewellery.jpg';
  };

  // Format discount text cleanly from Django API response
  const getFormattedDiscount = (promo) => {
    if (promo.formatted_discount) return promo.formatted_discount;
    if (promo.discount_type === 'PERCENTAGE') {
      const val = Number(promo.discount_value);
      return `${val}% OFF`;
    }
    if (promo.discount_value) {
      const val = Number(promo.discount_value);
      return `FLAT ₹${val.toLocaleString('en-IN')} OFF`;
    }
    return 'EXCLUSIVE OFFER';
  };

  // Format end date for offer validity if available from backend
  const formatValidity = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return null;
    }
  };

  // Filter valid promotions (active, within schedule, clean of accidental placeholders)
  const filterValidPromotions = (list) => {
    const now = new Date();
    return (list || []).filter((promo) => {
      if (promo.is_active === false) return false;
      if (promo.start_date && new Date(promo.start_date) > now) return false;
      if (promo.end_date && new Date(promo.end_date) < now) return false;

      const title = (promo.title || '').trim().toLowerCase();
      if (['aaa', 'aa', '222', 'placeholder'].includes(title)) return false;

      return true;
    });
  };

  // Fetch promotions from Django API if initialPromotions was not supplied
  useEffect(() => {
    if (initialPromotions && initialPromotions.length > 0) {
      setPromotions(filterValidPromotions(initialPromotions));
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchPromos = async () => {
      setLoading(true);
      const res = await promotionService.getActivePromotions();
      if (!isMounted) return;

      if (res.data && res.data.length > 0) {
        setPromotions(filterValidPromotions(res.data));
      } else {
        setPromotions([]);
      }
      setLoading(false);
    };

    fetchPromos();
    return () => {
      isMounted = false;
    };
  }, [initialPromotions]);

  const validPromotions = useMemo(() => {
    return filterValidPromotions(promotions);
  }, [promotions]);

  // Display exactly 3 promotional offer cards in a single horizontal row
  const displayedCards = useMemo(() => {
    return validPromotions.slice(0, 3);
  }, [validPromotions]);

  // Track active scroll card index for indicator dots
  const handleScrollEvent = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActiveCardIndex(0);
      return;
    }
    const idx = Math.min(
      displayedCards.length - 1,
      Math.max(0, Math.round((scrollLeft / maxScroll) * (displayedCards.length - 1)))
    );
    setActiveCardIndex(idx);
  }, [displayedCards.length]);

  // Smooth scroll left / right
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollStep = 580; // 550px card + 30px gap
      const offset = direction === 'left' ? -scrollStep : scrollStep;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Scroll to specific card from indicator dot
  const scrollToCard = (index) => {
    if (scrollContainerRef.current) {
      const scrollStep = 580;
      scrollContainerRef.current.scrollTo({
        left: index * scrollStep,
        behavior: 'smooth',
      });
      setActiveCardIndex(index);
    }
  };

  // Autoplay gentle rightward scrolling every 5 seconds (pauses on hover)
  useEffect(() => {
    if (displayedCards.length <= 1 || isHovered) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      return;
    }

    autoplayTimerRef.current = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll > 10) {
        if (scrollLeft + 10 >= maxScroll) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 580, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [displayedCards.length, isHovered]);

  // Copy coupon handler with instant feedback
  const handleCopyCoupon = (e, code) => {
    e.preventDefault();
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Shop Now navigation handler opening individual Special Offer Details
  const handleShopNow = (e, promo) => {
    e.preventDefault();
    if (promo && promo.id) {
      navigate(`/offers/${promo.id}`);
      return;
    }
    const destination = promo.destination_link || '#shop-by-category';

    if (destination.startsWith('#')) {
      const targetElement = document.querySelector(destination);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      navigate(`/${destination}`);
    } else if (destination.startsWith('http://') || destination.startsWith('https://')) {
      window.open(destination, '_blank', 'noopener,noreferrer');
    } else {
      navigate(destination);
    }
  };

  return (
    <section
      id="special-offers"
      aria-label="Special Offers"
      className={`w-full bg-[#F7F3EA] border-b border-[#EDE5D8] overflow-hidden ${
        isStandalonePage ? 'py-10 sm:py-14 md:py-18' : 'py-6 sm:py-8 md:py-10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. SPECIAL OFFERS HEADING */}
        <div className="text-center mb-5 sm:mb-7 md:mb-8">
          <h2 className="font-serif text-lg xs:text-xl sm:text-2xl md:text-3xl text-[#382C20] font-normal tracking-[-0.01em]">
            Special Offers
          </h2>
          <div className="w-12 sm:w-16 h-[1.5px] bg-[#B08B45] mx-auto mt-2" aria-hidden="true" />
        </div>

        {/* 2. LOADING SKELETON */}
        {loading && (
          <div className="flex items-center justify-center gap-[30px] overflow-hidden py-2 animate-pulse">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="shrink-0 w-[85vw] sm:w-[480px] lg:w-[550px] aspect-[550/265] lg:h-[265px] rounded-[16px] bg-[#EDE5D8]/60"
              />
            ))}
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && displayedCards.length === 0 && (
          <div className="max-w-md mx-auto text-center py-8 px-4 bg-white border border-[#EDE5D8] rounded-[16px] shadow-2xs">
            <p className="font-serif text-sm sm:text-base text-[#382C20] font-medium mb-1">
              New Special Offers Coming Soon
            </p>
            <p className="font-sans text-[11px] sm:text-xs text-[#82796D] leading-relaxed">
              We are curating exclusive festive promotions. Please check back shortly for traditional jewellery privileges.
            </p>
          </div>
        )}

        {/* 4. FLIPKART-STYLE 550px × 265px BANNER CARDS IN A SINGLE HORIZONTAL ROW */}
        {!loading && displayedCards.length > 0 && (
          <div className="relative">

            {/* Desktop Navigation Arrows (Left & Right) */}
            {displayedCards.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  aria-label="Scroll previous offers"
                  className="hidden xl:flex absolute -left-3 2xl:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-[#EDE5D8] text-[#382C20] hover:text-[#B08B45] hover:border-[#B08B45] items-center justify-center shadow-md transition-all hover:scale-105 focus:outline-none"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2]" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  aria-label="Scroll next offers"
                  className="hidden xl:flex absolute -right-3 2xl:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 border border-[#EDE5D8] text-[#382C20] hover:text-[#B08B45] hover:border-[#B08B45] items-center justify-center shadow-md transition-all hover:scale-105 focus:outline-none"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2]" />
                </button>
              </>
            )}

            {/* Horizontal Row of Exactly 3 Banner Cards */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScrollEvent}
              className="flex items-center gap-[30px] overflow-x-auto hide-scrollbar scroll-smooth py-1 px-1 justify-start xl:justify-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayedCards.map((promo) => {
                const imageUrl = getOfferImage(promo);
                const discountText = getFormattedDiscount(promo);
                const validityText = formatValidity(promo.end_date);

                return (
                  <article
                    key={promo.id}
                    className="relative shrink-0 w-[85vw] sm:w-[480px] lg:w-[550px] aspect-[550/265] lg:h-[265px] rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-[#EDE5D8]/80 cursor-pointer"
                    onClick={(e) => handleShopNow(e, promo)}
                  >
                    {/* Background Jewellery Image: 100% width, 100% height, object-fit: cover, no whitespace */}
                    <img
                      src={imageUrl}
                      alt={promo.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/images/products/temple_jewellery.jpg';
                      }}
                    />

                    {/* Gradient Overlay for Crisp Text Readability & Brand Warmth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10 sm:to-transparent p-4 sm:p-6 lg:p-7 flex flex-col justify-between z-10">
                      
                      {/* Top Header: Badge & Validity */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-[#B08B45] text-white text-[9px] sm:text-[10.5px] font-sans font-semibold uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs">
                          {promo.badge_text || 'SPECIAL OFFER'}
                        </span>

                        {validityText && (
                          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10.5px] text-white/95 font-sans bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                            <Clock className="w-3 h-3 text-[#B08B45]" />
                            <span>{validityText}</span>
                          </span>
                        )}
                      </div>

                      {/* Middle/Bottom Content: Headline, Title, Description & Actions */}
                      <div className="max-w-[78%] sm:max-w-[70%]">
                        {/* Discount Highlight */}
                        <p className="text-lg sm:text-2xl lg:text-[26px] font-bold font-sans text-white tracking-tight leading-none drop-shadow-sm">
                          {discountText}
                        </p>

                        {/* Offer Title */}
                        <h3 className="font-serif text-sm sm:text-base lg:text-lg text-white font-medium leading-snug line-clamp-1 mt-1 sm:mt-1.5 drop-shadow-sm">
                          {promo.title}
                        </h3>

                        {/* Short Description */}
                        {promo.description && (
                          <p className="text-[11px] sm:text-xs text-white/85 font-sans line-clamp-1 sm:line-clamp-2 mt-1 leading-normal">
                            {promo.description}
                          </p>
                        )}

                        {/* Actions Row: SHOP NOW & Coupon Code */}
                        <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-2.5 sm:mt-3.5">
                          <button
                            type="button"
                            onClick={(e) => handleShopNow(e, promo)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#B08B45] hover:bg-[#967436] text-white text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-wider rounded-full transition-all duration-200 shadow-sm group-hover:bg-[#967436]"
                          >
                            <span>SHOP NOW</span>
                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                          </button>

                          {promo.coupon_code && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyCoupon(e, promo.coupon_code)}
                              title={`Copy coupon code: ${promo.coupon_code}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 sm:py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs border border-white/40 text-[9px] sm:text-[10px] font-mono text-white rounded-full transition-colors"
                            >
                              {copiedCode === promo.coupon_code ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="font-semibold text-emerald-300">COPIED</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-[#B08B45]" />
                                  <span>CODE: {promo.coupon_code}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  </article>
                );
              })}
            </div>

            {/* 5. CAROUSEL PAGINATION INDICATORS (Accessible across all screens) */}
            {displayedCards.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 sm:mt-5">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  aria-label="Previous offer"
                  className="w-7 h-7 rounded-full border border-[#EDE5D8] bg-white text-[#382C20] hover:text-[#B08B45] hover:border-[#B08B45] flex items-center justify-center transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2]" />
                </button>

                {/* Indicator Dots */}
                <div className="flex items-center gap-1.5">
                  {displayedCards.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToCard(idx)}
                      aria-label={`Go to offer card ${idx + 1}`}
                      className={`
                        h-1.5 rounded-full transition-all duration-300 focus:outline-none
                        ${idx === activeCardIndex ? 'w-5 bg-[#B08B45]' : 'w-1.5 bg-[#B08B45]/30 hover:bg-[#B08B45]/60'}
                      `}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  aria-label="Next offer"
                  className="w-7 h-7 rounded-full border border-[#EDE5D8] bg-white text-[#382C20] hover:text-[#B08B45] hover:border-[#B08B45] flex items-center justify-center transition-colors shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
};

export default OffersSection;