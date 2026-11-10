import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, User, Search, ArrowRight } from 'lucide-react';
import { navigationLinks } from '../../data/navigation';
import { siteConfig } from '../../config/siteConfig';
import { useWishlist } from '../../context/WishlistContext';

/**
 * Mobile Navigation Drawer
 * Smooth slide-out menu with scroll locking and accessible touch targets.
 */
export const MobileMenu = ({ isOpen, onClose, onOpenSearch }) => {
  const { count: wishlistCount } = useWishlist();

  // Prevent background scrolling while menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-luxury-white shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out border-r border-luxury-border">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-luxury-border">
          <span className="font-serif text-lg tracking-wider text-luxury-text-primary uppercase">
            {siteConfig.brand.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-10 h-10 flex items-center justify-center text-luxury-text-primary hover:bg-luxury-ivory rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search quick button */}
        <div className="p-4 border-b border-luxury-border bg-luxury-ivory-light">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenSearch) onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-luxury-white border border-luxury-border text-left text-xs uppercase tracking-wider text-luxury-text-secondary rounded-none"
          >
            <span className="flex items-center">
              <Search className="w-4 h-4 mr-2.5 text-luxury-text-primary" />
              Search Collections...
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-luxury-border/50">
          <ul className="space-y-1 pb-6">
            {navigationLinks.map((link) => (
              <li key={link.id}>
                <Link
                  to={link.path}
                  onClick={onClose}
                  className="flex items-center justify-between py-3.5 text-sm uppercase tracking-[0.15em] font-medium text-luxury-text-primary hover:text-luxury-text-secondary transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-luxury-border" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick client links */}
          <div className="pt-6 space-y-3">
            <Link
              to="/wishlist"
              onClick={onClose}
              className="flex items-center justify-between py-2.5 text-xs uppercase tracking-widest text-luxury-text-primary font-medium"
            >
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-3" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] bg-luxury-text-primary text-luxury-white rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/account"
              onClick={onClose}
              className="flex items-center py-2.5 text-xs uppercase tracking-widest text-luxury-text-primary font-medium"
            >
              <User className="w-4 h-4 mr-3" />
              Account
            </Link>
          </div>
        </nav>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-luxury-border bg-luxury-ivory/40 text-center">
          <p className="text-[11px] uppercase tracking-widest text-luxury-text-secondary">
            {siteConfig.brand.tagline}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
