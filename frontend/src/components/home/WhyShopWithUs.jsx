import React from 'react';
import { ShieldCheck, Lock, Package, Truck, Headphones } from 'lucide-react';

/**
 * Section 1: WHY SHOP WITH US
 * 
 * Displays five core customer trust benefits in one horizontal row on desktop,
 * and a compact responsive grid on mobile.
 * 
 * Luxury Brand Theme: White / Warm Ivory (#FAF8F3) + Antique Gold (#B89552) + Dark Brown (#332D25)
 */
export const WhyShopWithUs = () => {
  const benefits = [
    {
      id: 'quality',
      icon: ShieldCheck,
      title: 'Quality Assured',
      description: 'Carefully selected traditional jewellery.',
    },
    {
      id: 'payments',
      icon: Lock,
      title: 'Secure Payments',
      description: 'Safe and secure shopping experience.',
    },
    {
      id: 'packaging',
      icon: Package,
      title: 'Careful Packaging',
      description: 'Every order packed with attention and care.',
    },
    {
      id: 'shipping',
      icon: Truck,
      title: 'Reliable Shipping',
      description: 'Your jewellery delivered safely.',
    },
    {
      id: 'support',
      icon: Headphones,
      title: 'Customer Support',
      description: 'We are always happy to help.',
    },
  ];

  return (
    <section
      id="why-shop-with-us"
      aria-label="Why Shop With Us"
      className="w-full bg-[#FAF8F3] py-10 sm:py-12 md:py-14 border-b border-[#EAE3D6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] text-[#B89552] uppercase block mb-1">
            "A shopping experience you can trust."
          </span>
          <h2 className="font-serif text-xl sm:text-2xl md:text-[26px] text-[#332D25] font-normal tracking-[-0.01em]">
            WHY SHOP WITH US
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2" aria-hidden="true">
            <span className="h-[1px] w-8 bg-[#B89552]/40" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#B89552]" />
            <span className="h-[1px] w-8 bg-[#B89552]/40" />
          </div>
        </div>

        {/* Benefits Grid: 5 columns on desktop / compact grid on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 sm:gap-6 lg:gap-8 items-start">
          {benefits.map((item, index) => {
            const IconComponent = item.icon;
            const isLastOdd = index === 4;

            return (
              <div
                key={item.id}
                className={`
                  flex flex-col items-center text-center p-2 sm:p-3
                  ${isLastOdd ? 'col-span-2 md:col-span-1 max-w-xs mx-auto md:max-w-none' : ''}
                `}
              >
                {/* Antique-Gold Line Icon in Subtle Circle */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#EAE3D6] flex items-center justify-center text-[#B89552] mb-3 shadow-2xs transition-transform duration-300 hover:scale-105">
                  <IconComponent className="w-5 h-5 stroke-[1.5]" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-sm sm:text-base text-[#332D25] font-medium mb-1 tracking-tight">
                  {item.title}
                </h3>

                {/* Short Description */}
                <p className="font-sans text-[11px] sm:text-xs text-[#82796D] leading-relaxed max-w-[190px]">
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

export default WhyShopWithUs;
