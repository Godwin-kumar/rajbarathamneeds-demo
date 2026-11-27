import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ERPLayout from '../components/layout/ERPLayout';

import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import ProductList from '../pages/products/ProductList';
import CategoryList from '../pages/categories/CategoryList';
import PromotionList from '../pages/promotions/PromotionList';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isSuperAdmin, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F1E5] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C99A35] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-black">
          Validating Security Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'ADMIN' && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={!loading && user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected ERP Backoffice Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ERPLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="promotions" element={<PromotionList />} />

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
