import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, FolderTree, Tag, Plus, ArrowRight, Eye,
  RefreshCw, Sparkles, AlertTriangle, Layers, ExternalLink
} from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, promoRes] = await Promise.all([
        erpService.getProducts(),
        erpService.getCategories(),
        erpService.getPromotions(),
      ]);

      const prodData = prodRes.data?.results || prodRes.data || [];
      const catData = catRes.data?.results || catRes.data || [];
      const promoData = promoRes.data?.results || promoRes.data || [];

      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setPromotions(Array.isArray(promoData) ? promoData : []);
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
      setError('Could not connect to Django backend. Please verify your server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activePromosCount = promotions.filter((p) => p.is_active).length;

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER */}
      <div className="bg-[#F8F1E5] rounded-2xl border border-[#EFE5D5] p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EFE5D5] text-xs font-semibold text-black shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C99A35]" />
              <span>RAJ BARATHAM NEEDS &bull; Catalogue Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight">
              Catalogue Management Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
              Manage all jewellery products, categories, and promotional campaigns with direct synchronization to the PostgreSQL database.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              title="Refresh Data"
              className="p-2.5 bg-white border border-[#EFE5D5] rounded-xl hover:bg-[#F3EBDD] text-black hover:text-[#C99A35] transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A35]' : 'text-black'}`} />
            </button>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#EFE5D5] hover:border-[#C99A35] text-black rounded-xl text-xs font-bold shadow-2xs transition-all"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C99A35]" />
            </a>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#F6E2B5]/40 to-transparent pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 bg-white border border-red-200 text-red-700 rounded-2xl text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-bold text-[#C99A35] hover:underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. THE THREE CORE MANAGEMENT MODULE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: Product Management */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center text-black shadow-2xs group-hover:border-[#C99A35] transition-colors">
                <Package className="w-6 h-6 text-[#C99A35]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F8F1E5] text-black border border-[#EFE5D5]">
                Module 1
              </span>
            </div>
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#76695C]">
                Products Catalogue
              </h2>
              <div className="text-3xl font-serif font-bold text-black mt-1">
                {loading ? '...' : products.length}
              </div>
              <p className="text-xs text-[#333333] mt-1.5 leading-relaxed">
                Add, edit, view and manage jewellery items, prices, descriptions, and side gallery images.
              </p>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-[#EFE5D5] flex items-center gap-2.5">
            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Product</span>
            </Link>
            <Link
              to="/products"
              className="px-3 py-2 rounded-xl border border-[#EFE5D5] bg-white hover:bg-[#F3EBDD] text-black text-xs font-semibold"
            >
              View Table
            </Link>
          </div>
        </div>

        {/* Module 2: Category Management */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center text-black shadow-2xs group-hover:border-[#C99A35] transition-colors">
                <FolderTree className="w-6 h-6 text-[#C99A35]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F8F1E5] text-black border border-[#EFE5D5]">
                Module 2
              </span>
            </div>
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#76695C]">
                Categories Master
              </h2>
              <div className="text-3xl font-serif font-bold text-black mt-1">
                {loading ? '...' : categories.length}
              </div>
              <p className="text-xs text-[#333333] mt-1.5 leading-relaxed">
                Organize collections like Temple Necklaces, Salangai, Pendants, Bangles, and Dance Accessories.
              </p>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-[#EFE5D5] flex items-center gap-2.5">
            <Link
              to="/categories"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Category</span>
            </Link>
            <Link
              to="/categories"
              className="px-3 py-2 rounded-xl border border-[#EFE5D5] bg-white hover:bg-[#F3EBDD] text-black text-xs font-semibold"
            >
              View Table
            </Link>
          </div>
        </div>

        {/* Module 3: Promotion Management */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center text-black shadow-2xs group-hover:border-[#C99A35] transition-colors">
                <Tag className="w-6 h-6 text-[#C99A35]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F8F1E5] text-black border border-[#EFE5D5]">
                Module 3
              </span>
            </div>
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#76695C]">
                Promotions & Discounts
              </h2>
              <div className="text-3xl font-serif font-bold text-black mt-1">
                {loading ? '...' : activePromosCount}
                <span className="text-xs font-normal text-[#76695C] ml-2">
                  / {promotions.length} total
                </span>
              </div>
              <p className="text-xs text-[#333333] mt-1.5 leading-relaxed">
                Configure special offers, percentage or flat rupee discounts applied live in storefront checkout.
              </p>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-[#EFE5D5] flex items-center gap-2.5">
            <Link
              to="/promotions"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Promotion</span>
            </Link>
            <Link
              to="/promotions"
              className="px-3 py-2 rounded-xl border border-[#EFE5D5] bg-white hover:bg-[#F3EBDD] text-black text-xs font-semibold"
            >
              View Table
            </Link>
          </div>
        </div>
      </div>

      {/* 3. RECENT CATALOGUE PRODUCTS (QUICK PREVIEW TABLE) */}
      <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#EFE5D5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center">
              <Package className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-base text-black">
                Recent Catalogue Products
              </h2>
              <p className="text-[11px] text-[#333333]">
                Live records stored in the PostgreSQL database
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-black hover:text-[#C99A35] flex items-center gap-1 transition-colors"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C99A35]" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5] uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Image</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">SKU / Dimensions</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#76695C]">
                    Loading recent products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#76695C]">
                    No products added yet. Click "Add Product" above to create your first item.
                  </td>
                </tr>
              ) : (
                products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F1E5]/40 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <div className="w-10 h-10 rounded-lg border border-[#EFE5D5] bg-[#F8F1E5] overflow-hidden flex items-center justify-center mx-auto">
                        {p.main_image ? (
                          <img
                            src={p.main_image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-[#C99A35]" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-black">
                      <div className="truncate max-w-xs">{p.name}</div>
                      <span className="text-[10px] text-[#76695C] font-mono">#{p.id}</span>
                    </td>
                    <td className="py-2.5 px-4 text-[#333333]">
                      {p.category_name || '—'}
                    </td>
                    <td className="py-2.5 px-4 font-bold font-mono text-black">
                      ₹{Number(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-[#333333]">
                      {p.dimensions || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        to="/products"
                        className="px-3 py-1 rounded-lg border border-[#EFE5D5] bg-white hover:bg-[#F6E2B5] text-black text-xs font-semibold inline-block transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
