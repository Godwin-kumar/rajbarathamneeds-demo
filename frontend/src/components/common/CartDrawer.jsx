import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

/**
 * Luxury Shopping Bag Slide-Over Drawer
 * Displays items in cart, allows quantity updates, removal, and direct checkout.
 */
export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    count,
    totalPrice,
    isCartOpen,
    closeCart,
  } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const formatINR = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
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
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-luxury-white shadow-2xl flex flex-col border-l border-luxury-border">
          {/* Header */}
          <div className="px-6 py-5 border-b border-luxury-border flex items-center justify-between bg-luxury-ivory-light/60">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-luxury-gold" />
              <h2
                id="cart-drawer-title"
                className="font-serif text-lg tracking-wider text-luxury-text-primary uppercase"
              >
                Shopping Bag ({count})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close shopping bag"
              className="p-1.5 text-luxury-text-secondary hover:text-luxury-text-primary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Banner */}
          <div className="bg-luxury-ivory/50 px-6 py-2.5 border-b border-luxury-border flex items-center justify-between text-[11px] text-luxury-text-primary">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Complimentary insured shipping on all orders</span>
            </div>
            <span className="font-semibold text-emerald-800 uppercase tracking-widest text-[9px] bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
              Active
            </span>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-luxury-border/60">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-luxury-ivory border border-luxury-border flex items-center justify-center text-luxury-gold shadow-subtle">
                  <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-luxury-text-primary">
                    Your Shopping Bag is Empty
                  </h3>
                  <p className="mt-1 text-xs text-luxury-text-secondary max-w-xs mx-auto">
                    Explore our handcrafted Bharatanatyam and heirloom temple jewellery creations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate('/#shop-by-category');
                  }}
                  className="mt-2 px-6 py-3 bg-luxury-text-primary text-luxury-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const product = item.product || {};
                const price = Number(product.sale_price || product.price || 0);
                const originalPrice = product.sale_price && product.price ? Number(product.price) : null;
                const img = getItemImage(product);

                return (
                  <div key={item.id || product.id} className="py-4 flex gap-4">
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
                            onClick={closeCart}
                            className="font-serif text-sm text-luxury-text-primary hover:text-luxury-gold transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id || item.id)}
                            aria-label={`Remove ${product.name} from bag`}
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

                      {/* Pricing and Quantity Stepper */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-luxury-text-primary font-sans">
                            {formatINR(price * item.quantity)}
                          </span>
                          {originalPrice && (
                            <span className="text-[10px] text-stone-400 line-through">
                              {formatINR(originalPrice * item.quantity)}
                            </span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="inline-flex items-center border border-luxury-border bg-luxury-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id || item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-6 h-6 flex items-center justify-center text-luxury-text-secondary hover:text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-mono font-medium text-luxury-text-primary select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id || item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-6 h-6 flex items-center justify-center text-luxury-text-secondary hover:text-luxury-text-primary hover:bg-luxury-ivory transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Checkout Actions */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-luxury-border bg-luxury-ivory-light/40 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-luxury-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-medium text-luxury-text-primary">{formatINR(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-luxury-text-secondary">
                  <span>Shipping (White-Glove Insured)</span>
                  <span className="text-emerald-700 font-medium uppercase tracking-wider text-[11px]">Free</span>
                </div>
                <div className="pt-2 border-t border-luxury-border flex justify-between text-sm font-medium text-luxury-text-primary">
                  <span className="font-serif text-base">Estimated Total</span>
                  <span className="text-base font-bold text-luxury-text-primary">{formatINR(totalPrice)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-luxury-text-primary text-luxury-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-black active:bg-neutral-900 transition-colors shadow-subtle"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full py-2.5 text-center text-xs uppercase tracking-wider text-luxury-text-secondary hover:text-luxury-text-primary transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-luxury-text-secondary uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold" />
                <span>256-Bit SSL Encrypted &bull; 100% Authentic Jewellery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
