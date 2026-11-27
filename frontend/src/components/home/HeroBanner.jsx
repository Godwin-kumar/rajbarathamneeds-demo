import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

/**
 * RAJ BARATHAM NEEDS — Classical Bharatanatyam Luxury Hero Banner
 * 
 * Design Architecture:
 * - Rich Multi-Layered Indian Heritage Background:
 *   1. Ambient Sand-to-Silk linear gradient + warm radial sunburst aura
 *   2. Distant & Foreground authentic South Indian Temple Gopuram silhouettes
 *   3. Sacred classical Prabhavali circular halo arch framing the dancer
 *   4. Soft ground contact shadow
 * - Pure Native Typography (Left):
 *   - "RAJ BARATHAM NEEDS" with fine gold divider rules
 *   - "Adorn the Art of Tradition" in responsive Cormorant Garamond display serif
 *   - Subtitle & "EXPLORE COLLECTION ↓" smooth-scroll action button
 *   - Golden Lotus SVG emblem & "The Beauty of Heritage" italic motto
 * - Featured Dancer (Center-Right):
 *   - High-definition isolated Bharatanatyam dancer with full fan-pleated saree
 *   - Clean presentation with NO floating jewellery boxes in the hero section
 */
export const HeroBanner = () => {
  const scrollToCollection = () => {
    const target =
      document.getElementById('shop-by-category') ||
      document.getElementById('collection-grid') ||
      document.getElementById('main-content');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label="Raj Baratham Needs — Adorn the Art of Tradition"
      className="relative w-full bg-[#FAF6F0] border-b border-[#EAE4D8] overflow-hidden"
    >
      {/* ============================================================== */}
      {/* 1. MULTI-LAYERED INDIAN HERITAGE BACKGROUND WITH ANIMATIONS   */}
      {/* ============================================================== */}
      <div 
        className="relative w-full max-w-[1728px] mx-auto min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 55% 75% at 65% 52%, rgba(240, 222, 195, 0.82) 0%, rgba(248, 241, 230, 0.45) 55%, transparent 80%),
            linear-gradient(100deg, #F4ECE1 0%, #F9F4EB 36%, #FCF9F3 68%, #F7EFE4 100%)
          `
        }}
      >
        {/* ANIMATED BACKGROUND IMAGE 1: SLOW-ROTATING TOP-RIGHT MANDALA */}
        <div 
          className="absolute -top-16 -right-16 w-64 h-64 sm:w-80 sm:h-80 opacity-20 pointer-events-none select-none animate-spin-slow"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#C6A15B]">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="32" stroke="currentColor" strokeWidth="1.5" />
            {/* 12 Petals */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <path d="M100 24 C94 45 92 65 100 76 C108 65 106 45 100 24 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.08" />
                <circle cx="100" cy="16" r="3" fill="currentColor" />
              </g>
            ))}
          </svg>
        </div>

        {/* ANIMATED BACKGROUND IMAGE 2: SLOW-ROTATING BOTTOM-LEFT MANDALA */}
        <div 
          className="absolute -bottom-20 -left-20 w-56 h-56 sm:w-72 sm:h-72 opacity-15 pointer-events-none select-none animate-spin-slow-reverse"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#B8924E]">
            <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.8" />
            {/* 8 Classical Petals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <path d="M100 30 C90 55 90 70 100 80 C110 70 110 55 100 30 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.06" />
                <circle cx="100" cy="22" r="2.5" fill="currentColor" />
              </g>
            ))}
          </svg>
        </div>

        {/* ANIMATED BACKGROUND 3: BREATHING RADIANT SUNBURST AURA */}
        <div 
          className="absolute right-[10%] lg:right-[16%] top-[12%] w-[420px] lg:w-[520px] h-[420px] lg:h-[520px] rounded-full pointer-events-none animate-aura-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(235, 212, 178, 0.45) 0%, rgba(246, 235, 218, 0.2) 50%, transparent 75%)'
          }}
          aria-hidden="true"
        />

        {/* LAYER A: DISTANT SOFT TEMPLE GOPURAM SILHOUETTE */}
        <svg 
          className="absolute left-[18%] md:left-[24%] bottom-[6%] h-[68%] max-h-[420px] w-auto opacity-10 pointer-events-none select-none text-[#B8924E]"
          viewBox="0 0 200 320" 
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="25" y="260" width="150" height="60" />
          <rect x="40" y="225" width="120" height="35" />
          <rect x="55" y="190" width="90" height="35" />
          <rect x="68" y="155" width="64" height="35" />
          <rect x="78" y="120" width="44" height="35" />
          <polygon points="100,50 85,120 115,120" />
          <polygon points="100,25 96,50 104,50" />
        </svg>

        {/* LAYER B: FOREGROUND DETAILED CHOLA TEMPLE GOPURAM SILHOUETTE */}
        <svg 
          className="absolute left-[26%] md:left-[32%] lg:left-[34%] bottom-0 h-[88%] max-h-[540px] w-auto opacity-20 pointer-events-none select-none text-[#C6A15B]"
          viewBox="0 0 240 380" 
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Sanctum Foundation & Pillars */}
          <rect x="15" y="310" width="210" height="70" rx="1" />
          <rect x="10" y="304" width="220" height="7" rx="1" />
          
          {/* Progressive Tiers */}
          <rect x="30" y="275" width="180" height="29" />
          <rect x="25" y="270" width="190" height="6" rx="1" />
          
          <rect x="46" y="238" width="148" height="32" />
          <rect x="40" y="233" width="160" height="6" rx="1" />
          
          <rect x="62" y="202" width="116" height="31" />
          <rect x="58" y="197" width="124" height="5" rx="1" />
          
          <rect x="76" y="166" width="88" height="31" />
          <rect x="72" y="161" width="96" height="5" rx="1" />
          
          <rect x="88" y="130" width="64" height="31" />
          <rect x="84" y="125" width="72" height="5" rx="1" />
          
          <rect x="98" y="98" width="44" height="27" />
          <rect x="94" y="94" width="52" height="4" rx="1" />
          
          {/* Shikhara Dome & Spire */}
          <polygon points="120,42 102,94 138,94" />
          {/* Kalasam Spire Points */}
          <polygon points="120,18 116,42 124,42" />
          <polygon points="110,26 107,48 113,48" />
          <polygon points="130,26 127,48 133,48" />
          
          {/* Arched Temple Sanctuary Portal */}
          <path d="M102 380 L102 342 Q120 326 138 342 L138 380 Z" fill="#F4ECE1" opacity="0.85" />
        </svg>

        {/* LAYER C: SACRED PRABHAVALI RADIANT CIRCULAR HALO ARCH (BREATHING ANIMATION) */}
        <div className="absolute right-[8%] sm:right-[14%] lg:right-[18%] top-[8%] sm:top-[6%] w-[380px] sm:w-[480px] lg:w-[560px] h-[380px] sm:h-[480px] lg:h-[560px] pointer-events-none select-none animate-halo-breathe">
          <svg 
            className="w-full h-full text-[#C6A15B]"
            viewBox="0 0 320 320" 
            fill="none"
            aria-hidden="true"
          >
            {/* Concentric Halo Rings */}
            <circle cx="160" cy="160" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
            <circle cx="160" cy="160" r="138" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="160" cy="160" r="126" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="160" cy="160" r="112" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="160" cy="160" r="98" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="160" cy="160" r="82" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
            {/* Radiant Sunburst Spoke Accents */}
            <g stroke="currentColor" strokeWidth="1.2">
              <line x1="160" y1="6" x2="160" y2="20" />
              <line x1="160" y1="300" x2="160" y2="314" />
              <line x1="6" y1="160" x2="20" y2="160" />
              <line x1="300" y1="160" x2="314" y2="160" />
              <line x1="51" y1="51" x2="61" y2="61" />
              <line x1="259" y1="259" x2="269" y2="269" />
              <line x1="259" y1="61" x2="269" y2="51" />
              <line x1="51" y1="269" x2="61" y2="259" />
            </g>
          </svg>
        </div>

        {/* ANIMATED BACKGROUND 4: FLOATING SACRED GOLDEN FLOWER PETALS */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          {/* Petal 1 */}
          <div className="absolute top-[12%] left-[42%] w-6 h-6 text-[#C6A15B] animate-float-drift-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-60">
              <path d="M12 2 C8 7 6 12 12 22 C18 12 16 7 12 2 Z" />
            </svg>
          </div>
          {/* Petal 2 */}
          <div className="absolute top-[25%] right-[22%] w-5 h-5 text-[#B8924E] animate-float-drift-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-55">
              <path d="M12 3 C9 8 7 13 12 21 C17 13 15 8 12 3 Z" />
            </svg>
          </div>
          {/* Petal 3 */}
          <div className="absolute top-[45%] left-[28%] w-5 h-5 text-[#C6A15B] animate-float-drift-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-50">
              <path d="M12 2 C8 7 6 12 12 22 C18 12 16 7 12 2 Z" />
            </svg>
          </div>
          {/* Petal 4 */}
          <div className="absolute top-[60%] right-[35%] w-6 h-6 text-[#A68853] animate-float-drift-1" style={{ animationDelay: '4.5s' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-60">
              <path d="M12 3 C9 8 7 13 12 21 C17 13 15 8 12 3 Z" />
            </svg>
          </div>
        </div>

        {/* ANIMATED BACKGROUND 5: TWINKLING CELESTIAL GOLDEN SPARKLES */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          {/* Sparkle 1 (Near dancer head) */}
          <div className="absolute top-[16%] right-[32%] text-[#C6A15B] animate-sparkle-1">
            <Sparkles className="w-5 h-5 drop-shadow-sm" />
          </div>
          {/* Sparkle 2 (Over left temple) */}
          <div className="absolute top-[28%] left-[36%] text-[#C6A15B] animate-sparkle-2">
            <Sparkles className="w-4 h-4 drop-shadow-sm" />
          </div>
          {/* Sparkle 3 (Near dancer hand mudra) */}
          <div className="absolute top-[38%] right-[14%] text-[#D4AF37] animate-sparkle-3">
            <Sparkles className="w-5 h-5 drop-shadow-sm" />
          </div>
          {/* Sparkle 4 (Near headline) */}
          <div className="absolute top-[15%] left-[12%] text-[#C6A15B] animate-sparkle-2" style={{ animationDelay: '2.5s' }}>
            <Sparkles className="w-3.5 h-3.5 drop-shadow-sm opacity-70" />
          </div>
        </div>

        {/* LAYER D: SOFT CONTACT FLOOR SHADOW */}
        <div 
          className="absolute bottom-[3%] right-[8%] sm:right-[12%] lg:right-[15%] w-[340px] sm:w-[460px] lg:w-[540px] h-[26px] bg-gradient-to-r from-transparent via-[#C6A15B]/30 to-transparent rounded-full blur-md pointer-events-none"
          aria-hidden="true"
        />

        {/* ============================================================== */}
        {/* 2. FOREGROUND CONTENT: TYPOGRAPHY + ISOLATED DANCER             */}
        {/* ============================================================== */}
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-10 sm:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
          
          {/* LEFT: NATIVE TYPOGRAPHY & EXPLORE CTA */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5 sm:space-y-6 text-left z-20">
            
            {/* Eyebrow Header with Gold Divider Lines */}
            <div className="flex items-center gap-3">
              <span className="w-8 sm:w-12 h-[1px] bg-[#DECDB0]" />
              <span className="text-[11px] sm:text-xs font-sans font-semibold tracking-[0.26em] text-[#A68853] uppercase select-none">
                Raj Baratham Needs
              </span>
              <span className="w-8 sm:w-12 h-[1px] bg-[#DECDB0]" />
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] font-medium leading-[1.06] tracking-tight text-[#241B14]">
              Adorn the Art<br />
              of Tradition
            </h1>

            {/* Subtitle Description */}
            <p className="font-serif text-[#5C4D42] text-base sm:text-lg lg:text-[19px] leading-relaxed max-w-md">
              Traditional Bharatanatyam and temple jewellery inspired by Indian heritage.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={scrollToCollection}
                aria-label="Explore collection"
                className="group inline-flex items-center gap-3 px-7 py-4 bg-[#1F1A16] hover:bg-[#332B25] active:bg-black text-[#F8F3E9] text-xs font-sans font-semibold uppercase tracking-[0.2em] border border-[#C6A15B]/60 transition-all duration-300 hover:border-[#C6A15B] shadow-lg hover:shadow-xl"
              >
                <span>Explore Collection</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#C6A15B] transition-transform duration-300 group-hover:translate-y-0.5" />
              </button>
            </div>

            {/* Bottom Heritage Emblem & Slogan */}
            <div className="pt-6 sm:pt-8 flex flex-col items-start space-y-1.5">
              <div className="flex items-center gap-3 w-52">
                <span className="flex-1 h-[1px] bg-[#E2D2B8]" />
                <svg className="w-8 h-6 text-[#C6A15B]" viewBox="0 0 48 32" fill="none">
                  <path d="M24 2 C24 2 18 14 18 22 C18 25.3 20.7 28 24 28 C27.3 28 30 25.3 30 22 C30 14 24 2 24 2 Z" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M24 10 C20 14 10 18 10 24 C10 27 12.5 29 16 28 C19.5 27 23 23 24 20" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M24 10 C28 14 38 18 38 24 C38 27 35.5 29 32 28 C28.5 27 25 23 24 20" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <span className="flex-1 h-[1px] bg-[#E2D2B8]" />
              </div>
              <p className="font-serif italic text-sm sm:text-base text-[#9C7D4A] pl-4 select-none">
                The Beauty of Heritage
              </p>
            </div>
          </div>

          {/* RIGHT: MAJESTIC ISOLATED BHARATANATYAM DANCER (NO FLOATING JEWELS) */}
          <div className="lg:col-span-7 flex items-center justify-center lg:justify-end relative z-20">
            <div className="relative w-full max-w-[380px] sm:max-w-[480px] lg:max-w-[580px] aspect-square flex items-center justify-center">
              <img
                src="/images/hero/bharatanatyam_dancer_isolated.png"
                alt="Classical Bharatanatyam dancer in seated araimandi pose wearing traditional red and cream attire"
                className="w-full h-full object-contain select-none drop-shadow-2xl"
                fetchPriority="high"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/hero/adorn-art-tradition-hero.jpg';
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
