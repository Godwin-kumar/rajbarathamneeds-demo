import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const STORAGE_KEY = 'm_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session with backend on initialization
  const checkSession = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response && response.data && response.data.authenticated && response.data.user) {
        setUser(response.data.user);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user));
        } catch {
          // ignore storage quota issues
        }
      } else {
        // Backend reports unauthenticated session
        setUser(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Session verification fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Performs user login
   */
  const login = async ({ username, password, rememberMe = false }) => {
    setAuthError(null);
    const res = await authService.login({ username, password, rememberMe });

    if (res.error) {
      const errMsg = res.error;
      setAuthError(errMsg);
      throw new Error(errMsg);
    }

    if (res.data && res.data.user) {
      setUser(res.data.user);
      if (rememberMe) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
          localStorage.setItem('m_remember_identifier', username);
        } catch {
          // ignore
        }
      } else {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('m_remember_identifier');
        } catch {
          // ignore
        }
      }
      return res.data.user;
    }

    throw new Error('Unexpected response format from authentication server.');
  };

  /**
   * Performs user registration and session initialization
   */
  const register = async ({ name, email, phone, password }) => {
    setAuthError(null);
    const res = await authService.register({ name, email, phone, password });

    if (res.error) {
      const errMsg = res.error;
      setAuthError(errMsg);
      throw new Error(errMsg);
    }

    if (res.data && res.data.user) {
      setUser(res.data.user);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.user));
      } catch {
        // ignore
      }
      return res.data.user;
    }

    throw new Error('Unexpected response format from registration server.');
  };

  /**
   * Performs user logout
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout warning:', err);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
