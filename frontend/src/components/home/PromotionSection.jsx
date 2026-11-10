import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../common/SectionHeading';
import ImagePlaceholder from '../common/ImagePlaceholder';

/**
 * Section: Curated Privileges & Promotions
 * Displays active promotional campaigns fetched dynamically from Django backend.
 */
export const PromotionSection = ({ promotions = [] }) => {
  if (!promotions || promotions.length === 0) {
    return null; // Gracefully bypasses when no campaigns are scheduled in Django
  }

  return (
    <section
      aria-label="Exclusive Privileges"
      className="py-16 md:py-24 bg-luxury-ivory-light border-b border-luxury-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Privileges & Special Inquiries"
          title="Exclusive Privileges"
          alignment="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {promotions.map((promo) => {
            const discountLabel =
              promo.discount_type === 'PERCENTAGE'
                ? `${Number(promo.discount_value)}% Privilege`
                : `₹${Number(promo.discount_value).toLocaleString('en-IN')} Privilege`;

            return (
              <div
                key={promo.id}
                className="bg-luxury-white border border-luxury-border p-8 md:p-10 flex flex-col justify-between shadow-subtle relative overflow-hidden"
              >
                {/* Decorative border */}
                <div className="absolute inset-2 border border-luxury-border/40 pointer-events-none" />

                <div className="relative z-10">
                  <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] font-medium text-luxury-text-primary px-3 py-1 bg-luxury-ivory border border-luxury-border mb-4">
                    <Sparkles className="w-3 h-3 text-luxury-text-primary" />
                    <span>{discountLabel}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif text-luxury-text-primary mb-3">
                    {promo.title}
                  </h3>

                  {promo.description && (
                    <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed font-sans mb-6">
                      {promo.description}
                    </p>
                  )}

                  {promo.banner_image_url && (
                    <div className="mb-6">
                      <ImagePlaceholder
                        src={promo.banner_image_url}
                        alt={promo.title}
                        aspectRatio="aspect-[16/9]"
                      />
                    </div>
                  )}
                </div>

                <div className="relative z-10 pt-4 border-t border-luxury-border/60">
                  <Link
                    to="/collections"
                    className="inline-flex items-center text-xs uppercase tracking-[0.18em] font-medium text-luxury-text-primary hover:text-luxury-text-secondary transition-colors"
                  >
                    <span>View Qualifying Creations</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PromotionSection;
