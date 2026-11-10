import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Check, X, RefreshCw, Percent, IndianRupee } from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    coupon_code: '',
    banner_image_url: '',
    destination_link: '#product-collection',
    badge_text: 'SPECIAL OFFER',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await erpService.getPromotions();
      setPromotions(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      title: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: '20',
      coupon_code: 'FESTIVE20',
      banner_image_url: '',
      destination_link: '#product-collection',
      badge_text: 'SPECIAL OFFER',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title || '',
      description: promo.description || '',
      discount_type: promo.discount_type || 'PERCENTAGE',
      discount_value: promo.discount_value || '',
      coupon_code: promo.coupon_code || '',
      banner_image_url: promo.banner_image_url || '',
      destination_link: promo.destination_link || '#product-collection',
      badge_text: promo.badge_text || 'SPECIAL OFFER',
      is_active: promo.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPromo) {
        await erpService.updatePromotion(editingPromo.id, formData);
      } else {
        await erpService.createPromotion(formData);
      }
      setModalOpen(false);
      fetchPromotions();
    } catch (err) {
      alert('Failed to save promotion: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete promotion "${title}"?`)) return;
    try {
      await erpService.deletePromotion(id);
      fetchPromotions();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Promotions & Offers</h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Manage promotional campaign banners and coupon discount rules shown on the storefront.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>New Promotion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-[#77716D]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C99A35]" />
            <span>Loading promotions...</span>
          </div>
        ) : promotions.length > 0 ? (
          promotions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col"
            >
              <div className="h-32 bg-[#F8F1E5] text-black p-4 relative flex flex-col justify-between overflow-hidden border-b border-[#EFE5D5]">
                {p.banner_image_url && (
                  <img
                    src={p.banner_image_url}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                  />
                )}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F6E2B5] text-black border border-[#C99A35]/30 tracking-wider">
                    {p.badge_text || 'PROMO'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.is_active ? 'bg-white text-black border-[#EFE5D5]' : 'bg-gray-200 text-[#77716D] border-gray-300'
                    }`}
                  >
                    {p.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-base font-serif font-bold text-black line-clamp-1">{p.title}</h3>
                  <div className="text-xs text-[#C99A35] font-bold mt-0.5">
                    {p.discount_type === 'PERCENTAGE' ? `${p.discount_value}% OFF` : `₹${p.discount_value} FLAT OFF`}
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 bg-[#F8F1E5] border border-dashed border-[#C99A35] rounded-lg font-mono text-xs font-bold text-black">
                    CODE: {p.coupon_code || 'AUTOSAVINGS'}
                  </div>
                  <p className="text-xs text-[#333333] mt-2 line-clamp-2">
                    {p.description || 'Special discount campaign for traditional dance jewellery shoppers.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFE5D5] flex items-center justify-between text-xs text-[#333333]">
                  <span>Storefront Linked</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-black hover:text-[#C99A35] hover:bg-[#F8F1E5] rounded-lg border border-[#EFE5D5] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-1.5 text-black hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-[#EFE5D5] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-16 text-center text-[#77716D]">
            No promotional campaigns created yet.
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#EFE5D5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <h2 className="text-base font-serif font-bold text-black">
                {editingPromo ? 'Edit Promotion' : 'New Promotional Campaign'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-black hover:bg-[#F8F1E5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Navratri Dance Jewellery Special"
                  className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder="20"
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE20"
                  className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm font-mono text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.banner_image_url}
                  onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                  placeholder="https://ik.imagekit.io/..."
                  className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#C99A35] rounded border-[#EFE5D5] focus:ring-[#C99A35]"
                  />
                  <span className="text-xs font-semibold text-black">Active Campaign</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE5D5]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#EFE5D5] rounded-xl text-xs font-semibold text-black hover:bg-[#F8F1E5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-xs font-bold shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingPromo ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
