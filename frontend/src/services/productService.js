import apiClient from './apiClient';

/**
 * Product Service connected directly to Django REST Framework backend
 */
export const productService = {
  async getNewArrivals() {
    const res = await apiClient.get('/products/new-arrivals/');
    if (res.error) {
      return { data: [], error: res.error };
    }
    return { data: Array.isArray(res.data) ? res.data : (res.data?.results || []), error: null };
  },

  async getFeaturedProducts() {
    const res = await apiClient.get('/products/featured/');
    if (res.error) {
      return { data: [], error: res.error };
    }
    return { data: Array.isArray(res.data) ? res.data : (res.data?.results || []), error: null };
  },

  async getProducts(params = {}) {
    const res = await apiClient.get('/products/', params);
    if (res.error) {
      return { data: [], error: res.error };
    }
    return { data: res.data?.results || (Array.isArray(res.data) ? res.data : []), error: null };
  },

  async getProductBySlug(slug) {
    const res = await apiClient.get(`/products/${slug}/`);
    return { data: res.data, error: res.error };
  },
};

export default productService;
