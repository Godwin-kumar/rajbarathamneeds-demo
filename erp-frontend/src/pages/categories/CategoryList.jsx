import React, { useState, useEffect } from 'react';
import {
  FolderTree, Plus, Search, Edit2, Trash2, Eye,
  Check, X, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalCategory, setViewModalCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState(null);

  // Form state (Exact Django Admin field: name)
  const [formData, setFormData] = useState({
    name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await erpService.getCategories(params);
      const data = res.data?.results || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({ name: c.name || '' });
    setFormError(null);
    setModalOpen(true);
  };

  // Open View Modal
  const handleOpenView = (c) => {
    setViewModalCategory(c);
  };

  // Save Category (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: formData.name.trim(),
    };

    try {
      if (editingCategory) {
        await erpService.updateCategory(editingCategory.id, payload);
      } else {
        await erpService.createCategory(payload);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const errMsg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Error saving category';
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmCategory) return;
    setSubmitting(true);
    try {
      await erpService.deleteCategory(deleteConfirmCategory.id);
      setDeleteConfirmCategory(null);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination calculation
  const totalItems = categories.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCategories = categories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EFE5D5]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F8F1E5] text-xs font-semibold text-black mb-1.5 border border-[#EFE5D5]">
            <FolderTree className="w-3.5 h-3.5 text-[#C99A35]" />
            <span>Catalogue Master &bull; Django Admin Reference</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-black tracking-tight">
            Jewellery Categories
          </h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Manage category classifications exactly matching Django Admin (`id`, `name`).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCategories}
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
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-[#EFE5D5] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#76695C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        <div className="text-xs text-[#76695C] font-medium self-end sm:self-center">
          Showing <span className="font-bold text-black">{paginatedCategories.length}</span> of{' '}
          <span className="font-bold text-black">{totalItems}</span> records
        </div>
      </div>

      {/* 3. STRUCTURED DATA TABLE (DJANGO ADMIN REFERENCE: ID, NAME, ACTIONS) */}
      <div className="bg-white rounded-xl border border-[#EFE5D5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EFE5D5] bg-[#F8F1E5] text-black font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-20 text-center">ID</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#76695C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#C99A35] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading categories from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-[#76695C]">
                    <FolderTree className="w-8 h-8 text-[#C99A35]/50 mx-auto mb-2" />
                    <p className="font-medium text-black">No categories found</p>
                    <p className="text-xs mt-0.5">
                      {search ? 'Try clearing your search query' : 'Click "Add Category" above to create your first category.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#F3EBDD]/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-[#76695C] font-semibold">
                      #{c.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-black flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center shrink-0">
                        <FolderTree className="w-3.5 h-3.5 text-[#C99A35]" />
                      </div>
                      <span className="truncate">{c.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(c)}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-[#EFE5D5] bg-white hover:bg-[#F8F1E5] text-black transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Category"
                          className="p-1.5 rounded-lg border border-[#EFE5D5] bg-white hover:bg-[#F6E2B5] text-black hover:text-[#C99A35] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCategory(c)}
                          title="Delete Category"
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

        {/* PAGINATION CONTROLS */}
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

      {/* 4. ADD / EDIT CATEGORY MODAL (DJANGO ADMIN SOURCE OF TRUTH) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#EFE5D5] bg-[#F8F1E5] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-black">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <span className="text-[11px] text-[#76695C]">
                  Django Admin Fieldset: `Category.name`
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Temple Necklaces, Salangai, Pendants..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-medium"
                />
                <p className="text-[11px] text-[#76695C] mt-1">
                  Must be unique across the catalogue (max 150 characters).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW CATEGORY DETAILS MODAL */}
      {viewModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EFE5D5] bg-[#F8F1E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#C99A35]" />
                <h3 className="font-serif font-bold text-sm text-black">
                  Category Details
                </h3>
              </div>
              <button
                onClick={() => setViewModalCategory(null)}
                className="p-1 rounded-lg text-gray-500 hover:text-black hover:bg-[#F3EBDD]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-[#F8F1E5]/40 p-3 rounded-xl border border-[#EFE5D5]">
                <span className="text-[11px] text-[#76695C] block">Primary Key (ID)</span>
                <span className="font-mono text-sm font-bold text-black">
                  #{viewModalCategory.id}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#76695C] block mb-0.5">Category Name</span>
                <span className="text-sm font-bold text-black block">
                  {viewModalCategory.name}
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewModalCategory(null)}
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
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-red-200 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-black">
                Confirm Category Deletion
              </h3>
              <p className="text-xs text-[#333333] leading-relaxed">
                Are you sure you want to delete category{' '}
                <strong className="text-black font-bold">"{deleteConfirmCategory.name}"</strong>?
                This record will be permanently deleted from the database.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCategory(null)}
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
