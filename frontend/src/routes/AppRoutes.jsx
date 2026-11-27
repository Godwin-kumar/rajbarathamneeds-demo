import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import SpecialOffersPage from '../pages/offers/SpecialOffersPage';
import OfferDetails from '../pages/offers/OfferDetails';
import ProductDetails from '../pages/products/ProductDetails';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import SignInPage from '../pages/auth/SignInPage';
import WishlistPage from '../pages/wishlist/WishlistPage';
import OrderSummaryPage from '../pages/orders/OrderSummaryPage';
import OrdersPage from '../pages/orders/OrdersPage';

/**
 * Application Routing Architecture
 * - Home (/)
 * - Special Offers Hub (/promotions, /offers)
 * - Dynamic Special Offer Details (/offers/:offerId, /promotions/:promotionId)
 * - Dynamic Product Details (/products/:productId)
 * - Buy Now & Express Checkout (/checkout, /buy-now)
 * - Order Confirmation & Summary (/order-summary/:orderNumber)
 * - Order History & Tracking Hub (/orders, /my-orders)
 * - Dedicated Wishlist Page (/wishlist)
 * - Sign In & Client Account Authentication (/signin, /login, /account)
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/promotions" element={<SpecialOffersPage />} />
      <Route path="/offers" element={<SpecialOffersPage />} />
      <Route path="/offers/:offerId" element={<OfferDetails />} />
      <Route path="/promotions/:offerId" element={<OfferDetails />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/buy-now" element={<CheckoutPage />} />
      <Route path="/order-summary/:orderNumber" element={<OrderSummaryPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/my-orders" element={<OrdersPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/signin" element={<SignInPage initialMode="signin" />} />
      <Route path="/login" element={<SignInPage initialMode="signin" />} />
      <Route path="/register" element={<SignInPage initialMode="register" />} />
      <Route path="/signup" element={<SignInPage initialMode="register" />} />
      <Route path="/account" element={<SignInPage initialMode="signin" />} />
      {/* Route catch-all redirecting to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
