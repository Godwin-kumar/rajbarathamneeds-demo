import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, AlertCircle, Sparkles, Tag, ChevronLeft } from 'lucide-react';
import { promotionService } from '../../services/promotionService';
import { productService } from '../../services/productService';
import { homepageService } from '../../services/homepageService';
import OfferBannerGallery from '../../components/offers/OfferBannerGallery';
import OfferInfo from '../../components/offers/OfferInfo';
import OfferTabs from '../../components/offers/OfferTabs';
import ProductCard from '../../components/home/ProductCard';

/**
 * RAJ BARATHAM NEEDS — Premium Flipkart-Inspired Special Offer Details Page
 * 
 * Architecture:
 * - Breadcrumb: Home > Special Offers > [Offer Title]
 * - 2-Column Main Section: Banner Gallery & Lightbox (Left) + Offer Info & Coupon Box (Right)
 * - Four Functional Information Tabs (Benefits, Redemption, Eligible Items, Terms)
 * - "Eligible Products on This Offer" Collection Grid
 * - "Explore More Special Offers" Horizontal Carousel
 * - Strict Luxury Palette: White (#FFFFFF), Ivory (#F8F4EB), Champagne Gold (#D4AF37)
 */
export const OfferDetails = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const productsSectionRef = useRef(null);
  const otherOffersScrollRef = useRef(null);

  const [promotion, setPromotion] = useState(null);
  const [allPromotions, setAllPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Scroll to top on load or offer change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [offerId]);

  useEffect(() => {
    let isMounted = true;

    const loadOfferData = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // 1. Fetch all promotions & products in parallel
        const [promoRes, allPromosRes, prodRes] = await Promise.all([
          promotionService.getPromotion(offerId),
          promotionService.getActivePromotions(),
          productService.getProducts(),
        ]);

        if (!isMounted) return;

        let activePromo = promoRes.data;

        // If direct single promo fetch didn't return or was not found, check the active list
        if (!activePromo && allPromosRes.data && allPromosRes.data.length > 0) {
          activePromo = allPromosRes.data.find(
            (p) =>
              String(p.id) === String(offerId) ||
              p.coupon_code?.toLowerCase() === String(offerId).toLowerCase() ||
              p.title?.toLowerCase().replace(/\s+/g, '-') === String(offerId).toLowerCase()
          );
        }

        // Check homepage data if still not found
        if (!activePromo) {
          const homeRes = await homepageService.getHomepageData();
          if (homeRes.data?.promotions) {
            activePromo = homeRes.data.promotions.find(
              (p) =>
                String(p.id) === String(offerId) ||
                p.coupon_code?.toLowerCase() === String(offerId).toLowerCase()
            );
          }
        }

        if (activePromo) {
          setPromotion(activePromo);
          setAllPromotions(allPromosRes.data || []);
          setProducts(prodRes.data || []);
          setLoading(false);
          return;
        }

        setNotFound(true);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load special offer details:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    loadOfferData();

    return () => {
      isMounted = false;
    };
  }, [offerId]);

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollOtherOffers = (direction) => {
    if (!otherOffersScrollRef.current) return;
    const scrollAmount = 360;
    otherOffersScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Other offers excluding current
  const otherOffers = allPromotions.filter((p) => String(p.id) !== String(promotion?.id));

  // ----------------------------------------------------
  // LOADING SKELETON
  // ----------------------------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-60 bg-[#F8F4EB] rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 aspect-[550/265] bg-[#F8F4EB] rounded-2xl animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-4 w-28 bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-12 w-48 bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-24 w-full bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-12 w-full bg-[#F8F4EB] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // OFFER NOT FOUND SCREEN
  // ----------------------------------------------------
  if (notFound || !promotion) {
    return (
      <main className="min-h-[70vh] bg-white flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-[#F8F4EB] border border-[#E9DFCE] p-8 sm:p-10 rounded-2xl shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <AlertCircle className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl text-[#241A12] font-semibold mb-2">
            Special Offer Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed mb-6">
            This promotional privilege may have expired or the link is no longer valid. Explore our other exclusive jewellery offers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E9DFCE] bg-white text-xs font-semibold text-[#241A12] hover:bg-[#F8F4EB] transition-colors"
            >
              Go Back
            </button>
            <Link
              to="/offers"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C49A24] text-xs font-semibold text-[#241A12] transition-colors shadow-2xs"
            >
              View Active Offers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // SPECIAL OFFER DETAILS RENDER
  // ----------------------------------------------------
  return (
    <main className="min-h-screen bg-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#76695C]">
            <li>
              <Link to="/" className="hover:text-[#D4AF37] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-[#E9DFCE]" />
            </li>
            <li>
              <Link to="/offers" className="hover:text-[#D4AF37] transition-colors">
                Special Offers
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-[#E9DFCE]" />
            </li>
            <li className="font-semibold text-[#241A12] truncate max-w-[200px] sm:max-w-xs" aria-current="page">
              {promotion.title}
            </li>
          </ol>
        </nav>

        {/* TWO-COLUMN MAIN OFFER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Banner & Gallery */}
          <div className="lg:col-span-6 xl:col-span-7">
            <OfferBannerGallery promotion={promotion} />
          </div>

          {/* RIGHT: Offer Information & Coupon Action Box */}
          <div className="lg:col-span-6 xl:col-span-5">
            <OfferInfo promotion={promotion} onScrollToProducts={scrollToProducts} />
          </div>

        </div>

        {/* FOUR PROMOTIONAL INFORMATION TABS */}
        <OfferTabs promotion={promotion} />

        {/* PRODUCTS ON THIS OFFER SECTION */}
        <section ref={productsSectionRef} className="mt-14 sm:mt-16 pt-10 border-t border-[#E9DFCE]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#76695C] font-semibold block mb-1">
                Curated Selection
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#241A12] font-normal leading-tight">
                Eligible Products on this Offer
              </h2>
            </div>
            <Link
              to="/#shop-by-category"
              className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] hover:text-[#C49A24] inline-flex items-center gap-1 transition-colors"
            >
              <span>Explore Entire Shop</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id || product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#F8F4EB] rounded-2xl border border-[#E9DFCE]">
              <p className="text-xs sm:text-sm text-[#76695C]">
                All jewellery pieces in our collection qualify for this special coupon discount.
              </p>
            </div>
          )}
        </section>

        {/* OTHER SPECIAL OFFERS CAROUSEL */}
        {otherOffers.length > 0 && (
          <section className="mt-14 sm:mt-16 pt-10 border-t border-[#E9DFCE]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#76695C] font-semibold block mb-1">
                  More Privileges
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#241A12] font-normal leading-tight">
                  Other Active Special Offers
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleScrollOtherOffers('left')}
                  aria-label="Previous offer"
                  className="w-8 h-8 rounded-full border border-[#E9DFCE] bg-white hover:bg-[#F8F4EB] text-[#241A12] flex items-center justify-center transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollOtherOffers('right')}
                  aria-label="Next offer"
                  className="w-8 h-8 rounded-full border border-[#E9DFCE] bg-white hover:bg-[#F8F4EB] text-[#241A12] flex items-center justify-center transition-colors shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={otherOffersScrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {otherOffers.map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => navigate(`/offers/${promo.id}`)}
                  className="shrink-0 w-[85vw] sm:w-[380px] md:w-[440px] aspect-[550/265] rounded-2xl overflow-hidden border border-[#E9DFCE] relative cursor-pointer group shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={promo.banner_image_url || promo.banner_url || '/images/products/temple_jewellery.jpg'}
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/images/products/temple_jewellery.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-between">
                    <span className="self-start text-[9px] uppercase tracking-wider font-bold bg-[#D4AF37] text-[#241A12] px-2.5 py-0.5 rounded-full">
                      {promo.badge_text || 'SPECIAL OFFER'}
                    </span>
                    <div>
                      <span className="text-lg font-bold font-sans text-white block">
                        {promo.formatted_discount || 'SPECIAL DISCOUNT'}
                      </span>
                      <h4 className="font-serif text-sm font-medium text-white line-clamp-1 mt-0.5">
                        {promo.title}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
};

export default OfferDetails;
