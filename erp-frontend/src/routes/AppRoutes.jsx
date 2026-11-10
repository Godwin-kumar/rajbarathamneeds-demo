import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ERPLayout from '../components/layout/ERPLayout';

import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import ProductList from '../pages/products/ProductList';
import CategoryList from '../pages/categories/CategoryList';
import PromotionList from '../pages/promotions/PromotionList';
import OrderList from '../pages/orders/OrderList';
import CustomerList from '../pages/customers/CustomerList';
import InventoryList from '../pages/inventory/InventoryList';
import PurchasesPage from '../pages/purchases/PurchasesPage';
import FinancePage from '../pages/finance/FinancePage';
import ShippingPage from '../pages/shipping/ShippingPage';
import ReportsPage from '../pages/reports/ReportsPage';
import EmployeeList from '../pages/employees/EmployeeList';
import SettingsPage from '../pages/settings/SettingsPage';

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
        <Route path="orders" element={<OrderList />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="inventory" element={<InventoryList />} />
        <Route path="suppliers" element={<PurchasesPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="reports" element={<ReportsPage />} />

        {/* Restricted Admin / Super Admin Routes */}
        <Route
          path="employees"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
