import apiClient from './apiClient';

/**
 * Authentication Service for Luxury Jewellery E-Commerce Client
 * Connects directly with Django REST Framework session authentication backend.
 */
export const authService = {
  /**
   * Authenticate user with username or email, password, and remember_me flag.
   * @param {Object} credentials - { username, password, rememberMe }
   * @returns {Promise<{data: any, error: string|null, status: number}>}
   */
  async login({ username, password, rememberMe = false }) {
    return apiClient.post('/auth/login/', {
      username: username?.trim(),
      password,
      remember_me: Boolean(rememberMe),
    });
  },

  /**
   * Register a new client account
   * @param {Object} data - { name, email, phone, password }
   * @returns {Promise<{data: any, error: string|null, status: number}>}
   */
  async register({ name, email, phone, password }) {
    return apiClient.post('/auth/register/', {
      name: name?.trim(),
      email: email?.trim()?.toLowerCase(),
      phone: phone?.trim(),
      password,
    });
  },

  /**
   * Fetch current authenticated session user
   * @returns {Promise<{data: any, error: string|null, status: number}>}
   */
  async getMe() {
    return apiClient.get('/auth/me/');
  },

  /**
   * Terminate current authenticated session
   * @returns {Promise<{data: any, error: string|null, status: number}>}
   */
  async logout() {
    return apiClient.post('/auth/logout/');
  },

  /**
   * Request password reset instructions for an account
   * @param {string} email
   * @returns {Promise<{data: any, error: string|null, status: number}>}
   */
  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password/', {
      email: email?.trim(),
    });
  },
};

export default authService;
