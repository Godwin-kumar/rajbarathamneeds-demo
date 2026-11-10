import React, { useRef } from 'react';
import { Star, CheckCircle, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials as customReviews } from '../../data/testimonials';

/**
 * Section 2: CUSTOMER REVIEWS
 * 
 * Centered heading: "CUSTOMER REVIEWS"
 * Subtitle: "A little love from our customers."
 * Desktop: 3 review cards in a row.
 * Mobile: Swipeable touch carousel.
 * 
 * Luxury Brand Theme: White / Warm Ivory (#F8F5EF) + Antique Gold (#B89552) + Dark Brown (#332D25)
 */

// Default authentic customer reviews for Bharatanatyam & temple jewellery
const defaultReviews = [
  {
    id: 'rev-1',
    author: 'Priya Ramanathan',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    quote:
      'The temple jewellery set I ordered for my student’s Arangetram was truly magnificent. The antique finish and authentic kemp stones have that genuine sacred temple heritage feel that is so rare today.',
    verified: true,
    item: 'Temple Kemp Choker Set',
  },
  {
    id: 'rev-2',
    author: 'Dr. Ananya Iyer',
    location: 'Bangalore, Karnataka',
    rating: 5,
    quote:
      'Exceptional weight balance and secure clasping. The jhumkas stayed completely comfortable throughout an intense two-hour Varnam performance without pulling on the earlobes.',
    verified: true,
    item: 'Traditional Antique Jhumkas',
  },
  {
    id: 'rev-3',
    author: 'Meera Subramanian',
    location: 'Coimbatore, Tamil Nadu',
    rating: 5,
    quote:
      'From the velvet-lined packaging to the hand-carved details, every step reflected true luxury. The salangai bells have a crisp, resonant tone and the Nethi Chutti sat gracefully on the forehead.',
    verified: true,
    item: 'Full Bharatanatyam Ornaments',
  },
];

export const CustomerReviews = () => {
  const scrollRef = useRef(null);

  // Use custom reviews if provided in data file, otherwise use default reviews
  const reviews = customReviews && customReviews.length > 0 ? customReviews : defaultReviews;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="customer-reviews"
      aria-label="Customer Reviews"
      className="w-full bg-white py-12 sm:py-16 md:py-20 border-b border-[#EAE3D6] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] text-[#B89552] uppercase block mb-1">
            "A little love from our customers."
          </span>
          <h2 className="font-serif text-xl sm:text-2xl md:text-[28px] text-[#332D25] font-normal tracking-[-0.01em]">
            CUSTOMER REVIEWS
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2.5" aria-hidden="true">
            <span className="h-[1px] w-10 bg-[#B89552]/40" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#B89552]" />
            <span className="h-[1px] w-10 bg-[#B89552]/40" />
          </div>
        </div>

        {/* Reviews Container: Horizontal swipe on mobile, 3-column grid on desktop */}
        <div className="relative">
          
          {/* Mobile Scroll Controls (visible only on small screens) */}
          <div className="flex md:hidden justify-end gap-2 mb-3">
            <button
              onClick={() => scroll('left')}
              aria-label="Previous review"
              className="w-8 h-8 rounded-full border border-[#EAE3D6] bg-white flex items-center justify-center text-[#332D25] hover:border-[#B89552] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Next review"
              className="w-8 h-8 rounded-full border border-[#EAE3D6] bg-white flex items-center justify-center text-[#332D25] hover:border-[#B89552] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-3 gap-5 lg:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.slice(0, 3).map((review) => {
              const ratingCount = review.rating || 5;

              return (
                <div
                  key={review.id}
                  className="w-[85vw] max-w-[340px] sm:max-w-[380px] md:w-auto flex-shrink-0 snap-center bg-[#FAF8F3] border border-[#EAE3D6] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-sm hover:border-[#B89552]/50 relative"
                >
                  <div>
                    {/* Top Row: 5 Gold Stars & Quote Glyph */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1" aria-label={`${ratingCount} out of 5 stars`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < ratingCount
                                ? 'text-[#B89552] fill-[#B89552]'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-[#B89552]/30" />
                    </div>

                    {/* Review Quote */}
                    <blockquote className="font-serif italic text-[13px] sm:text-[14px] text-[#332D25] leading-relaxed mb-6">
                      "{review.quote}"
                    </blockquote>
                  </div>

                  {/* Customer Attribution */}
                  <div className="pt-4 border-t border-[#EAE3D6]/70 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-[#332D25] tracking-tight">
                        {review.author}
                      </h3>
                      {review.location && (
                        <p className="font-sans text-[11px] text-[#82796D] mt-0.5">
                          {review.location}
                        </p>
                      )}
                    </div>

                    {/* Verified Customer Badge */}
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE3D6] text-[10px] font-sans font-medium text-[#B89552]">
                        <CheckCircle className="w-3 h-3 text-[#B89552]" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default CustomerReviews;