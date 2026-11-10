import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  User,
  Heart,
  ShoppingBag,
  X,
} from 'lucide-react';
import { navigationLinks } from '../../data/navigation';
import { siteConfig } from '../../config/siteConfig';
import { useWishlist } from '../../context/WishlistContext';
import IconButton from '../common/IconButton';
import MobileMenu from './MobileMenu';

/**
 * Luxury E-Commerce Header & Navbar
 * Desktop: Brand left, Nav center, Action icons right
 * Mobile: Hamburger left, Brand center, Search & Cart right
 * Sticky with subtle elevation and border on scroll
 */
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { count: wishlistCount } = useWishlist();

  // Scroll detection for sticky header refinement
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Interactive feedback without broken page
    console.info(`Searching for: ${searchQuery}`);
  };

  return (
    <>
      <header
        className={`
          sticky top-0 z-40 w-full bg-luxury-white transition-all duration-300
          ${isScrolled ? 'border-b border-luxury-border shadow-subtle py-3' : 'border-b border-luxury-border/60 py-4 md:py-5'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* MOBILE: Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="w-10 h-10 flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory rounded-full transition-colors"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* BRAND / LOGO PLACEHOLDER */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <Link
                to="/"
                className="inline-block focus:outline-none focus:ring-1 focus:ring-luxury-text-primary px-1 py-0.5"
              >
                <span className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.12em] uppercase font-normal text-luxury-text-primary hover:text-luxury-text-secondary transition-colors duration-200">
                  {siteConfig.brand.name}
                </span>
              </Link>
            </div>

            {/* DESKTOP NAVIGATION LINKS (CENTER) */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="relative py-2 text-xs uppercase tracking-[0.18em] font-medium text-luxury-text-primary/90 hover:text-luxury-text-primary transition-colors duration-200 group"
                >
                  <span>{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-luxury-text-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* ACTION ICONS (RIGHT) */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Toggle */}
             

              {/* Account (Desktop Only) */}
              <div className="hidden lg:block">
                <IconButton
                  icon={<User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />}
                  label="Account"
                  onClick={() => console.info('Account link clicked')}
                />
              </div>

              {/* Wishlist (Desktop Only in Top Bar) */}
              <div className="hidden lg:block">
                <IconButton
                  icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />}
                  label="Wishlist"
                  badge={wishlistCount > 0 ? wishlistCount : null}
                  onClick={() => console.info('Wishlist clicked')}
                />
              </div>

              {/* Shopping Bag / Cart */}
              <IconButton
                icon={<ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />}
                label="Shopping Bag"
                badge={0}
                onClick={() => console.info('Shopping Bag clicked')}
              />
            </div>
          </div>
        </div>

        {/* SEARCH OVERLAY BAR (Working Interactive UI) */}
        {searchOpen && (
          <div className="border-t border-luxury-border bg-luxury-ivory-light py-4 px-4 sm:px-6 transition-all duration-300 animate-fade-in">
            <div className="max-w-3xl mx-auto flex items-center">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
                <Search className="w-4 h-4 text-luxury-text-secondary mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections, rings, necklaces, diamonds..."
                  autoFocus
                  className="w-full bg-transparent border-none text-xs sm:text-sm font-sans placeholder-luxury-text-secondary/70 focus:outline-none text-luxury-text-primary"
                />
              </form>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="ml-3 p-1 text-luxury-text-secondary hover:text-luxury-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slide-out mobile drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />
    </>
  );
};

export default Navbar;
