/**
 * Newsletter Service Interface
 * Ready for future backend integration.
 */
export const newsletterService = {
  /**
   * Subscribe an email address to the newsletter
   * @param {string} email
   * @returns {Promise<{ success: boolean, status: string, message: string }>}
   */
  async subscribe(email) {
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        status: 'INVALID_EMAIL',
        message: 'Please provide a valid email address.',
      };
    }

    // Backend endpoint not yet connected
    // Do not display a false success message
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          status: 'BACKEND_NOT_CONNECTED',
          message: 'Newsletter subscription API is not yet connected to a backend server.',
        });
      }, 500);
    });
  },
};

export default newsletterService;
