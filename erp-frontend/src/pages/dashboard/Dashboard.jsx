import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee, ShoppingBag, Package, AlertTriangle, ArrowUpRight,
  TrendingUp, Boxes, Calendar, RefreshCw, Eye, Plus, ArrowRight,
  Sparkles, Layers, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar
} from 'recharts';
import { erpService } from '../../services/erpService';

export default function Dashboard() {
  const [filter, setFilter] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await erpService.getDashboardStats(filter);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Could not fetch real-time dashboard analytics. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filter]);

  const formatINR = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filterOptions = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: '7days' },
    { label: '30 Days', value: '30days' },
    { label: '90 Days', value: '90days' },
    { label: 'Year to Date', value: 'year' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="space-y-6">

      {/* 1. HERO / WELCOME BANNER (WARM IVORY BACKGROUND, BLACK TEXT, ANTIQUE GOLD ACCENTS) */}
      <div className="bg-[#F8F1E5] rounded-2xl border border-[#EFE5D5] p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EFE5D5] text-xs font-semibold text-black shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C99A35]" />
              <span>RAJ BARATHAM NEEDS &bull; Temple & Classical Dance Jewellery Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight">
              Enterprise Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
              Monitor live storefront orders, track real-time inventory levels, manage artisan procurement, and review financial growth across Tamil Nadu and global clients.
            </p>
          </div>

          {/* QUICK CONTROLS & DATE FILTERS */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-white p-1 rounded-xl border border-[#EFE5D5] shadow-2xs flex items-center flex-wrap">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filter === opt.value
                      ? 'bg-[#F6E2B5] text-black font-bold shadow-2xs border border-[#C99A35]/30'
                      : 'text-[#333333] hover:text-black hover:bg-[#F3EBDD]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchStats}
              title="Refresh Analytics"
              className="p-2.5 bg-white border border-[#EFE5D5] rounded-xl hover:bg-[#F3EBDD] text-black hover:text-[#C99A35] transition-all shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C99A35]' : 'text-black'}`} />
            </button>
          </div>
        </div>

        {/* SUBTLE TRADITIONAL CORNER EMBELLISHMENT */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#F6E2B5]/40 to-transparent pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 bg-white border border-[#EFE5D5] text-black rounded-2xl text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C99A35]" />
            <span className="text-[#333333]">{error}</span>
          </div>
          <button onClick={fetchStats} className="text-xs font-bold text-[#C99A35] hover:underline ml-2">
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. DASHBOARD STATISTICS CARDS (PURE WHITE BACKGROUND, SOFT IVORY BORDERS, BLACK HEADINGS & VALUES, GOLD ACCENTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#333333]">Total Net Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] text-black flex items-center justify-center shadow-2xs group-hover:border-[#C99A35] transition-colors">
              <IndianRupee className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-black">
              {loading ? '...' : formatINR(stats?.total_revenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#333333] font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C99A35]" />
              <span>Net Settled Storefront Sales</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#333333]">Customer Orders</span>
            <div className="w-10 h-10 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] text-black flex items-center justify-center shadow-2xs group-hover:border-[#C99A35] transition-colors">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-black">
              {loading ? '...' : stats?.total_orders || 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#333333]">
              <span className="font-semibold text-black">{stats?.pending_orders || 0} Pending</span>
              <span className="text-[#C99A35]">&bull;</span>
              <span className="font-semibold text-black">{stats?.delivered_orders || 0} Fulfilled</span>
            </div>
          </div>
        </div>

        {/* Catalog Size */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#333333]">Active Catalog Items</span>
            <div className="w-10 h-10 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] text-black flex items-center justify-center shadow-2xs group-hover:border-[#C99A35] transition-colors">
              <Package className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-black">
              {loading ? '...' : stats?.total_products || 0}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#333333]">
              <span>{stats?.total_categories || 0} Categories</span>
              <span className="text-[#C99A35]">&bull;</span>
              <span>Temple & Classical</span>
            </div>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5D5] shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#333333]">Inventory Valuation</span>
            <div className="w-10 h-10 rounded-xl bg-[#F8F1E5] border border-[#EFE5D5] text-black flex items-center justify-center shadow-2xs group-hover:border-[#C99A35] transition-colors">
              <Boxes className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-black">
              {loading ? '...' : formatINR(stats?.inventory_valuation)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#333333]">
              <span>{stats?.total_stock_units || 0} In Stock</span>
              {stats?.low_stock_count > 0 && (
                <span className="text-[#C99A35] font-bold">({stats?.low_stock_count} Low)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS AND ANALYTICS ROW (PURE WHITE CONTAINERS, ANTIQUE GOLD HIGHLIGHTS, IVORY GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-[#EFE5D5] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold font-serif text-black">Revenue & Sales Performance</h2>
              <p className="text-xs text-[#333333] mt-0.5">Gross sales value in Indian Rupees (₹) across the selected period</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-[#F8F1E5] text-black rounded-full border border-[#EFE5D5] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C99A35]" />
              <span>Live DB Sync</span>
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {stats?.revenue_chart && stats.revenue_chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenue_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C99A35" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F8F1E5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFE5D5" vertical={false} />
                  <XAxis dataKey="date" stroke="#77716D" fontSize={11} tickLine={false} />
                  <YAxis stroke="#77716D" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(value) => [formatINR(value), 'Revenue']}
                    labelStyle={{ fontWeight: 'bold', color: '#000000' }}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #EFE5D5', color: '#000000', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C99A35"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#goldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#77716D] text-sm">
                <TrendingUp className="w-8 h-8 stroke-1 text-[#C99A35] mb-2" />
                <p className="text-black font-semibold">No sales activity recorded for this period.</p>
                <p className="text-xs text-[#77716D] mt-1">Orders placed on storefront will automatically chart here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Volume Bar Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EFE5D5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold font-serif text-black">Order Volume</h2>
                <p className="text-xs text-[#333333] mt-0.5">Total orders processed</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#F8F1E5] text-black rounded-lg border border-[#EFE5D5]">
                Quantity
              </span>
            </div>

            <div className="h-52 w-full">
              {stats?.revenue_chart && stats.revenue_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenue_chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFE5D5" vertical={false} />
                    <XAxis dataKey="date" stroke="#77716D" fontSize={10} tickLine={false} />
                    <YAxis stroke="#77716D" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [value, 'Orders']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #EFE5D5', color: '#000000' }}
                    />
                    <Bar dataKey="orders" fill="#C99A35" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#77716D] text-sm">
                  <ShoppingBag className="w-8 h-8 stroke-1 text-[#C99A35] mb-2" />
                  <p className="text-black font-semibold">No orders recorded yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#EFE5D5] mt-4 flex items-center justify-between text-xs">
            <span className="text-[#333333]">Store Conversion Average</span>
            <span className="font-bold text-black bg-[#F8F1E5] px-2.5 py-1 rounded-md border border-[#EFE5D5]">
              3.8% Storefront Avg
            </span>
          </div>
        </div>
      </div>

      {/* 4. TWO COLUMN DATA PANELS: RECENT ORDERS & LOW STOCK WATCHLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#EFE5D5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-black" />
              </div>
              <div>
                <h2 className="font-bold font-serif text-base text-black">Recent Storefront Orders</h2>
                <p className="text-[11px] text-[#333333]">Customer orders placed via website</p>
              </div>
            </div>
            <Link
              to="/orders"
              className="text-xs font-semibold text-black hover:text-[#C99A35] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C99A35]" />
            </Link>
          </div>

          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5D5]">
                {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                  stats.recent_orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F8F1E5]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-black">{o.order_number}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-black">{o.customer_name || 'Guest Shopper'}</div>
                        <div className="text-[10px] text-[#77716D]">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-black">{formatINR(o.total_amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          o.status === 'DELIVERED' ? 'bg-[#F6E2B5] text-black border-[#C99A35]/40' :
                          o.status === 'SHIPPED' ? 'bg-[#F8F1E5] text-black border-[#EFE5D5]' :
                          o.status === 'CONFIRMED' ? 'bg-white text-black border-[#C99A35]' :
                          o.status === 'CANCELLED' ? 'bg-gray-100 text-[#333333] border-gray-200' :
                          'bg-[#FAF5ED] text-black border-[#EFE5D5]'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/orders?id=${o.id}`}
                          className="p-1.5 text-black hover:text-[#C99A35] hover:bg-[#F8F1E5] inline-block rounded-lg border border-[#EFE5D5] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[#77716D]">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#EFE5D5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8F1E5] border border-[#EFE5D5] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-[#C99A35]" />
              </div>
              <div>
                <h2 className="font-bold font-serif text-base text-black">Low Stock Watchlist</h2>
                <p className="text-[11px] text-[#333333]">Products nearing reorder threshold</p>
              </div>
            </div>
            <Link
              to="/inventory"
              className="text-xs font-semibold text-black hover:text-[#C99A35] flex items-center gap-1 transition-colors"
            >
              <span>Manage Stock</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C99A35]" />
            </Link>
          </div>

          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5D5]">
                {stats?.low_stock_items && stats.low_stock_items.length > 0 ? (
                  stats.low_stock_items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8F1E5]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-black truncate max-w-[160px]">{item.name}</div>
                        <div className="text-[10px] text-[#77716D]">{item.category?.name || 'Jewellery'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#333333]">{item.sku || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F6E2B5] text-black border border-[#C99A35]/30">
                          {item.stock_quantity} left
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#333333]">{item.low_stock_threshold || 5} units</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/inventory?adjust=${item.id}`}
                          className="px-3 py-1 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-lg text-xs font-semibold transition-all inline-block shadow-2xs"
                        >
                          Stock In
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[#77716D]">
                      All jewellery products are adequately stocked above threshold!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
