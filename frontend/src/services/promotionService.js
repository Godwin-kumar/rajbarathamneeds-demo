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
};

export default promotionService;
