import apiClient from './apiClient';

/**
 * Service for fetching consolidated Django homepage API data
 */
export const homepageService = {
  /**
   * Fetches all homepage sections in a single optimized database call
   * @returns {Promise<{ data: object | null, error: string | null }>}
   */
  async getHomepageData() {
    return await apiClient.get('/home/home/');
  },
};

export default homepageService;
