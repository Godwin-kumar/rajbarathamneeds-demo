import React, { useState, useEffect } from 'react';
import { Truck, ShoppingCart, Plus, CheckCircle, Eye, RefreshCw, X, AlertCircle } from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'suppliers'
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supplier modal
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '', contact_person: '', phone: '', email: '', city: '', gst_number: ''
  });

  // PO modal
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    supplier_id: '',
    notes: '',
    items: [{ product_id: '', quantity: 10, unit_price: 500 }],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, prRes] = await Promise.all([
        erpService.getPurchases(),
        erpService.getSuppliers(),
        erpService.getProducts(),
      ]);
      setPurchases(pRes.data?.results || pRes.data || []);
      setSuppliers(sRes.data?.results || sRes.data || []);
      setProducts(prRes.data?.results || prRes.data || []);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await erpService.createSupplier(supplierForm);
      setSupplierModalOpen(false);
      setSupplierForm({ name: '', contact_person: '', phone: '', email: '', city: '', gst_number: '' });
      fetchData();
    } catch (err) {
      alert('Error saving supplier: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!poForm.supplier_id) {
      alert('Please select a supplier.');
      return;
    }
    try {
      await erpService.createPurchaseOrder(poForm);
      setPoModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error creating PO: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReceiveGoods = async (poId) => {
    if (!window.confirm('Receive goods for this Purchase Order? Product inventory stock will automatically increment.')) return;
    try {
      await erpService.receivePurchaseGoods(poId);
      alert('Goods received successfully! Stock levels have been updated.');
      fetchData();
    } catch (err) {
      alert('Goods receipt error: ' + (err.response?.data?.error || err.message));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#541D2C]">Suppliers & Procurement</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage jewellery artisans, workshops, procurement orders, and goods receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orders' ? (
            <button
              onClick={() => {
                setPoForm({
                  supplier_id: suppliers[0]?.id || '',
                  notes: '',
                  items: [{ product_id: products[0]?.id || '', quantity: 10, unit_price: 500 }],
                });
                setPoModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#70283A] hover:bg-[#541D2C] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          ) : (
            <button
              onClick={() => setSupplierModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#70283A] hover:bg-[#541D2C] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Artisan / Supplier</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E9E2DC] shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'orders' ? 'bg-[#70283A] text-white' : 'text-gray-600 hover:text-[#70283A]'
          }`}
        >
          Purchase Orders ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'suppliers' ? 'bg-[#70283A] text-white' : 'text-gray-600 hover:text-[#70283A]'
          }`}
        >
          Artisans & Suppliers ({suppliers.length})
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="bg-white rounded-2xl border border-[#E9E2DC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF7F2] text-gray-500 font-semibold border-b border-[#E9E2DC]">
                <tr>
                  <th className="py-3.5 px-4">PO Number</th>
                  <th className="py-3.5 px-4">Supplier / Artisan</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2DC]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      Loading purchase records...
                    </td>
                  </tr>
                ) : purchases.length > 0 ? (
                  purchases.map((po) => (
                    <tr key={po.id} className="hover:bg-[#F8F5EF]/60">
                      <td className="py-3 px-4 font-mono font-bold text-[#541D2C]">{po.po_number}</td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{po.supplier?.name || 'Artisan Workshop'}</td>
                      <td className="py-3 px-4 text-gray-500">{po.order_date || 'N/A'}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{formatINR(po.total_amount)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            po.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.status === 'ORDERED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {po.status !== 'RECEIVED' ? (
                          <button
                            onClick={() => handleReceiveGoods(po.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Receive Goods</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-xs">Stock Added</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SUPPLIERS TABLE */
        <div className="bg-white rounded-2xl border border-[#E9E2DC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF7F2] text-gray-500 font-semibold border-b border-[#E9E2DC]">
                <tr>
                  <th className="py-3.5 px-4">Artisan / Firm Name</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Phone / Email</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">GST / Tax ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2DC]">
                {suppliers.length > 0 ? (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F8F5EF]/60">
                      <td className="py-3 px-4 font-semibold text-[#292323]">{s.name}</td>
                      <td className="py-3 px-4 text-gray-700">{s.contact_person || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900">{s.phone || '—'}</div>
                        <div className="text-[11px] text-gray-400">{s.email || ''}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{s.city || 'Tamil Nadu'}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{s.gst_number || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400">
                      No suppliers registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {poModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E9E2DC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9E2DC]">
              <h2 className="text-base font-bold text-[#541D2C]">Create Purchase Order</h2>
              <button onClick={() => setPoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Artisan / Supplier *</label>
                <select
                  required
                  value={poForm.supplier_id}
                  onChange={(e) => setPoForm({ ...poForm, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                >
                  <option value="">Select</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Item *</label>
                <select
                  required
                  value={poForm.items[0]?.product_id}
                  onChange={(e) => {
                    const newItems = [...poForm.items];
                    newItems[0].product_id = e.target.value;
                    setPoForm({ ...poForm, items: newItems });
                  }}
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                >
                  <option value="">Select Item</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Order Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poForm.items[0]?.quantity}
                    onChange={(e) => {
                      const newItems = [...poForm.items];
                      newItems[0].quantity = parseInt(e.target.value) || 1;
                      setPoForm({ ...poForm, items: newItems });
                    }}
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unit Cost Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poForm.items[0]?.unit_price}
                    onChange={(e) => {
                      const newItems = [...poForm.items];
                      newItems[0].unit_price = parseFloat(e.target.value) || 0;
                      setPoForm({ ...poForm, items: newItems });
                    }}
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9E2DC]">
                <button
                  type="button"
                  onClick={() => setPoModalOpen(false)}
                  className="px-4 py-2 border border-[#E9E2DC] rounded-xl text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#70283A] text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#541D2C]"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9E2DC]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9E2DC]">
              <h2 className="text-base font-bold text-[#541D2C]">Add Artisan / Supplier</h2>
              <button onClick={() => setSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Artisan / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. Madurai Temple Craftsmen Guild"
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City / Region</label>
                  <input
                    type="text"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E9E2DC] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9E2DC]">
                <button
                  type="button"
                  onClick={() => setSupplierModalOpen(false)}
                  className="px-4 py-2 border border-[#E9E2DC] rounded-xl text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#70283A] text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#541D2C]"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
