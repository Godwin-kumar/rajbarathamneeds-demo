
import React from 'react';

const HeroBanner = ({ banners = [] }) => {
  return (
    <section
      aria-label="Raj Baratham Needs luxury Bharatanatyam jewellery"
      className="relative w-full overflow-hidden bg-[#F8F3E9]"
    >
      {/* Complete ivory hero banner */}
      <div className="w-full">
        <img
          src="/images/hero/raj-baratham-hero.png"
          alt="Raj Baratham Needs - Bharatanatyam dancer wearing traditional costume and temple jewellery"
          className="block w-full h-auto object-contain object-center"
          width="1728"
          height="864"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          onError={(e) => {
            console.error(
              'Hero banner image failed to load:',
              e.currentTarget.src
            );
          }}
        />
      </div>
    </section>
  );
};

export default HeroBanner;
