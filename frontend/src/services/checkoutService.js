import apiClient from './apiClient';

/**
 * Service for Checkout, Address Management and WhatsApp Order Dispatch
 */
export const checkoutService = {
  /**
   * Recalculates and verifies product pricing and promotion discounts on Django backend.
   * Supports single product (Buy Now) and multi-item cart checkout with coupons.
   */
  async calculateCheckout(target, quantity = 1, couponCode = '') {
    if (typeof target === 'object' && target !== null) {
      return apiClient.post('/orders/calculate/', target);
    }
    return apiClient.post('/orders/calculate/', {
      product_id: target,
      quantity,
      coupon_code: couponCode,
    });
  },

  /**
   * Recalculates and verifies entire cart pricing, product details, and coupons on Django backend
   */
  async calculateCartCheckout(items, couponCode = '') {
    return apiClient.post('/orders/calculate/', {
      items,
      coupon_code: couponCode,
    });
  },

  /**
   * Retrieves saved delivery addresses from PostgreSQL
   */
  async getSavedAddresses(phone = '') {
    const cleanPhone = typeof phone === 'string' ? phone.trim() : (phone?.phone || '');
    return apiClient.get('/orders/addresses/', {
      phone: cleanPhone,
    });
  },

  /**
   * Saves or updates a delivery address in PostgreSQL
   */
  async saveAddress(addressData) {
    return apiClient.post('/orders/addresses/', addressData);
  },

  /**
   * Removes a saved delivery address in PostgreSQL
   */
  async deleteAddress(addressId, phone = '') {
    const cleanPhone = typeof phone === 'string' ? phone.trim() : (phone?.phone || '');
    return apiClient.delete('/orders/addresses/', {
      data: { address_id: addressId, phone: cleanPhone },
    });
  },

  /**
   * Submits checkout order to backend, verifies products & totals,
   * creates Order/OrderItem records and triggers WhatsApp delivery.
   */
  async checkout(orderPayload) {
    return apiClient.post('/orders/checkout/', orderPayload);
  },

  /**
   * Records an order in PostgreSQL before WhatsApp dispatch
   */
  async createOrder(orderPayload) {
    return apiClient.post('/orders/create/', orderPayload);
  },

  /**
   * Fetches full order summary by order reference number
   */
  async getOrderSummary(orderNumber) {
    return apiClient.get(`/orders/summary/${encodeURIComponent(orderNumber)}/`);
  },

  /**
   * Fetches customer order history for the active user or phone/email query
   */
  async getMyOrders(params = {}) {
    return apiClient.get('/orders/my-orders/', params);
  },

  /**
   * Directly opens WhatsApp conversation with +91 9994887758
   * using URL-encoded order message text and accessible product image links.
   * Note: navigator.share / Windows Share panel is explicitly not used.
   */
  openWhatsAppChat({ whatsappNumber = '919994887758', messageText = '' }) {
    const cleanNumber =
      (whatsappNumber || '').replace(/[^0-9]/g, '') || '919994887758';
    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return { method: 'whatsapp-url', url: waUrl, success: true };
  },

  /**
   * Legacy alias for openWhatsAppChat
   */
  async dispatchWhatsAppOrder({ whatsappNumber, messageText }) {
    return this.openWhatsAppChat({ whatsappNumber, messageText });
  },
};

export default checkoutService;
