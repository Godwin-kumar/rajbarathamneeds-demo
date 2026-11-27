import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, Eye,
  Check, X, AlertCircle, RefreshCw, Image as ImageIcon,
  FolderTree, ExternalLink, Layers, Upload, ArrowRight,
  FileImage, CloudUpload
} from 'lucide-react';
import { erpService } from '../../services/erpService';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;
const MAX_SIDE_IMAGES = 5;

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalProduct, setViewModalProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Form text fields (Django Admin Product schema)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    dimensions: '',
  });

  // Main Image state (Real File Upload with drag-and-drop & preview)
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [mainImageFileName, setMainImageFileName] = useState('');
  const [isMainDragOver, setIsMainDragOver] = useState(false);

  // Side Images state (0 to 5)
  // existingSideImages: [{ id, image_url, display_order }] from database
  const [existingSideImages, setExistingSideImages] = useState([]);
  // newSideFiles: [{ file, previewUrl, id }]
  const [newSideFiles, setNewSideFiles] = useState([]);
  const [isSideDragOver, setIsSideDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // File input refs
  const mainFileInputRef = useRef(null);
  const sideFileInputRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load products from database
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;

      const res = await erpService.getProducts(params);
      const data = res.data?.results || res.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await erpService.getCategories();
      const cats = res.data?.results || res.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  // Clean up object URLs on modal close
  const cleanupPreviews = () => {
    if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(mainImagePreview);
    }
    newSideFiles.forEach((item) => {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    cleanupPreviews();
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      dimensions: '',
    });
    setMainImageFile(null);
    setMainImagePreview(null);
    setMainImageFileName('');
    setExistingSideImages([]);
    setNewSideFiles([]);
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p) => {
    cleanupPreviews();
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      category: p.category || '',
      price: p.price || '',
      description: p.description || '',
      dimensions: p.dimensions || '',
    });
    // Set existing main image from DB
    setMainImageFile(null);
    setMainImagePreview(p.main_image || null);
    setMainImageFileName(p.main_image ? 'Existing Main Image' : '');

    // Set existing side images from DB
    setExistingSideImages(p.side_images || []);
    setNewSideFiles([]);
    setFormError(null);
    setModalOpen(true);
  };

  // Open View Modal
  const handleOpenView = (p) => {
    setViewModalProduct(p);
  };

  // Validate single image file
  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      return `Invalid format for "${file.name}". Supported formats: JPG, JPEG, PNG, WEBP.`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit (${sizeMB.toFixed(1)}MB).`;
    }
    return null;
  };

  // --------------------------------------------------------------------------
  // Main Image Upload Handlers
  // --------------------------------------------------------------------------
  const handleMainFileSelected = (file) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);

    // Revoke previous blob if any
    if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(mainImagePreview);
    }

    const preview = URL.createObjectURL(file);
    setMainImageFile(file);
    setMainImagePreview(preview);
    setMainImageFileName(file.name);
  };

  const handleMainDrop = (e) => {
    e.preventDefault();
    setIsMainDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMainFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveMainImage = () => {
    if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImageFile(null);
    setMainImagePreview(null);
    setMainImageFileName('');
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };

  // --------------------------------------------------------------------------
  // Side Images Inline (0/5) Handlers
  // --------------------------------------------------------------------------
  const totalSideImagesCount = existingSideImages.length + newSideFiles.length;

  const handleSideFilesSelected = (filesList) => {
    if (!filesList || filesList.length === 0) return;

    const remainingSlots = MAX_SIDE_IMAGES - (existingSideImages.length + newSideFiles.length);
    if (remainingSlots <= 0) {
      setFormError(`Maximum of ${MAX_SIDE_IMAGES} side images reached. Remove an image to add another.`);
      return;
    }

    const filesToAdd = Array.from(filesList).slice(0, remainingSlots);
    const validNewItems = [];

    for (const f of filesToAdd) {
      const err = validateFile(f);
      if (err) {
        setFormError(err);
        return;
      }
      validNewItems.push({
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: f.name,
      });
    }

    setFormError(null);
    setNewSideFiles((prev) => [...prev, ...validNewItems]);

    if (filesList.length > remainingSlots) {
      setFormError(`Only ${remainingSlots} images were added. Maximum ${MAX_SIDE_IMAGES} side images allowed.`);
    }

    if (sideFileInputRef.current) {
      sideFileInputRef.current.value = '';
    }
  };

  const handleSideDrop = (e) => {
    e.preventDefault();
    setIsSideDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSideFilesSelected(e.dataTransfer.files);
    }
  };

  // Remove existing side image from database
  const handleRemoveExistingSideImage = async (imgId) => {
    if (editingProduct && imgId) {
      try {
        await erpService.deleteProductImage(editingProduct.id, imgId);
      } catch (err) {
        console.warn('Could not delete side image from backend:', err);
      }
    }
    setExistingSideImages((prev) => prev.filter((img) => img.id !== imgId));
  };

  // Remove newly selected side image
  const handleRemoveNewSideFile = (item) => {
    if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setNewSideFiles((prev) => prev.filter((x) => x.id !== item.id));
  };

  // --------------------------------------------------------------------------
  // Submit Form (Multipart / FormData)
  // --------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('Please enter a valid price greater than zero.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    // Build FormData payload for file upload
    const fd = new FormData();
    fd.append('name', formData.name.trim());
    if (formData.category) {
      fd.append('category', formData.category);
    }
    fd.append('price', Number(formData.price).toFixed(2));
    if (formData.description.trim()) {
      fd.append('description', formData.description.trim());
    }
    if (formData.dimensions.trim()) {
      fd.append('dimensions', formData.dimensions.trim());
    }

    // Main image file
    if (mainImageFile) {
      fd.append('upload_main_image', mainImageFile);
    } else if (editingProduct && !mainImagePreview) {
      // User removed existing main image
      fd.append('main_image', '');
    }

    // Attach any new side image files
    newSideFiles.forEach((item) => {
      fd.append('side_images', item.file);
    });

    try {
      if (editingProduct) {
        await erpService.updateProduct(editingProduct.id, fd);
      } else {
        await erpService.createProduct(fd);
      }

      cleanupPreviews();
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      const errMsg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.price?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (err.response?.data && JSON.stringify(err.response.data)) ||
        err.message ||
        'Error saving product';
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct) return;
    setSubmitting(true);
    try {
      await erpService.deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination calculation
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EFE5D5]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F8F1E5] text-xs font-semibold text-black mb-1.5 border border-[#EFE5D5]">
            <Package className="w-3.5 h-3.5 text-[#C99A35]" />
            <span>Catalogue Master &bull; Django Admin Reference</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-black tracking-tight">
            Jewellery Products
          </h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Manage product inventory with real ImageKit file upload support for main and side images.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { fetchProducts(); fetchCategories(); }}
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
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER */}
      <div className="bg-white p-4 rounded-xl border border-[#EFE5D5] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#76695C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, description, SKU..."
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-56 px-3 py-2 text-xs bg-[#F8F1E5]/40 border border-[#EFE5D5] rounded-lg focus:outline-none focus:border-[#C99A35] text-black font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#76695C] font-medium self-end sm:self-center">
          Showing <span className="font-bold text-black">{paginatedProducts.length}</span> of{' '}
          <span className="font-bold text-black">{totalItems}</span> records
        </div>
      </div>

      {/* 3. STRUCTURED DATA TABLE */}
      <div className="bg-white rounded-xl border border-[#EFE5D5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EFE5D5] bg-[#F8F1E5] text-black font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-20 text-center">Image</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4">Dimensions / SKU</th>
                <th className="py-3.5 px-4 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#76695C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#C99A35] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading products from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#76695C]">
                    <Package className="w-8 h-8 text-[#C99A35]/50 mx-auto mb-2" />
                    <p className="font-medium text-black">No products found</p>
                    <p className="text-xs mt-0.5">
                      {search || selectedCategory
                        ? 'Try clearing your search query or category filter'
                        : 'Click "Add Product" above to create your first jewellery product.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F3EBDD]/40 transition-colors group"
                  >
                    {/* Thumbnail Preview */}
                    <td className="py-3 px-4 text-center">
                      <div className="w-12 h-12 rounded-lg border border-[#EFE5D5] bg-[#F8F1E5] overflow-hidden flex items-center justify-center mx-auto shadow-2xs">
                        {p.main_image ? (
                          <img
                            src={p.main_image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[#C99A35]/60" />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-black">
                      <div className="max-w-xs truncate" title={p.name}>
                        {p.name}
                      </div>
                      <span className="text-[10px] text-[#76695C] font-mono block">
                        ID: #{p.id}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-[#333333]">
                      {p.category_name ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F8F1E5] border border-[#EFE5D5] text-[11px] font-semibold text-black">
                          <FolderTree className="w-3 h-3 text-[#C99A35]" />
                          {p.category_name}
                        </span>
                      ) : (
                        <span className="text-xs text-[#76695C] italic">Unassigned</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-bold text-black text-sm">
                      ₹{Number(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Dimensions / SKU */}
                    <td className="py-3.5 px-4 text-[#333333]">
                      {p.dimensions ? (
                        <span className="font-mono text-xs text-black">
                          {p.dimensions}
                        </span>
                      ) : (
                        <span className="text-xs text-[#76695C] italic">—</span>
                      )}
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
                          title="Edit Product"
                          className="p-1.5 rounded-lg border border-[#EFE5D5] bg-white hover:bg-[#F6E2B5] text-black hover:text-[#C99A35] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProduct(p)}
                          title="Delete Product"
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

      {/* 4. ADD / EDIT PRODUCT MODAL WITH REAL FILE UPLOADS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EFE5D5] bg-[#F8F1E5] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-black">
                  {editingProduct ? 'Edit Jewellery Product' : 'Add New Product'}
                </h3>
                <span className="text-[11px] text-[#76695C]">
                  Django Admin Fieldsets: Product Information &bull; Main Image &bull; Side Images Inline
                </span>
              </div>
              <button
                onClick={() => { cleanupPreviews(); setModalOpen(false); }}
                className="p-1 rounded-lg text-gray-500 hover:text-black hover:bg-[#F3EBDD]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* SECTION 1: PRODUCT INFORMATION */}
              {/* ------------------------------------------------------------------ */}
              <div className="space-y-4">
                <div className="pb-1 border-b border-[#EFE5D5] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C99A35]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                    1. Product Information
                  </h4>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Temple Grand Necklace, Salangai Anklet..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-medium"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Category (ForeignKey)
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-medium"
                    >
                      <option value="">-- None / Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="e.g. 45000.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black font-mono font-bold"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#76695C]">
                        ₹
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed jewellery specifications, craftsmanship details, stone cut..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black"
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                    Dimensions / SKU Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RBN-NKL-001 or 18 inches / 45 grams"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EFE5D5] rounded-xl focus:outline-none focus:border-[#C99A35] text-black"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* SECTION 2: MAIN PRODUCT IMAGE (REAL FILE UPLOAD) */}
              {/* ------------------------------------------------------------------ */}
              <div className="space-y-3 pt-2">
                <div className="pb-1 border-b border-[#EFE5D5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C99A35]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                      2. Main Product Image
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#76695C]">
                    Single Image (Max 10MB &bull; JPG, PNG, WEBP)
                  </span>
                </div>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={mainFileInputRef}
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleMainFileSelected(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* Main Image Dropzone & Preview Box */}
                {!mainImagePreview ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsMainDragOver(true); }}
                    onDragLeave={() => setIsMainDragOver(false)}
                    onDrop={handleMainDrop}
                    onClick={() => mainFileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5
                      ${isMainDragOver
                        ? 'border-[#C99A35] bg-[#F6E2B5]/30 scale-[0.99]'
                        : 'border-[#EFE5D5] bg-[#F8F1E5]/40 hover:bg-[#F8F1E5] hover:border-[#C99A35]/60'
                      }
                    `}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#EFE5D5] flex items-center justify-center text-[#C99A35] shadow-2xs">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black">
                        Click to browse or drag & drop main product image
                      </p>
                      <p className="text-[11px] text-[#76695C] mt-0.5">
                        High resolution recommended &bull; JPG, JPEG, PNG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Image Preview Card with Replace / Remove controls */
                  <div className="p-3 bg-[#F8F1E5]/50 rounded-2xl border border-[#EFE5D5] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-xl border border-[#EFE5D5] bg-white overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={mainImagePreview}
                          alt="Main Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-black truncate">
                            {mainImageFileName || 'Main Product Image'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#76695C] block mt-0.5 font-mono">
                          {mainImageFile
                            ? `${(mainImageFile.size / 1024).toFixed(0)} KB &bull; New Upload`
                            : 'Stored in Database'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => mainFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-[#EFE5D5] hover:bg-[#F6E2B5] text-black text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveMainImage}
                        title="Remove image"
                        className="p-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* SECTION 3: PRODUCT SIDE IMAGES INLINE (0/5) */}
              {/* ------------------------------------------------------------------ */}
              <div className="space-y-3 pt-2">
                <div className="pb-1 border-b border-[#EFE5D5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C99A35]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                      3. Side Images Inline ({totalSideImagesCount}/{MAX_SIDE_IMAGES})
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#76695C]">
                    Max 5 Images &bull; JPG, PNG, WEBP
                  </span>
                </div>

                {/* Hidden Native File Input (multiple) */}
                <input
                  type="file"
                  ref={sideFileInputRef}
                  multiple
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleSideFilesSelected(e.target.files);
                    }
                  }}
                  className="hidden"
                />

                {/* Drag and Drop Box for Side Images (only if slots remaining) */}
                {totalSideImagesCount < MAX_SIDE_IMAGES && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsSideDragOver(true); }}
                    onDragLeave={() => setIsSideDragOver(false)}
                    onDrop={handleSideDrop}
                    onClick={() => sideFileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex items-center justify-center gap-3
                      ${isSideDragOver
                        ? 'border-[#C99A35] bg-[#F6E2B5]/30'
                        : 'border-[#EFE5D5] bg-[#F8F1E5]/30 hover:bg-[#F8F1E5]/70 hover:border-[#C99A35]/60'
                      }
                    `}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#EFE5D5] flex items-center justify-center text-[#C99A35] shadow-2xs shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-black">
                        Upload Side Images ({MAX_SIDE_IMAGES - totalSideImagesCount} slots available)
                      </p>
                      <p className="text-[11px] text-[#76695C]">
                        Select multiple files or drag & drop (angle views, clasp closeup, styling)
                      </p>
                    </div>
                  </div>
                )}

                {/* Gallery of Images: Existing from DB + Newly selected files */}
                {totalSideImagesCount > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    {/* 1. Existing Saved Side Images */}
                    {existingSideImages.map((img, idx) => (
                      <div
                        key={`existing-${img.id}`}
                        className="relative rounded-xl border border-[#EFE5D5] bg-[#F8F1E5] p-1.5 group overflow-hidden shadow-2xs"
                      >
                        <div className="w-full h-20 rounded-lg overflow-hidden bg-white">
                          <img
                            src={img.image_url}
                            alt={`Existing Side ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingSideImage(img.id)}
                          title="Delete saved image from database"
                          className="absolute top-2 right-2 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-xs cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <div className="flex items-center justify-between text-[9px] font-mono text-[#76695C] px-1 mt-1">
                          <span className="font-bold text-black">Side #{idx + 1}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1 rounded">Saved</span>
                        </div>
                      </div>
                    ))}

                    {/* 2. Newly Picked Side Files (Pending Upload) */}
                    {newSideFiles.map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative rounded-xl border-2 border-[#C99A35]/60 bg-[#F6E2B5]/20 p-1.5 group overflow-hidden shadow-2xs"
                      >
                        <div className="w-full h-20 rounded-lg overflow-hidden bg-white">
                          <img
                            src={item.previewUrl}
                            alt={`New Side ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewSideFile(item)}
                          title="Remove from queue"
                          className="absolute top-2 right-2 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-xs cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <div className="flex items-center justify-between text-[9px] font-mono text-[#76695C] px-1 mt-1">
                          <span className="font-bold text-black">
                            Side #{existingSideImages.length + idx + 1}
                          </span>
                          <span className="text-amber-800 bg-amber-100 px-1 rounded font-bold">New</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#76695C] italic pt-1">
                    No side images uploaded yet. You can attach up to 5 side gallery images.
                  </p>
                )}
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* Modal Action Controls */}
              {/* ------------------------------------------------------------------ */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#EFE5D5]">
                <button
                  type="button"
                  onClick={() => { cleanupPreviews(); setModalOpen(false); }}
                  className="px-4 py-2 rounded-xl border border-[#EFE5D5] text-xs font-semibold text-[#333333] hover:bg-[#F3EBDD] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Uploading to ImageKit & Saving...</span>
                    </>
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW PRODUCT DETAILS MODAL */}
      {viewModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-[#EFE5D5] bg-[#F8F1E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C99A35]" />
                <h3 className="font-serif font-bold text-base text-black">
                  Product Details
                </h3>
              </div>
              <button
                onClick={() => setViewModalProduct(null)}
                className="p-1 rounded-lg text-gray-500 hover:text-black hover:bg-[#F3EBDD]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Main image banner */}
              <div className="w-full h-44 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] overflow-hidden flex items-center justify-center">
                {viewModalProduct.main_image ? (
                  <img
                    src={viewModalProduct.main_image}
                    alt={viewModalProduct.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-[#C99A35]/50" />
                )}
              </div>

              {/* Title, Category & Price */}
              <div>
                <span className="text-[10px] text-[#76695C] font-mono block">Product #{viewModalProduct.id}</span>
                <h2 className="text-base font-serif font-bold text-black mt-0.5">
                  {viewModalProduct.name}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-base font-bold font-mono text-black">
                    ₹{Number(viewModalProduct.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {viewModalProduct.category_name && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F8F1E5] border border-[#EFE5D5] text-[11px] font-semibold text-black">
                      <FolderTree className="w-3 h-3 text-[#C99A35]" />
                      {viewModalProduct.category_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              {viewModalProduct.dimensions && (
                <div className="p-3 bg-[#F8F1E5]/40 rounded-xl border border-[#EFE5D5]">
                  <span className="text-[10px] uppercase font-bold text-[#76695C] block">
                    Dimensions / SKU
                  </span>
                  <span className="text-xs font-mono text-black font-semibold">
                    {viewModalProduct.dimensions}
                  </span>
                </div>
              )}

              {/* Description */}
              {viewModalProduct.description && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#76695C] block mb-1">
                    Description
                  </span>
                  <p className="text-xs text-[#333333] leading-relaxed bg-gray-50 p-3 rounded-xl border border-[#EFE5D5]">
                    {viewModalProduct.description}
                  </p>
                </div>
              )}

              {/* Side Images */}
              {viewModalProduct.side_images && viewModalProduct.side_images.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#76695C] block mb-1.5">
                    Side Gallery ({viewModalProduct.side_images.length})
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {viewModalProduct.side_images.map((img) => (
                      <div
                        key={img.id}
                        className="h-16 rounded-lg border border-[#EFE5D5] bg-[#F8F1E5] overflow-hidden"
                      >
                        <img
                          src={img.image_url}
                          alt="Side"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setViewModalProduct(null)}
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
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-red-200 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-black">
                Confirm Product Deletion
              </h3>
              <p className="text-xs text-[#333333] leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-black font-bold">"{deleteConfirmProduct.name}"</strong>?
                This product and its associated side images will be permanently removed from the database.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProduct(null)}
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
