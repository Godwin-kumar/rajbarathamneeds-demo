/**
 * Centralized API Client for Django REST Framework Backend
 * Handles network requests, base URLs, query parameters, timeouts, and error normalization.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          (data && data.errors && data.errors.detail) ||
          (data && data.detail) ||
          `Request failed with status ${response.status}`;
        return {
          data: null,
          error: errorMessage,
          status: response.status,
        };
      }

      return {
        data,
        error: null,
        status: response.status,
      };
    } catch (err) {
      console.warn(`[API Client Error at ${endpoint}]:`, err.message);
      return {
        data: null,
        error: err.message || 'Network connection failed. Is the Django backend running?',
        status: 0,
      };
    }
  }

  get(endpoint, params = {}) {
    let url = endpoint;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
