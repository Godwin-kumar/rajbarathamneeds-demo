import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Truck,
  Clock,
  Gem,
  Award,
  HelpCircle,
} from 'lucide-react';
import { benefits } from '../../data/benefits';
import SectionHeading from '../common/SectionHeading';

const iconMap = {
  ShieldCheck,
  Sparkles,
  Truck,
  Clock,
  Gem,
  Award,
};

/**
 * Section 6: Why Choose Us / Brand Pillars
 * Alternates to Soft Ivory background.
 * Icon-based grid driven entirely by configuration data.
 */
export const BenefitsSection = () => {
  // If no benefits are defined, section can be cleanly bypassed
  if (!benefits || benefits.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Why Choose Us"
      className="py-16 md:py-24 bg-luxury-ivory-light border-b border-luxury-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Our Commitment"
          title="The Maison Experience"
          alignment="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {benefits.map((item) => {
            const IconComponent = iconMap[item.iconName] || HelpCircle;

            return (
              <div
                key={item.id}
                className="flex flex-col items-center text-center p-6 bg-luxury-white border border-luxury-border/60 shadow-subtle transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-full bg-luxury-ivory flex items-center justify-center text-luxury-text-primary mb-4 shadow-subtle">
                  <IconComponent className="w-5 h-5 stroke-[1.25]" />
                </div>

                <h3 className="font-serif text-lg text-luxury-text-primary font-normal mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-luxury-text-secondary font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
