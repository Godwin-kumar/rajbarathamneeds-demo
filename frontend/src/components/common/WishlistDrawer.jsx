import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

/**
 * Luxury Wishlist Slide-Over Drawer
 * Displays saved jewellery items with "Move to Bag" and removal capabilities.
 */
export const WishlistDrawer = () => {
  const navigate = useNavigate();
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
    count,
    isWishlistOpen,
    closeWishlist,
  } = useWishlist();
  const { addToCart, openCart } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isWishlistOpen) {
        closeWishlist();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWishlistOpen, closeWishlist]);

  if (!isWishlistOpen) return null;

  const formatINR = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleMoveToBag = (product) => {
    addToCart(product, 1, false);
    removeFromWishlist(product.id);
    closeWishlist();
    openCart();
  };

  const handleMoveAllToBag = () => {
    wishlistItems.forEach((product) => {
      addToCart(product, 1, false);
    });
    clearWishlist();
    closeWishlist();
    openCart();
  };

  const getItemImage = (product) => {
    if (!product) return '/images/products/temple_jewellery.jpg';
    if (product.main_image) return product.main_image;
    if (Array.isArray(product.side_images) && product.side_images[0]?.image_url) {
      return product.side_images[0].image_url;
    }
    if (product.image) return product.image;
    return '/images/products/temple_jewellery.jpg';
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-luxury-white shadow-2xl flex flex-col border-l border-luxury-border">
          {/* Header */}
          <div className="px-6 py-5 border-b border-luxury-border flex items-center justify-between bg-luxury-ivory-light/60">
            <div className="flex items-center space-x-2.5">
              <Heart className="w-5 h-5 text-luxury-gold fill-luxury-gold/20" />
              <h2
                id="wishlist-drawer-title"
                className="font-serif text-lg tracking-wider text-luxury-text-primary uppercase"
              >
                Saved Wishlist ({count})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeWishlist}
              aria-label="Close wishlist"
              className="p-1.5 text-luxury-text-secondary hover:text-luxury-text-primary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader */}
          <div className="bg-luxury-ivory/50 px-6 py-2.5 border-b border-luxury-border flex items-center justify-between text-[11px] text-luxury-text-primary">
            <span>Your curated personal jewellery vault</span>
            {count > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-[10px] uppercase tracking-wider text-luxury-text-secondary hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-luxury-border/60">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-luxury-ivory border border-luxury-border flex items-center justify-center text-luxury-gold shadow-subtle">
                  <Heart className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-luxury-text-primary">
                    Your Wishlist is Empty
                  </h3>
                  <p className="mt-1 text-xs text-luxury-text-secondary max-w-xs mx-auto">
                    Save your favourite classical dance ornaments and temple creations here for later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeWishlist();
                    navigate('/#shop-by-category');
                  }}
                  className="mt-2 px-6 py-3 bg-luxury-text-primary text-luxury-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
                >
                  Discover Creations
                </button>
              </div>
            ) : (
              wishlistItems.map((product) => {
                const price = Number(product.sale_price || product.price || 0);
                const originalPrice = product.sale_price && product.price ? Number(product.price) : null;
                const img = getItemImage(product);

                return (
                  <div key={product.id} className="py-4 flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-none bg-luxury-ivory/30 border border-luxury-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={img}
                        alt={product.name || 'Creation'}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/products/temple_jewellery.jpg';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/products/${product.id || product.slug}`}
                            onClick={closeWishlist}
                            className="font-serif text-sm text-luxury-text-primary hover:text-luxury-gold transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(product.id)}
                            aria-label={`Remove ${product.name} from wishlist`}
                            className="text-luxury-text-secondary/60 hover:text-red-600 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {product.category && (
                          <p className="text-[10px] uppercase tracking-wider text-luxury-text-secondary mt-0.5">
                            {typeof product.category === 'object' ? product.category.name : product.category}
                          </p>
                        )}
                      </div>

                      {/* Pricing and Move to Bag Button */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-luxury-text-primary font-sans">
                            {formatINR(price)}
                          </span>
                          {originalPrice && (
                            <span className="text-[10px] text-stone-400 line-through">
                              {formatINR(originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Move to Bag CTA */}
                        <button
                          type="button"
                          onClick={() => handleMoveToBag(product)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-[11px] font-semibold uppercase tracking-wider rounded-none transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {wishlistItems.length > 0 && (
            <div className="p-6 border-t border-luxury-border bg-luxury-ivory-light/40 space-y-3">
              <button
                type="button"
                onClick={handleMoveAllToBag}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-luxury-text-primary text-luxury-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-black active:bg-neutral-900 transition-colors shadow-subtle"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Shopping Bag</span>
              </button>

              <button
                type="button"
                onClick={closeWishlist}
                className="w-full py-2.5 text-center text-xs uppercase tracking-wider text-luxury-text-secondary hover:text-luxury-text-primary transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
