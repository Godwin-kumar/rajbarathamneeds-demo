import React, { createContext, useContext, useState, useEffect } from 'react';
import erpService from '../services/erpService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await erpService.getMe();
      if (res.data && res.data.authenticated !== false && res.data.id) {
        setUser(res.data);
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      setUser(null);
      // Not logged in or session expired
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const res = await erpService.login({ username, password });
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.detail ||
        err.response?.data?.detail ||
        err.message ||
        'Login failed. Please verify credentials.';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await erpService.logout();
    } catch (err) {
      console.warn('Logout warning:', err);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.is_superuser === true;
  const isAdmin = isSuperAdmin || user?.role === 'ADMIN';

  const hasPermission = (moduleName) => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isAdmin) {
      const adminModules = ['dashboard', 'products', 'categories', 'promotions', 'orders', 'customers', 'inventory', 'suppliers', 'purchases', 'sales', 'shipping', 'reports'];
      return adminModules.includes(moduleName);
    }
    if (user.role === 'MANAGER') {
      const managerModules = ['dashboard', 'orders', 'customers', 'inventory', 'sales', 'reports', 'shipping'];
      return managerModules.includes(moduleName);
    }
    return Boolean(user.permissions?.[moduleName]);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isSuperAdmin, isAdmin, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
