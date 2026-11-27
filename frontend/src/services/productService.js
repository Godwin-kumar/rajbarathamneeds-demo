
import apiClient from './apiClient';

/**
 * Product Service
 * Connected to Django REST Framework
 */

const extractProducts = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

export const productService = {
  // Get all products
  async getProducts(params = {}) {
    const res = await apiClient.get('/products/', params);

    if (res.error) {
      console.error('Products API Error:', res.error);
      return { data: [], error: res.error };
    }

    return {
      data: extractProducts(res.data),
      error: null,
    };
  },

  // Get new arrivals
  async getNewArrivals() {
    // Use the working products endpoint for now.
    const res = await apiClient.get('/products/', {
      ordering: '-id',
      page: 1,
    });

    if (res.error) {
      console.error('New Arrivals API Error:', res.error);
      return { data: [], error: res.error };
    }

    return {
      data: extractProducts(res.data),
      error: null,
    };
  },

  // Get featured products
  async getFeaturedProducts() {
    // Until a dedicated featured endpoint is confirmed,
    // retrieve products from the working endpoint.
    const res = await apiClient.get('/products/', {
      page: 1,
    });

    if (res.error) {
      console.error('Featured Products API Error:', res.error);
      return { data: [], error: res.error };
    }

    return {
      data: extractProducts(res.data),
      error: null,
    };
  },

  // Get one product by ID
  async getProduct(id) {
    const res = await apiClient.get(`/products/${id}/`);

    if (res.error) {
      console.error('Single Product API Error:', res.error);
      return { data: null, error: res.error };
    }

    return {
      data: res.data,
      error: null,
    };
  },

  // Get product by slug (currently uses the same ID-based endpoint)
  async getProductBySlug(slug) {
    return this.getProduct(slug);
  },

  // Get related products
  async getRelatedProducts(categoryId, currentProductId) {
    const params = categoryId
      ? { category: categoryId }
      : {};

    const res = await this.getProducts(params);

    if (res.error) {
      return { data: [], error: res.error };
    }

    const filtered = res.data.filter(
      (product) => String(product.id) !== String(currentProductId)
    );

    return {
      data: filtered,
      error: null,
    };
  },
};

export default productService;
