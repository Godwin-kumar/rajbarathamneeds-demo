import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';

/**
 * Dedicated Luxury Wishlist Page
 * Allows clients to view all saved jewellery creations, move them to the shopping bag, or manage their vault.
 */
export const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist, count } = useWishlist();
  const { addToCart, openCart } = useCart();

  const formatINR = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleMoveToBag = (product) => {
    addToCart(product, 1, false);
    removeFromWishlist(product.id);
    openCart();
  };

  const handleMoveAll = () => {
    wishlistItems.forEach((product) => {
      addToCart(product, 1, false);
    });
    clearWishlist();
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
    <main id="main-content" className="min-h-[85vh] bg-luxury-ivory-light/40 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-luxury-border">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center text-xs tracking-wider uppercase text-luxury-text-secondary mb-2">
              <Link to="/" className="hover:text-luxury-text-primary transition-colors flex items-center">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Boutique
              </Link>
              <span className="mx-2 text-luxury-border">/</span>
              <span className="text-luxury-text-primary font-medium">My Wishlist</span>
            </nav>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-text-primary tracking-wide">
              Your Saved Creations ({count})
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-luxury-text-secondary">
              Personal jewellery vault for classical dance ornaments and heirloom temple pieces.
            </p>
          </div>

          {count > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearWishlist}
              >
                Clear Wishlist
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleMoveAll}
                icon={<ShoppingBag className="w-4 h-4" />}
                iconPosition="left"
              >
                Move All to Bag
              </Button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 px-4 bg-white border border-luxury-border shadow-subtle p-8 sm:p-12">
            <div className="w-16 h-16 rounded-full bg-luxury-ivory border border-luxury-border flex items-center justify-center text-luxury-gold mx-auto mb-4">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl text-luxury-text-primary mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed mb-6">
              You haven't saved any jewellery pieces yet. Browse our curated Bharatanatyam collection and tap the heart icon to save your favourites.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/#shop-by-category')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Discover Jewellery
            </Button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              const price = Number(product.sale_price || product.price || 0);
              const originalPrice = product.sale_price && product.price ? Number(product.price) : null;
              const img = getItemImage(product);

              return (
                <div
                  key={product.id}
                  className="bg-white border border-luxury-border p-4 flex flex-col justify-between hover:shadow-luxury-hover hover:border-[#AD873D]/50 transition-all group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full bg-luxury-ivory/20 border border-luxury-border/60 overflow-hidden mb-3">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/products/temple_jewellery.jpg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label="Remove from wishlist"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-luxury-border flex items-center justify-center text-stone-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {product.category && (
                      <span className="text-[10px] uppercase tracking-wider text-luxury-text-secondary block mb-1">
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                    )}

                    <Link
                      to={`/products/${product.id || product.slug}`}
                      className="font-serif text-sm sm:text-base font-medium text-luxury-text-primary hover:text-luxury-gold transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div className="mt-4 pt-3 border-t border-luxury-border/60">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-bold text-luxury-text-primary">
                        {formatINR(price)}
                      </span>
                      {originalPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          {formatINR(originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className="w-full py-2.5 px-3 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default WishlistPage;
