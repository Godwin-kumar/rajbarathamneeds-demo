import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Eye, Check, X, RefreshCw } from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await erpService.getCategories();
      setCategories(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      display_order: categories.length,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({
      name: c.name || '',
      description: c.description || '',
      image_url: c.image_url || '',
      display_order: c.display_order ?? 0,
      is_active: c.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await erpService.updateCategory(editingCategory.id, formData);
      } else {
        await erpService.createCategory(formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert('Error saving category: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await erpService.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Jewellery Categories</h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Organize collections like Temple Necklaces, Salangai, Pendants, Bangles, and Dance Accessories.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-[#77716D]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C99A35]" />
            <span>Loading categories...</span>
          </div>
        ) : categories.length > 0 ? (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col"
            >
              <div className="h-36 bg-[#F8F1E5] border-b border-[#EFE5D5] relative overflow-hidden">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FolderTree className="w-12 h-12 stroke-1" />
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-2xs border ${
                    c.is_active ? 'bg-[#F6E2B5] text-black border-[#C99A35]/30' : 'bg-gray-200 text-[#77716D] border-gray-300'
                  }`}
                >
                  {c.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-black">{c.name}</h3>
                  <p className="text-xs text-[#333333] mt-1 line-clamp-2">
                    {c.description || 'Traditional Indian classical dance and temple jewellery category.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFE5D5] flex items-center justify-between text-xs text-[#333333]">
                  <span className="font-mono text-[11px] text-[#77716D]">Slug: {c.slug}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-black hover:text-[#C99A35] hover:bg-[#F8F1E5] rounded-lg border border-[#EFE5D5] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
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
            No categories defined yet.
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#EFE5D5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <h2 className="text-base font-serif font-bold text-black">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-black hover:bg-[#F8F1E5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Temple Necklaces"
                  className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Image URL (ImageKit / CDN)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://ik.imagekit.io/..."
                  className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#C99A35] rounded border-[#EFE5D5] focus:ring-[#C99A35]"
                  />
                  <span className="text-xs font-semibold text-black">Active on Navigation</span>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
