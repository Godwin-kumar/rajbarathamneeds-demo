import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/common/CartDrawer';
import WishlistDrawer from './components/common/WishlistDrawer';
import AppRoutes from './routes/AppRoutes';

/**
 * Main Application Layout Container
 * Integrates global context, top announcement bar, sticky navigation header,
 * page routes (Home, Special Offers, Product Details), luxury footer,
 * and global slide-over Cart & Wishlist drawers.
 */
function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-luxury-white text-luxury-text-primary selection:bg-luxury-ivory selection:text-luxury-text-primary">
            {/* Skip to main content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-luxury-white focus:text-luxury-text-primary focus:border focus:border-luxury-border"
            >
              Skip to main content
            </a>

            {/* SECTION 1 (Header Top): Announcement Bar */}
            <AnnouncementBar />

            {/* Global Navigation Header */}
            <Navbar />

            {/* Main Content Area */}
            <div className="flex-grow">
              <AppRoutes />
            </div>

            {/* Global Slide-Over Drawers */}
            <CartDrawer />
            <WishlistDrawer />

            {/* SECTION 9: Luxury Footer */}
            <Footer />
          </div>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
