import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('luxury_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('luxury_cart', JSON.stringify(cartItems));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [cartItems]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((curr) => (curr && Date.now() - curr.id >= 2800 ? null : curr));
    }, 3000);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, quantity = 1, shouldOpenDrawer = true) => {
    if (!product || !product.id) return;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => String(item.product?.id || item.id) === String(product.id)
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [...prevItems, { id: product.id, product, quantity: qty }];
    });

    showNotification(`Added ${qty} × "${product.name}" to your shopping bag.`);

    if (shouldOpenDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) =>
      prev.filter((item) => String(item.product?.id || item.id) !== String(productId))
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        String(item.product?.id || item.id) === String(productId)
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = item.product || {};
    const price = Number(product.sale_price || product.price || 0);
    return sum + price * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        count: totalCount,
        totalPrice,
        notification,
        showNotification,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#241A12] text-[#F8F4EB] border border-[#D4AF37] px-4 py-3 rounded-none shadow-xl flex items-center gap-3 text-xs sm:text-sm font-medium">
            <span className="text-[#D4AF37] text-base">✓</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
