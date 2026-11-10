import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Search, Filter, Eye, Printer, CheckCircle,
  Truck, XCircle, Clock, AlertCircle, RefreshCw, X, ChevronRight, User, Phone, MapPin
} from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await erpService.getOrders(params);
      setOrders(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setStatusSubmitting(true);
    try {
      const res = await erpService.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: transitionNotes || `Status updated to ${newStatus} via ERP dashboard`,
      });
      setSelectedOrder(res.data);
      setTransitionNotes('');
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status: ' + (err.response?.data?.error || err.message));
    } finally {
      setStatusSubmitting(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const statusTabs = [
    { label: 'All Orders', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Orders & Fulfillment</h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Process customer orders, verify dispatch tracking, and generate GST-compliant invoices.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          title="Refresh Orders"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs font-semibold text-black hover:bg-[#F8F1E5] hover:text-[#C99A35] shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C99A35]' : 'text-black'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* STATUS TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE5D5] shadow-xs space-y-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#EFE5D5]">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#F6E2B5] text-black font-bold shadow-2xs border border-[#C99A35]/30'
                  : 'text-[#333333] hover:text-black hover:bg-[#F3EBDD]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716D]" />
          <input
            type="text"
            placeholder="Search by Order # (e.g. ORD-), customer name, or mobile phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35]"
          />
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#77716D]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C99A35]" />
                    <span>Loading customer orders...</span>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F8F1E5]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{o.order_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-black">{o.customer_name || 'Guest Shopper'}</div>
                      <div className="text-[11px] text-[#77716D]">{o.phone || o.customer_email || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#333333]">
                      {o.items?.length || 1} items
                    </td>
                    <td className="py-3.5 px-4 font-bold text-black">
                      {formatINR(o.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-[#333333] uppercase">
                        {o.payment_method || 'Prepaid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        o.status === 'DELIVERED' ? 'bg-[#F6E2B5] text-black border-[#C99A35]/30' :
                        o.status === 'SHIPPED' ? 'bg-[#F8F1E5] text-black border-[#EFE5D5]' :
                        o.status === 'CONFIRMED' ? 'bg-white text-black border-[#C99A35]' :
                        o.status === 'CANCELLED' ? 'bg-gray-100 text-[#77716D] border-gray-200' :
                        'bg-[#FAF5ED] text-black border-[#EFE5D5]'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#77716D]">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 bg-[#F8F1E5] hover:bg-[#F6E2B5] text-black rounded-lg text-xs font-semibold border border-[#EFE5D5] transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-black" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#77716D]">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#F8F1E5] px-6 py-3 border-t border-[#EFE5D5] flex items-center justify-between text-xs text-[#333333]">
          <span>Total {orders.length} order(s) listed</span>
          <span className="text-black font-semibold">Shared Storefront Database</span>
        </div>
      </div>

      {/* ORDER DETAILS & INVOICE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-xl border border-[#EFE5D5] my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-serif text-black">
                    Order {selectedOrder.order_number}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                    selectedOrder.status === 'DELIVERED' ? 'bg-[#F6E2B5] text-black border-[#C99A35]/30' :
                    selectedOrder.status === 'SHIPPED' ? 'bg-[#F8F1E5] text-black border-[#EFE5D5]' :
                    'bg-[#FAF5ED] text-black border-[#EFE5D5]'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-[#333333] mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-black hover:text-[#C99A35] hover:bg-[#F8F1E5] rounded-xl border border-[#EFE5D5] transition-colors"
                  title="Print Packing Slip / Invoice"
                >
                  <Printer className="w-4 h-4 text-black" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-black hover:bg-[#F8F1E5] rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 p-4 bg-[#F8F1E5] rounded-xl border border-[#EFE5D5]">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1 mb-1">
                  <User className="w-3.5 h-3.5 text-[#C99A35]" />
                  <span>Customer Details</span>
                </h4>
                <div className="text-sm font-semibold text-black">{selectedOrder.customer_name || 'Guest Shopper'}</div>
                <div className="text-xs text-[#333333] mt-0.5">{selectedOrder.phone || 'No phone provided'}</div>
                <div className="text-xs text-[#77716D]">{selectedOrder.customer_email || 'No email'}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C99A35]" />
                  <span>Shipping Address</span>
                </h4>
                <div className="text-xs text-black whitespace-pre-line">
                  {selectedOrder.shipping_address || 'No shipping address recorded.'}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="border border-[#EFE5D5] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE5D5]">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-[#F8F1E5]/50">
                          <td className="py-2.5 px-3 font-semibold text-black">
                            {it.product_name || it.product?.name || 'Jewellery Item'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#333333]">{it.sku || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-right text-black">{formatINR(it.price)}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-black">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-black">{formatINR(it.subtotal || it.price * it.quantity)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-[#77716D]">
                          Direct single item purchase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#333333]">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-black">{formatINR(selectedOrder.total_amount)}</span>
                </div>
                <div className="flex justify-between text-[#333333]">
                  <span>Delivery Charges:</span>
                  <span className="text-black font-semibold">FREE (Express Delivery)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-2 border-t border-[#EFE5D5]">
                  <span>Total Amount:</span>
                  <span>{formatINR(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Status Workflow Action Bar */}
            <div className="mt-6 pt-5 border-t border-[#EFE5D5]">
              <label className="block text-xs font-bold uppercase text-black mb-2">
                Update Order Status Workflow
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={statusSubmitting || selectedOrder.status === 'CONFIRMED'}
                  onClick={() => handleUpdateStatus('CONFIRMED')}
                  className="px-4 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-black" />
                  <span>Confirm Order</span>
                </button>

                <button
                  type="button"
                  disabled={statusSubmitting || selectedOrder.status === 'SHIPPED'}
                  onClick={() => handleUpdateStatus('SHIPPED')}
                  className="px-4 py-2 bg-white border border-[#EFE5D5] hover:bg-[#F8F1E5] text-black rounded-xl text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Truck className="w-3.5 h-3.5 text-black" />
                  <span>Mark Shipped</span>
                </button>

                <button
                  type="button"
                  disabled={statusSubmitting || selectedOrder.status === 'DELIVERED'}
                  onClick={() => handleUpdateStatus('DELIVERED')}
                  className="px-4 py-2 bg-[#F6E2B5] border border-[#C99A35]/30 hover:bg-[#ebd5a0] text-black rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-black" />
                  <span>Mark Delivered</span>
                </button>

                <button
                  type="button"
                  disabled={statusSubmitting || selectedOrder.status === 'CANCELLED'}
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
