import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

// Minimal luxury inline SVG for Instagram icon
const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} fill-none stroke-current`} viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

/**
 * Section 3: FOLLOW US ON INSTAGRAM
 * 
 * Centered heading: "FOLLOW US ON INSTAGRAM"
 * Subtitle: "Discover the beauty of traditional jewellery."
 * Desktop: 5 square images in one horizontal row.
 * Mobile: Horizontal swipeable image gallery.
 * 
 * Image themes:
 * 1. Traditional temple jewellery necklace
 * 2. Bharatanatyam dancer wearing jewellery
 * 3. Temple jhumka earrings
 * 4. Antique temple pendant
 * 5. Complete Bharatanatyam jewellery set
 * 
 * Luxury Brand Theme: Warm Ivory (#FAF8F3) + Antique Gold (#B89552) + Dark Brown (#332D25)
 */

const instagramPosts = [
  {
    id: 'post-1',
    theme: 'Traditional temple jewellery necklace',
    title: 'Heritage Kemp Choker',
    src: '/images/categories/necklaces.jpg',
    alt: 'Traditional temple jewellery necklace with handcrafted red and green kemp stones',
  },
  {
    id: 'post-2',
    theme: 'Bharatanatyam dancer wearing jewellery',
    title: 'Dance of Divinity',
    src: '/images/story/bharatanatyam_story.jpg',
    alt: 'Classical Bharatanatyam dancer adorned with authentic temple jewellery',
  },
  {
    id: 'post-3',
    theme: 'Temple jhumka earrings',
    title: 'Handcrafted Kemp Jhumkas',
    src: '/images/categories/earrings.jpg',
    alt: 'Traditional antique gold temple jhumka earrings with pearl hangings',
  },
  {
    id: 'post-4',
    theme: 'Antique temple pendant',
    title: 'Antique Temple Pendant',
    src: '/images/categories/pendants.jpg',
    alt: 'Exquisitely carved temple jewellery pendant featuring classical deities',
  },
  {
    id: 'post-5',
    theme: 'Complete Bharatanatyam jewellery set',
    title: 'Complete Temple Set',
    src: '/images/products/temple_jewellery.jpg',
    alt: 'Complete Bharatanatyam temple jewellery set for Arangetram and classical dance',
  },
];

export const InstagramGallery = () => {
  const scrollRef = useRef(null);

  // Link to configured Instagram profile or fallback
  const instagramUrl = siteConfig?.socialLinks?.instagram || 'https://www.instagram.com/';

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="instagram-gallery"
      aria-label="Follow Us on Instagram"
      className="w-full bg-[#FAF8F3] py-12 sm:py-16 md:py-20 border-b border-[#EAE3D6] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] text-[#B89552] uppercase block mb-1">
            "Discover the beauty of traditional jewellery."
          </span>
          <h2 className="font-serif text-xl sm:text-2xl md:text-[28px] text-[#332D25] font-normal tracking-[-0.01em]">
            FOLLOW US ON INSTAGRAM
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2.5" aria-hidden="true">
            <span className="h-[1px] w-10 bg-[#B89552]/40" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#B89552]" />
            <span className="h-[1px] w-10 bg-[#B89552]/40" />
          </div>
        </div>

        {/* Gallery Container: 5 images in 1 row on desktop, swipeable on mobile */}
        <div className="relative">

          {/* Mobile scroll buttons */}
          <div className="flex md:hidden justify-end gap-2 mb-3">
            <button
              onClick={() => scroll('left')}
              aria-label="Previous image"
              className="w-8 h-8 rounded-full border border-[#EAE3D6] bg-white flex items-center justify-center text-[#332D25] hover:border-[#B89552] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Next image"
              className="w-8 h-8 rounded-full border border-[#EAE3D6] bg-white flex items-center justify-center text-[#332D25] hover:border-[#B89552] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${post.title} on Instagram`}
                className="group relative block aspect-square w-[55vw] max-w-[220px] sm:max-w-[240px] md:w-auto flex-shrink-0 snap-center overflow-hidden bg-stone-200 border border-[#EAE3D6] shadow-2xs"
              >
                {/* Image */}
                <img
                  src={post.src}
                  alt={post.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />

                {/* Hover overlay with Antique Gold Instagram icon & title */}
                <div className="absolute inset-0 bg-[#332D25]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center backdrop-blur-[1px]">
                  <div className="w-9 h-9 rounded-full bg-white/95 text-[#B89552] flex items-center justify-center mb-2 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <span className="font-serif text-white text-xs sm:text-[13px] font-medium leading-snug transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {post.title}
                  </span>
                  <span className="font-sans text-[10px] tracking-wider text-[#FAF8F3]/80 uppercase mt-1">
                    @rajbarathamneeds
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Centered Action Button */}
        <div className="text-center mt-8 sm:mt-10">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-2.5 sm:px-8 sm:py-3 border border-[#B89552] bg-white text-[#332D25] hover:bg-[#B89552] hover:text-white transition-all duration-300 shadow-2xs font-sans text-xs uppercase tracking-[0.16em] font-semibold group"
          >
            <InstagramIcon className="w-4 h-4 text-[#B89552] group-hover:text-white transition-colors" />
            <span>FOLLOW ON INSTAGRAM</span>
          </a>
        </div>

      </div>
    </section>
  );
};

export default InstagramGallery;