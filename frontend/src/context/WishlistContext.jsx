import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../services/apiClient';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userKey = user ? String(user.id || user.email) : 'guest';

  // Load user-specific initial wishlist
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(`luxury_wishlist_${userKey}`);
      if (saved) return JSON.parse(saved);
      // Fallback for migration
      const legacy = localStorage.getItem('luxury_wishlist_items');
      if (legacy) return JSON.parse(legacy);
      return [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(null);
  const isInitialLoad = useRef(true);

  // Switch or merge wishlist when user changes
  useEffect(() => {
    try {
      const targetKey = `luxury_wishlist_${userKey}`;
      const saved = localStorage.getItem(targetKey);
      let items = saved ? JSON.parse(saved) : [];

      // If user just logged in from guest, merge guest items
      if (user && userKey !== 'guest') {
        const guestSaved = localStorage.getItem('luxury_wishlist_guest');
        if (guestSaved) {
          try {
            const guestItems = JSON.parse(guestSaved);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const existingIds = new Set(items.map((i) => String(i.id)));
              const newItems = guestItems.filter((i) => !existingIds.has(String(i.id)));
              items = [...items, ...newItems];
              localStorage.setItem(targetKey, JSON.stringify(items));
              localStorage.removeItem('luxury_wishlist_guest');
            }
          } catch {
            // ignore
          }
        }

        // Fetch cloud-stored wishlist from Neon PostgreSQL
        apiClient.get('/auth/wishlist/').then((res) => {
          if (res.data && Array.isArray(res.data.wishlist) && res.data.wishlist.length > 0) {
            setWishlistItems((current) => {
              const currentIds = new Set(current.map((i) => String(i.id)));
              const merged = [...current];
              res.data.wishlist.forEach((cloudItem) => {
                if (cloudItem && cloudItem.id && !currentIds.has(String(cloudItem.id))) {
                  merged.push(cloudItem);
                }
              });
              localStorage.setItem(targetKey, JSON.stringify(merged));
              return merged;
            });
          }
        }).catch(() => {});
      }

      setWishlistItems(items);
    } catch {
      // ignore
    }
  }, [userKey]);

  // Persist to user-specific localStorage and cloud
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    try {
      const targetKey = `luxury_wishlist_${userKey}`;
      localStorage.setItem(targetKey, JSON.stringify(wishlistItems));
      // Sync legacy key
      localStorage.setItem('luxury_wishlist_items', JSON.stringify(wishlistItems));
      localStorage.setItem(
        'luxury_wishlist',
        JSON.stringify(wishlistItems.map((item) => item.id))
      );

      // Cloud sync if authenticated
      if (user && userKey !== 'guest') {
        apiClient.post('/auth/wishlist/', { wishlist: wishlistItems }).catch(() => {});
      }
    } catch {
      // Storage unavailable or blocked
    }
  }, [wishlistItems, userKey, user]);

  const showToast = (message) => {
    setWishlistToast({ message, id: Date.now() });
    setTimeout(() => {
      setWishlistToast((curr) => (curr && Date.now() - curr.id >= 2800 ? null : curr));
    }, 3000);
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some((item) => String(item.id) === String(productId));
  };

  const toggleWishlist = (productOrId, optionalName) => {
    if (!productOrId) return false;

    const product =
      typeof productOrId === 'object'
        ? productOrId
        : { id: productOrId, name: optionalName || `Creation #${productOrId}` };

    const targetId = String(product.id);
    const exists = wishlistItems.some((item) => String(item.id) === targetId);

    if (exists) {
      setWishlistItems((prev) => prev.filter((item) => String(item.id) !== targetId));
      showToast(`Removed "${product.name || 'Item'}" from your Wishlist.`);
      return false;
    } else {
      setWishlistItems((prev) => [...prev, product]);
      showToast(`Added "${product.name || 'Item'}" to your Wishlist.`);
      return true;
    }
  };

  const removeFromWishlist = (productId) => {
    const item = wishlistItems.find((i) => String(i.id) === String(productId));
    setWishlistItems((prev) => prev.filter((i) => String(i.id) !== String(productId)));
    if (item) {
      showToast(`Removed "${item.name || 'Item'}" from your Wishlist.`);
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    showToast('Your wishlist has been cleared.');
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  return (
    <WishlistContext.Provider
      value={{
        wishlist: wishlistItems.map((item) => item.id),
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        count: wishlistItems.length,
        isWishlistOpen,
        setIsWishlistOpen,
        openWishlist,
        closeWishlist,
        wishlistToast,
      }}
    >
      {children}
      {wishlistToast && (
        <div className="fixed bottom-20 right-6 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#241A12] text-[#F8F4EB] border border-[#D4AF37] px-4 py-3 rounded-none shadow-xl flex items-center gap-3 text-xs sm:text-sm font-medium">
            <span className="text-[#D4AF37] text-base">♥</span>
            <span>{wishlistToast.message}</span>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
