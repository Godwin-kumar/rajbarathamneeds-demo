function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

let memoryCsrfToken = null;

const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const BASE_URL = rawApiBase
  ? (rawApiBase.endsWith('/erp') ? rawApiBase : `${rawApiBase}/erp`)
  : '/api/erp';

async function request(endpoint, options = {}) {
  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  if (options.params) {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const csrfToken = getCookie('csrftoken') || memoryCsrfToken;
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  // Handle body
  let body = options.body;
  const isFormData = body instanceof FormData;
  if (!isFormData && body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    body,
  };

  try {
    const response = await fetch(url, fetchOptions);

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
      if (data && data.csrf_token) {
        memoryCsrfToken = data.csrf_token;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      const error = new Error(
        (data && (data.error || data.detail || (typeof data === 'string' ? data : null))) ||
        `Request failed with status ${response.status}`
      );
      error.response = { status: response.status, data };
      throw error;
    }

    if (contentType.includes('text/html')) {
      throw new Error(
        'API request returned HTML instead of JSON. Configure a Render Rewrite rule for /api/* to your Django backend above /* -> /index.html.'
      );
    }

    return { data, status: response.status, headers: response.headers };
  } catch (err) {
    if (!err.response) {
      console.warn(`[ERP API Error at ${url}]:`, err.message);
    }
    throw err;
  }
}

const api = {
  get: (url, config = {}) => request(url, { ...config, method: 'GET' }),
  post: (url, body, config = {}) => request(url, { ...config, method: 'POST', body }),
  put: (url, body, config = {}) => request(url, { ...config, method: 'PUT', body }),
  patch: (url, body, config = {}) => request(url, { ...config, method: 'PATCH', body }),
  delete: (url, config = {}) => request(url, { ...config, method: 'DELETE' }),
};

export default api;
