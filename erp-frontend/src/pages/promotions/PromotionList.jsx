import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Search, Edit2, Trash2, Eye,
  Check, X, AlertCircle, RefreshCw, Percent, IndianRupee, Filter
} from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalPromo, setViewModalPromo] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deleteConfirmPromo, setDeleteConfirmPromo] = useState(null);

  // Form state (Exact Django Admin Promotion fields)
  const [formData, setFormData] = useState({
    title: '',
    product: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load promotions and products for dropdown
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await erpService.getPromotions();
      const data = res.data?.results || res.data || [];
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await erpService.getProducts();
      const prods = res.data?.results || res.data || [];
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error('Failed to load products for promotion selector:', err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, []);

  // Filter promotions
  const filteredPromotions = promotions.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesTitle = p.title?.toLowerCase().includes(q);
      const matchesProd = p.product_name?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesProd) return false;
    }
    if (discountTypeFilter && p.discount_type !== discountTypeFilter) {
      return false;
    }
    if (activeFilter !== '') {
      const wantActive = activeFilter === 'true';
      if (Boolean(p.is_active) !== wantActive) return false;
    }
    return true;
  });

  const totalItems = filteredPromotions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      title: '',
      product: '',
      discount_type: 'PERCENTAGE',
      discount_value: '10.00',
      is_active: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title || '',
      product: promo.product || '',
      discount_type: promo.discount_type || 'PERCENTAGE',
      discount_value: promo.discount_value || '',
      is_active: promo.is_active ?? true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  // Open View Modal
  const handleOpenView = (promo) => {
    setViewModalPromo(promo);
  };

  // Save Promotion
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Promotion title is required.');
      return;
    }
    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      setFormError('Please enter a valid discount value greater than zero.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      title: formData.title.trim(),
      product: formData.product ? Number(formData.product) : null,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value).toFixed(2),
      is_active: Boolean(formData.is_active),
    };

    try {
      if (editingPromo) {
        await erpService.updatePromotion(editingPromo.id, payload);
      } else {
        await erpService.createPromotion(payload);
      }
      setModalOpen(false);
      fetchPromotions();
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (err.response?.data && JSON.stringify(err.response.data)) ||
        err.message ||
        'Error saving promotion';
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Promotion
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPromo) return;
    setSubmitting(true);
    try {
      await erpService.deletePromotion(deleteConfirmPromo.id);
      setDeleteConfirmPromo(null);
      fetchPromotions();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EFE5D5]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F8F1E5] text-xs font-semibold text-black mb-1.5 border border-[#EFE5D5]">
            <Tag className="w-3.5 h-3.5 text-[#C99A35]" />
            <span>Marketing Master &bull; Django Admin Reference</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-black tracking-tight">
            Promotions & Special Offers
          </h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Configure product-specific percentage or flat discounts matching Django Admin schema.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { fetchPromotions(); fetchProducts(); }}
            title="Refresh List"
            className="p-2.5 bg-white border border-[#EFE5D5] rounded-xl hover:bg-[#F3EBDD] text-black transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A35]' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Promotion</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & DJANGO ADMIN FILTERS (list_filter: discount_type, is_active) */}
      <div className="bg-white p-4 rounded-xl border border-[#EFE5D5] shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto flex-1">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#76695C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search promotions or products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F1E5]/40 border border-[#EFE5D5] rounded-lg focus:outline-none focus:border-[#C99A35] text-black placeholder:text-[#76695C]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Discount Type Filter */}
          <select
            value={discountTypeFilter}
            onChange={(e) => { setDiscountTypeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-44 px-3 py-2 text-xs bg-[#F8F1E5]/40 border border-[#EFE5D5] rounded-lg focus:outline-none focus:border-[#C99A35] text-black font-medium"
          >
            <option value="">All Discount Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat Amount (₹)</option>
          </select>

          {/* Active Status Filter */}
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-36 px-3 py-2 text-xs bg-[#F8F1E5]/40 border border-[#EFE5D5] rounded-lg focus:outline-none focus:border-[#C99A35] text-black font-medium"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        <div className="text-xs text-[#76695C] font-medium self-end md:self-center">
          Showing <span className="font-bold text-black">{paginatedPromotions.length}</span> of{' '}
          <span className="font-bold text-black">{totalItems}</span> records
        </div>
      </div>

      {/* 3. STRUCTURED DATA TABLE (DJANGO ADMIN REFERENCE: TITLE, PRODUCT, DISCOUNT_TYPE, DISCOUNT_VALUE, IS_ACTIVE) */}
      <div className="bg-white rounded-xl border border-[#EFE5D5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EFE5D5] bg-[#F8F1E5] text-black font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Promotion Title</th>
                <th className="py-3.5 px-4">Linked Product</th>
                <th className="py-3.5 px-4">Discount Type</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#76695C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#C99A35] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading promotions from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPromotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#76695C]">
                    <Tag className="w-8 h-8 text-[#C99A35]/50 mx-auto mb-2" />
                    <p className="font-medium text-black">No promotions found</p>
                    <p className="text-xs mt-0.5">
                      {search || discountTypeFilter || activeFilter
                        ? 'Try resetting your filter parameters'
                        : 'Click "Add Promotion" to configure your first offer.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPromotions.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F3EBDD]/40 transition-colors group"
                  >
                    {/* Title */}
                    <td className="py-3.5 px-4 font-bold text-black">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5 text-[#C99A35]" />
                        </div>
                        <span className="truncate max-w-xs">{p.title}</span>
                      </div>
                    </td>

                    {/* Linked Product */}
                    <td className="py-3.5 px-4 text-[#333333]">
                      {p.product_name ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C99A35]" />
                          {p.product_name}
                        </span>
                      ) : (
                        <span className="text-xs text-[#76695C] italic">All Products / General</span>
                      )}
                    </td>

                    {/* Discount Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          p.discount_type === 'PERCENTAGE'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {p.discount_type === 'PERCENTAGE' ? (
                          <>
                            <Percent className="w-3 h-3" />
                            <span>Percentage</span>
                          </>
                        ) : (
                          <>
                            <IndianRupee className="w-3 h-3" />
                            <span>Flat Amount</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4 font-mono font-bold text-black">
                      {p.discount_type === 'PERCENTAGE'
                        ? `${parseInt(p.discount_value)}%`
                        : `₹${Number(p.discount_value).toLocaleString('en-IN')}`}
                    </td>

                    {/* Status (is_active) */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {p.is_active ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 stroke-[3]" />
                            <span>Inactive</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(p)}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-[#EFE5D5] bg-white hover:bg-[#F8F1E5] text-black transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Promotion"
                          className="p-1.5 rounded-lg border border-[#EFE5D5] bg-white hover:bg-[#F6E2B5] text-black hover:text-[#C99A35] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmPromo(p)}
                          title="Delete Promotion"
                          className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#EFE5D5] bg-[#F8F1E5]/40 flex items-center justify-between text-xs">
            <span className="text-[#76695C]">
              Page <span className="font-bold text-black">{currentPage}</span> of{' '}
              <span className="font-bold text-black">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-md border border-[#EFE5D5] bg-white text-black disabled:opacity-40 hover:bg-[#F3EBDD] font-medium"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-7 h-7 rounded-md text-xs font-semibold ${
                    currentPage === num
                      ? 'bg-[#C99A35] text-black font-bold'
                      : 'border border-[#EFE5D5] bg-white text-black hover:bg-[#F3EBDD]'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-md border border-[#EFE5D5] bg-white text-black disabled:opacity-40 hover:bg-[#F3EBDD] font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. ADD / EDIT PROMOTION MODAL (DJANGO ADMIN SOURCE OF TRUTH) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#EFE5D5] bg-[#F8F1E5] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-black">
                  {editingPromo ? 'Edit Promotion' : 'Add New Promotion'}
                </h3>
                <span className="text-[11px] text-[#76695C]">
                  Django Admin Fieldset: `title`, `product`, `discount_type`, `discount_value`, `is_active`
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-black hover:bg-[#F3EBDD]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Promotion Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Festive Offer, Temple Jewellery Special..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-medium"
                />
              </div>

              {/* Product (ForeignKey dropdown) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Linked Product (Optional ForeignKey)
                </label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-medium"
                >
                  <option value="">-- General Catalogue Offer (None) --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (₹{Number(prod.price || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#76695C] mt-1">
                  Leave unselected for site-wide / generic campaign, or select specific product.
                </p>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder={formData.discount_type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'}
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#76695C]">
                      {formData.discount_type === 'PERCENTAGE' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Is Active (Boolean Checkbox) */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#EFE5D5] bg-[#F8F1E5]/40 cursor-pointer hover:bg-[#F8F1E5]">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C99A35] focus:ring-[#C99A35] accent-[#C99A35]"
                  />
                  <div>
                    <span className="text-xs font-bold text-black block">Is Active</span>
                    <span className="text-[11px] text-[#76695C] block">
                      Active promotions are automatically applied to storefront checkout calculations.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#EFE5D5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EFE5D5] text-xs font-semibold text-[#333333] hover:bg-[#F3EBDD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingPromo ? 'Update Promotion' : 'Save Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW PROMOTION DETAILS MODAL */}
      {viewModalPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EFE5D5] bg-[#F8F1E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#C99A35]" />
                <h3 className="font-serif font-bold text-sm text-black">
                  Promotion Details
                </h3>
              </div>
              <button
                onClick={() => setViewModalPromo(null)}
                className="p-1 rounded-lg text-gray-500 hover:text-black hover:bg-[#F3EBDD]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-[#F8F1E5]/40 p-3 rounded-xl border border-[#EFE5D5] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#76695C] block">Primary Key (ID)</span>
                  <span className="font-mono text-sm font-bold text-black">
                    #{viewModalPromo.id}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    viewModalPromo.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {viewModalPromo.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#76695C] block mb-0.5">Title</span>
                <span className="text-sm font-bold text-black block">
                  {viewModalPromo.title}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#76695C] block mb-0.5">Linked Product</span>
                <span className="text-xs font-semibold text-black block">
                  {viewModalPromo.product_name ? viewModalPromo.product_name : 'All Products / General'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg border border-[#EFE5D5] bg-gray-50">
                  <span className="text-[10px] text-[#76695C] block uppercase font-bold">Type</span>
                  <span className="text-xs font-bold text-black">
                    {viewModalPromo.discount_type === 'PERCENTAGE' ? 'Percentage (%)' : 'Flat Amount (₹)'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-[#EFE5D5] bg-gray-50">
                  <span className="text-[10px] text-[#76695C] block uppercase font-bold">Value</span>
                  <span className="text-xs font-bold text-black font-mono">
                    {viewModalPromo.discount_type === 'PERCENTAGE'
                      ? `${parseInt(viewModalPromo.discount_value)}%`
                      : `₹${Number(viewModalPromo.discount_value).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setViewModalPromo(null)}
                  className="px-4 py-2 rounded-xl bg-[#C99A35] text-black font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteConfirmPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-red-200 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-black">
                Confirm Promotion Deletion
              </h3>
              <p className="text-xs text-[#333333] leading-relaxed">
                Are you sure you want to delete promotion{' '}
                <strong className="text-black font-bold">"{deleteConfirmPromo.title}"</strong>?
                This offer will be permanently removed from the database.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmPromo(null)}
                  className="px-4 py-2 rounded-xl border border-[#EFE5D5] text-xs font-semibold text-black hover:bg-[#F3EBDD]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
