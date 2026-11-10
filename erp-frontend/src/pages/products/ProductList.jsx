import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Search, Filter, Edit2, Trash2, Image as ImageIcon,
  Check, X, AlertCircle, Upload, Eye, ExternalLink, RefreshCw
} from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageModalProduct, setImageModalProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: 10,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: false,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Image upload state
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (stockFilter) params.stock_status = stockFilter;

      const res = await erpService.getProducts(params);
      setProducts(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await erpService.getCategories();
      setCategories(res.data?.results || res.data || []);
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
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, stockFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      price: '',
      original_price: '',
      stock_quantity: 10,
      low_stock_threshold: 5,
      is_active: true,
      is_featured: false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      sku: prod.sku || '',
      category_id: prod.category?.id || prod.category || '',
      description: prod.description || '',
      price: prod.price || '',
      original_price: prod.original_price || '',
      stock_quantity: prod.stock_quantity || 0,
      low_stock_threshold: prod.low_stock_threshold || 5,
      is_active: prod.is_active ?? true,
      is_featured: prod.is_featured ?? false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingProduct) {
        await erpService.updateProduct(editingProduct.id, formData);
      } else {
        await erpService.createProduct(formData);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Save product error:', err);
      setFormError(err.response?.data?.error || err.message || 'Failed to save product.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await erpService.deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product.');
    }
  };

  const handleUploadImages = async () => {
    if (!imageModalProduct || uploadFiles.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      fd.append('images', uploadFiles[i]);
    }

    try {
      const res = await erpService.uploadProductImages(imageModalProduct.id, fd);
      setImageModalProduct(res.data);
      setUploadFiles([]);
      fetchProducts();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!imageModalProduct) return;
    try {
      const res = await erpService.deleteProductImage(imageModalProduct.id, imageId);
      setImageModalProduct(res.data);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete image: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Product Catalog</h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Manage your Bharatanatyam & Temple jewellery collection, pricing, and live inventory.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE5D5] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716D]" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35]"
          >
            <option value="">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt; 5)</option>
            <option value="low_stock">Low Stock (&le; 5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          <button
            onClick={fetchProducts}
            title="Refresh"
            className="p-2 bg-white border border-[#EFE5D5] rounded-xl text-black hover:text-[#C99A35] hover:bg-[#F8F1E5] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A35]' : ''}`} />
          </button>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#77716D]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C99A35]" />
                    <span>Loading products from PostgreSQL...</span>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const mainImg = p.images && p.images[0]?.image_url;
                  const isLow = p.stock_quantity <= (p.low_stock_threshold || 5);
                  const isOut = p.stock_quantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#F8F1E5]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {mainImg ? (
                              <img src={mainImg} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-black line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-[#77716D] flex items-center gap-2 mt-0.5">
                              {p.is_featured && (
                                <span className="text-black font-bold bg-[#F6E2B5] px-1.5 py-0.2 rounded border border-[#C99A35]/30">
                                  Featured
                                </span>
                              )}
                              <span>{p.images?.length || 0} images</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#333333]">{p.sku || 'N/A'}</td>
                      <td className="py-3 px-4 text-black">{p.category?.name || 'Uncategorized'}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-black">{formatINR(p.price)}</div>
                        {p.original_price && Number(p.original_price) > Number(p.price) && (
                          <div className="text-[11px] text-[#77716D] line-through">
                            {formatINR(p.original_price)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isLow
                              ? 'bg-[#F6E2B5] text-black border border-[#C99A35]/30'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {p.stock_quantity} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            p.is_active
                              ? 'bg-[#F8F1E5] text-black border-[#EFE5D5]'
                              : 'bg-gray-100 text-[#77716D] border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.is_active ? 'bg-[#C99A35]' : 'bg-gray-400'
                            }`}
                          />
                          {p.is_active ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setImageModalProduct(p)}
                            title="Manage Images"
                            className="p-1.5 text-black hover:text-[#C99A35] hover:bg-[#F8F1E5] rounded-lg border border-[#EFE5D5] transition-colors"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-black hover:text-[#C99A35] hover:bg-[#F8F1E5] rounded-lg border border-[#EFE5D5] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmProduct(p)}
                            title="Delete Product"
                            className="p-1.5 text-black hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-[#EFE5D5] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#77716D]">
                    No products found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER STATS */}
        <div className="bg-[#F8F1E5] px-6 py-3 border-t border-[#EFE5D5] flex items-center justify-between text-xs text-[#333333]">
          <span>Showing {products.length} products</span>
          <span className="text-black font-semibold">PostgreSQL Synchronized</span>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#EFE5D5] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <h2 className="text-lg font-serif font-bold text-black">
                {editingProduct ? 'Edit Jewellery Product' : 'Add New Jewellery Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-black hover:bg-[#F8F1E5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-[#F8F1E5] border border-[#EFE5D5] text-black rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#C99A35] shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Traditional Temple Kemp Vanki Armlet"
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    SKU / Product Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. RJB-ARM-001"
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    Selling Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 2499"
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    Original / MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="e.g. 3499"
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-black uppercase mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed craftsmanship information, temple gold finish, stones used, size dimensions..."
                    className="w-full px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#C99A35] rounded border-[#EFE5D5] focus:ring-[#C99A35]"
                    />
                    <span className="text-xs font-semibold text-black">Publish Live on Storefront</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-[#C99A35] rounded border-[#EFE5D5] focus:ring-[#C99A35]"
                    />
                    <span className="text-xs font-semibold text-black">Feature on Homepage</span>
                  </label>
                </div>
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
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-xs font-bold shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE MANAGEMENT MODAL (IMAGEKIT INTEGRATION) */}
      {imageModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#EFE5D5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <div>
                <h2 className="text-base font-serif font-bold text-black">Image Gallery & CDN Upload</h2>
                <p className="text-xs text-[#333333] mt-0.5">{imageModalProduct.name}</p>
              </div>
              <button
                onClick={() => setImageModalProduct(null)}
                className="p-1.5 rounded-lg text-black hover:bg-[#F8F1E5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Images */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-black uppercase mb-2">
                Existing Product Images ({imageModalProduct.images?.length || 0})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                {imageModalProduct.images && imageModalProduct.images.length > 0 ? (
                  imageModalProduct.images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[#EFE5D5] bg-[#F8F1E5] aspect-square">
                      <img src={img.image_url} alt="product" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        title="Delete from ImageKit"
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#77716D] col-span-4 py-4 text-center">
                    No images uploaded yet. Upload below to sync to ImageKit CDN.
                  </p>
                )}
              </div>
            </div>

            {/* Upload Area */}
            <div className="mt-6 pt-4 border-t border-[#EFE5D5]">
              <label className="block text-xs font-bold text-black uppercase mb-2">
                Upload New Images (ImageKit Powered)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                className="w-full text-xs text-[#333333] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C99A35] file:text-black hover:file:bg-[#B88928]"
              />

              {uploadFiles.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-black">{uploadFiles.length} file(s) selected</span>
                  <button
                    onClick={handleUploadImages}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-xs font-bold disabled:opacity-60 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-black" />
                    <span>{uploading ? 'Uploading to ImageKit...' : 'Start CDN Upload'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#EFE5D5]">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-black text-base">Delete Product?</h3>
            <p className="text-xs text-[#333333] mt-1">
              Are you sure you want to delete <span className="font-semibold text-black">{deleteConfirmProduct.name}</span>?
              This will remove the item from the customer storefront and database.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 border border-[#EFE5D5] rounded-xl text-xs font-semibold text-black hover:bg-[#F8F1E5]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
