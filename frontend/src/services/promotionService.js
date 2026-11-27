import apiClient from './apiClient';

/**
 * Promotion Service for fetching active Special Offers from Django REST API
 */
export const promotionService = {
  /**
   * Fetches all active, non-expired promotions
   * @returns {Promise<{ data: Array, error: string | null }>}
   */
  async getActivePromotions() {
    const res = await apiClient.get('/promotions/');
    if (res.error) {
      return { data: [], error: res.error };
    }
    return { data: Array.isArray(res.data) ? res.data : (res.data?.results || []), error: null };
  },

  /**
   * Fetches single promotion details by ID or code
   * @param {string|number} id 
   * @returns {Promise<{ data: Object | null, error: string | null }>}
   */
  async getPromotion(id) {
    const res = await apiClient.get(`/promotions/${id}/`);
    return { data: res.data, error: res.error };
  },
};

export default promotionService;
