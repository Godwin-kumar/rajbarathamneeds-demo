import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import SectionHeading from '../common/SectionHeading';
import EmptyState from '../common/EmptyState';

/**
 * Section 7: Customer Testimonials
 * Alternates to Pure White background.
 * Displays carousel when reviews exist, or an elegant neutral empty state when awaiting reviews.
 */
export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      aria-label="Client Testimonials"
      className="py-16 md:py-24 bg-luxury-white border-b border-luxury-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Client Stories"
          title="Words of Appreciation"
          alignment="center"
        />

        {testimonials.length > 0 ? (
          <div className="relative max-w-3xl mx-auto px-4 sm:px-12">
            <div className="bg-luxury-ivory-light border border-luxury-border p-8 sm:p-12 text-center relative shadow-subtle">
              <Quote className="w-8 h-8 text-luxury-border mx-auto mb-4 opacity-70" />

              {/* Optional Rating Stars if rating property is provided */}
              {testimonials[currentIndex].rating && (
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < testimonials[currentIndex].rating
                          ? 'text-luxury-text-primary fill-current'
                          : 'text-luxury-border'
                      }`}
                    />
                  ))}
                </div>
              )}

              <blockquote className="font-serif text-lg sm:text-xl md:text-2xl text-luxury-text-primary italic leading-relaxed mb-6 font-normal">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              <div className="text-xs uppercase tracking-[0.2em] font-medium text-luxury-text-primary">
                {testimonials[currentIndex].author}
              </div>

              {testimonials[currentIndex].location && (
                <div className="text-[11px] text-luxury-text-secondary mt-1 tracking-wider">
                  {testimonials[currentIndex].location}
                </div>
              )}
            </div>

            {/* Navigation Arrows if > 1 review */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className="w-9 h-9 rounded-full border border-luxury-border flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-luxury-text-secondary tracking-widest font-sans">
                  {currentIndex + 1} / {testimonials.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className="w-9 h-9 rounded-full border border-luxury-border flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Neutral Empty State when review data is unavailable */
          <div className="max-w-2xl mx-auto">
            <EmptyState
              icon={<MessageSquare className="w-5 h-5 stroke-[1.25]" />}
              title="Client Reflections Awaiting Publication"
              description="Verified client testimonials and bespoke commission feedback will be highlighted here once verified reviews are configured."
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
