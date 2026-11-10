import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import SpecialOffersPage from '../pages/offers/SpecialOffersPage';

/**
 * Application Routing Architecture
 * Configured strictly for Homepage and Special Offers development.
 * Future routes (category, product, checkout) are ready to be attached here.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/promotions" element={<SpecialOffersPage />} />
      <Route path="/offers" element={<SpecialOffersPage />} />
      {/* Route catch-all redirecting to Home during preview stage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
