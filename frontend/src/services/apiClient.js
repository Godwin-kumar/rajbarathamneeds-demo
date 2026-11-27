/**
 * Centralized API Client
 * React + Vite + Django REST Framework
 * 
 * Features:
 * - Robust fetch request configuration with credentials and CSRF support
 * - In-flight GET request deduplication to prevent duplicate simultaneous requests
 * - Safe JSON and non-JSON (HTML/Text) response parsing
 * - Detailed error extraction preserving backend messages for 404, 500, 503, etc.
 * - Network failure resilience
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Extracts a cookie value by name (e.g., csrftoken)
 */
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.inFlightRequests = new Map();
  }

  /**
   * Helper to format DRF validation error objects into readable strings
   */
  formatError(data, status, statusText) {
    if (!data) {
      if (status === 404) return 'Requested resource not found (404).';
      if (status === 503) return 'Service temporarily unavailable (503).';
      if (status >= 500) return `Internal server error (${status}).`;
      return `Request failed with status ${status}: ${statusText}`;
    }

    if (typeof data === 'string') {
      // If server returned raw HTML error page (e.g., Django debug 500 page)
      if (data.includes('<!DOCTYPE') || data.includes('<html')) {
        const titleMatch = data.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';
        if (status === 503) {
          return `Service Unavailable (503)${title ? `: ${title}` : ''}`;
        }
        if (status === 404) {
          return `Endpoint not found (404)${title ? `: ${title}` : ''}`;
        }
        return `Server error (${status})${title ? `: ${title}` : ''}`;
      }
      return data;
    }

    // Check common DRF error fields
    if (data.errors && typeof data.errors === 'object') {
      if (typeof data.errors.detail === 'string') return data.errors.detail;
      // Object of field errors
      const entries = Object.entries(data.errors);
      if (entries.length > 0) {
        return entries
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      }
    }

    if (data.detail && typeof data.detail === 'string') return data.detail;
    if (data.error && typeof data.error === 'string') return data.error;
    if (data.message && typeof data.message === 'string') return data.message;

    // Field errors dict: e.g. { field: ['error1', 'error2'] }
    if (typeof data === 'object') {
      const messages = [];
      for (const [key, val] of Object.entries(data)) {
        if (key === 'status_code' || key === 'success') continue;
        if (Array.isArray(val)) {
          messages.push(`${key}: ${val.join(', ')}`);
        } else if (typeof val === 'string') {
          messages.push(`${key}: ${val}`);
        }
      }
      if (messages.length > 0) return messages.join(' | ');
    }

    return `Request failed with status ${status}`;
  }

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${this.baseUrl}/${cleanEndpoint}`;
    const method = (options.method || 'GET').toUpperCase();

    // In-flight request deduplication for concurrent GET requests
    const cacheKey = method === 'GET' ? url : null;
    if (cacheKey && this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    // CSRF token header for state-changing requests
    const csrfToken = getCookie('csrftoken');
    const headers = {
      Accept: 'application/json',
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(csrfToken && method !== 'GET' ? { 'X-CSRFToken': csrfToken } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      method,
      headers,
      credentials: options.credentials || 'include',
    };

    const fetchPromise = (async () => {
      try {
        const response = await fetch(url, config);

        let data = null;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch {
            data = null;
          }
        } else {
          try {
            data = await response.text();
          } catch {
            data = null;
          }
        }

        if (!response.ok) {
          const errorMessage = this.formatError(data, response.status, response.statusText);
          return {
            data: null,
            error: errorMessage,
            status: response.status,
            raw: data,
          };
        }

        return {
          data,
          error: null,
          status: response.status,
        };
      } catch (err) {
        const isNetworkError = err.name === 'TypeError' || err.message === 'Failed to fetch';
        const msg = isNetworkError
          ? `Unable to connect to backend server at ${this.baseUrl}. Please verify the Django server is running.`
          : err.message || 'An unexpected network error occurred.';

        return {
          data: null,
          error: msg,
          status: 0,
        };
      } finally {
        if (cacheKey) {
          this.inFlightRequests.delete(cacheKey);
        }
      }
    })();

    if (cacheKey) {
      this.inFlightRequests.set(cacheKey, fetchPromise);
    }

    return fetchPromise;
  }

  get(endpoint, paramsOrOptions = {}, maybeOptions = {}) {
    let queryParams = {};
    let requestOptions = { ...maybeOptions };

    // Support both Axios style { params: { ... }, ...options }
    // and direct params dictionary { phone: '...', ordering: '-id' }
    if (paramsOrOptions && typeof paramsOrOptions === 'object') {
      if ('params' in paramsOrOptions && typeof paramsOrOptions.params === 'object' && paramsOrOptions.params !== null) {
        queryParams = paramsOrOptions.params;
        const { params: _, ...rest } = paramsOrOptions;
        requestOptions = { ...rest, ...maybeOptions };
      } else {
        queryParams = paramsOrOptions;
      }
    }

    const query = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          // Prevent accidental serialization of objects into [object Object]
          if (Array.isArray(value)) {
            value.forEach((v) => {
              if (v !== undefined && v !== null && v !== '') {
                query.append(key, String(v));
              }
            });
          } else {
            // Flatten nested key-values rather than producing [object Object]
            Object.entries(value).forEach(([subKey, subVal]) => {
              if (subVal !== undefined && subVal !== null && subVal !== '') {
                query.append(subKey, String(subVal));
              }
            });
          }
        } else {
          query.append(key, String(value));
        }
      }
    });

    const queryString = query.toString();
    const url = queryString
      ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`
      : endpoint;

    return this.request(url, { ...requestOptions, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete(endpoint, bodyOrOptions = {}) {
    let options = {};
    if (bodyOrOptions && typeof bodyOrOptions === 'object') {
      if ('data' in bodyOrOptions) {
        // Axios-style delete: apiClient.delete(url, { data: { ... } })
        const { data, ...rest } = bodyOrOptions;
        options = {
          ...rest,
          body: data instanceof FormData ? data : JSON.stringify(data),
        };
      } else if ('body' in bodyOrOptions) {
        options = bodyOrOptions;
      } else {
        // Direct payload object
        options = {
          body: JSON.stringify(bodyOrOptions),
        };
      }
    }
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
