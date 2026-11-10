import api from './api';

export const erpService = {
  // Auth
  login: (credentials) => api.post('/auth/login/', credentials),
  getMe: () => api.get('/auth/me/'),
  logout: () => api.post('/auth/logout/'),

  // Dashboard
  getDashboardStats: (filter = '30days') => api.get(`/dashboard/stats/?filter=${filter}`),

  // Products
  getProducts: (params = {}) => api.get('/products/', { params }),
  getProduct: (id) => api.get(`/products/${id}/`),
  createProduct: (data) => api.post('/products/', data),
  updateProduct: (id, data) => api.put(`/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/products/${id}/`),
  uploadProductImages: (id, formData) => api.post(`/products/${id}/upload-images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProductImage: (productId, imageId) => api.delete(`/products/${productId}/delete-image/${imageId}/`),

  // Categories
  getCategories: (params = {}) => api.get('/categories/', { params }),
  createCategory: (data) => api.post('/categories/', data),
  updateCategory: (id, data) => api.put(`/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}/`),

  // Promotions
  getPromotions: () => api.get('/promotions/'),
  createPromotion: (data) => api.post('/promotions/', data),
  updatePromotion: (id, data) => api.put(`/promotions/${id}/`, data),
  deletePromotion: (id) => api.delete(`/promotions/${id}/`),

  // Orders
  getOrders: (params = {}) => api.get('/orders/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  updateOrderStatus: (id, data) => api.post(`/orders/${id}/update-status/`, data),

  // Customers
  getCustomers: (params = {}) => api.get('/customers/', { params }),
  getCustomer: (id) => api.get(`/customers/${id}/`),

  // Inventory
  getInventory: (params = {}) => api.get('/inventory/', { params }),
  adjustStock: (data) => api.post('/inventory/', data),
  getInventoryMovements: (productId = null) => {
    const url = productId ? `/inventory/movements/?product_id=${productId}` : '/inventory/movements/';
    return api.get(url);
  },

  // Suppliers & Purchases
  getSuppliers: (params = {}) => api.get('/suppliers/', { params }),
  createSupplier: (data) => api.post('/suppliers/', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}/`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}/`),

  getPurchases: () => api.get('/purchases/'),
  createPurchaseOrder: (data) => api.post('/purchases/', data),
  receivePurchaseGoods: (id) => api.post(`/purchases/${id}/receive-goods/`),

  // Finance
  getFinance: () => api.get('/finance/overview/'),
  getFinanceOverview: () => api.get('/finance/overview/'),
  getFinanceTransactions: (params = {}) => api.get('/finance/', { params }),
  createFinanceTransaction: (data) => api.post('/finance/', data),

  // Shipping
  getShipments: () => api.get('/shipping/'),
  updateShipmentTracking: (id, data) => api.post(`/shipping/${id}/update-tracking/`, data),

  // Employees
  getEmployees: () => api.get('/employees/'),
  createEmployee: (data) => api.post('/employees/', data),
  toggleEmployeeActive: (id) => api.post(`/employees/${id}/toggle-active/`),

  // Audit Logs & Reports
  getAuditLogs: (params = {}) => api.get('/audit-logs/', { params }),
  getReportExportUrl: (type = 'sales') => `/api/erp/reports/export/?type=${type}`,
};

export default erpService;
