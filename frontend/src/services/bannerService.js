import apiClient from './apiClient';

/**
 * Banner Service connected directly to Django REST Framework backend
 */
export const bannerService = {
  async getBanners() {
    const res = await apiClient.get('/promotions/banners/');
    if (res.error) {
      return { data: [], error: res.error };
    }
    return { data: Array.isArray(res.data) ? res.data : (res.data?.results || []), error: null };
  },

  async getPromotions() {
    const res = await apiClient.get('/promotions/');
    if (res.error) {
      return { data: [], error: res.error };
    }
    return { data: Array.isArray(res.data) ? res.data : (res.data?.results || []), error: null };
  },
};

export default bannerService;
