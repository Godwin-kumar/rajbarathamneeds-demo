import apiClient from './apiClient';

/**
 * Category Service connected directly to Django REST Framework backend
 */
export const categoryService = {
  async getCategories() {
    const res = await apiClient.get('/categories/');
    if (res.error) {
      return { data: [], error: res.error };
    }
    return { data: Array.isArray(res.data) ? res.data : (res.data?.results || []), error: null };
  },
};

export default categoryService;
