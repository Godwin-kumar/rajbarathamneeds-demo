import React, { useEffect } from 'react';
import OffersSection from '../../components/home/OffersSection';

/**
 * RAJ BARATHAM NEEDS — Special Offers Page (/offers & /promotions)
 * 
 * Strict Minimal Structure:
 * 1. Global Header & AnnouncementBar (rendered by App layout)
 * 2. Special Offers Heading
 * 3. Flipkart-Inspired Three-Card Promotional Carousel
 * 4. Pagination Dots and Navigation Arrows
 * 5. Global Footer (rendered by App layout)
 */
export const SpecialOffersPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Special Offers & Privileges — RAJ BARATHAM NEEDS';
  }, []);

  return (
    <main id="main-content" className="w-full bg-[#F7F3EA] min-h-[65vh] flex flex-col justify-center">
      <OffersSection isStandalonePage={true} />
    </main>
  );
};

export default SpecialOffersPage;