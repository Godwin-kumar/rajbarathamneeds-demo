import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes, Plus, ArrowUpRight, ArrowDownRight, History, Search,
  AlertTriangle, RefreshCw, X, Check, FileText
} from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function InventoryList() {
  const [searchParams] = useSearchParams();
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements'
  const [search, setSearch] = useState('');

  // Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [movementType, setMovementType] = useState('IN');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [invRes, movRes] = await Promise.all([
        erpService.getInventory({ search }),
        erpService.getInventoryMovements(),
      ]);
      setInventory(invRes.data?.results || invRes.data || []);
      setMovements(movRes.data?.results || movRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  useEffect(() => {
    const adjustId = searchParams.get('adjust');
    if (adjustId && inventory.length > 0) {
      setSelectedProduct(adjustId);
      setMovementType('IN');
      setAdjustModalOpen(true);
    }
  }, [searchParams, inventory]);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Please select a product.');
      return;
    }
    setSubmitting(true);
    try {
      await erpService.adjustStock({
        product_id: selectedProduct,
        movement_type: movementType,
        quantity: parseInt(quantity),
        notes: notes || `Stock ${movementType} adjustment recorded via ERP`,
      });
      setAdjustModalOpen(false);
      setNotes('');
      fetchInventory();
    } catch (err) {
      alert('Adjustment failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Real-time jewellery stock levels, stock-in replenishment, and immutable audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(inventory.length > 0 ? inventory[0].id : '');
            setAdjustModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Record Stock Movement</span>
        </button>
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE5D5] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#F8F1E5] p-1 rounded-xl border border-[#EFE5D5]">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'stock'
                ? 'bg-[#F6E2B5] text-black font-bold shadow-2xs border border-[#C99A35]/30'
                : 'text-[#333333] hover:text-black hover:bg-[#F3EBDD]'
            }`}
          >
            Live Warehouse Stock
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'movements'
                ? 'bg-[#F6E2B5] text-black font-bold shadow-2xs border border-[#C99A35]/30'
                : 'text-[#333333] hover:text-black hover:bg-[#F3EBDD]'
            }`}
          >
            Movement Audit Trail
          </button>
        </div>

        {activeTab === 'stock' && (
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716D]" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-[#EFE5D5] rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35]"
            />
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      {activeTab === 'stock' ? (
        <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
                <tr>
                  <th className="py-3.5 px-4">Jewellery Item</th>
                  <th className="py-3.5 px-4">SKU Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Available Quantity</th>
                  <th className="py-3.5 px-4">Threshold</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5D5]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#77716D]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C99A35]" />
                      <span>Loading inventory metrics...</span>
                    </td>
                  </tr>
                ) : inventory.length > 0 ? (
                  inventory.map((item) => {
                    const isLow = item.stock_quantity <= (item.low_stock_threshold || 5);
                    const isOut = item.stock_quantity === 0;

                    return (
                      <tr key={item.id} className="hover:bg-[#F8F1E5]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-black">{item.name}</td>
                        <td className="py-3 px-4 font-mono text-[#333333]">{item.sku || 'N/A'}</td>
                        <td className="py-3 px-4 text-[#333333]">{item.category?.name || 'Jewellery'}</td>
                        <td className="py-3 px-4 font-bold text-black">{item.stock_quantity} units</td>
                        <td className="py-3 px-4 text-[#77716D]">{item.low_stock_threshold || 5} units</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              isOut
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : isLow
                                ? 'bg-[#F6E2B5] text-black border-[#C99A35]/30'
                                : 'bg-[#F8F1E5] text-black border-[#EFE5D5]'
                            }`}
                          >
                            {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProduct(item.id);
                              setMovementType('IN');
                              setAdjustModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#F8F1E5] hover:bg-[#F6E2B5] text-black rounded-lg text-xs font-semibold border border-[#EFE5D5] transition-all inline-flex items-center gap-1"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#77716D]">
                      No stock records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* MOVEMENTS AUDIT TRAIL */
        <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Quantity Changed</th>
                  <th className="py-3.5 px-4">Balance After</th>
                  <th className="py-3.5 px-4">Logged By / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5D5]">
                {movements.length > 0 ? (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F8F1E5]/50">
                      <td className="py-3 px-4 text-[#77716D] text-xs font-mono">
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-black">{m.product?.name || 'Product'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            m.movement_type === 'IN' || m.movement_type === 'PURCHASE'
                              ? 'bg-[#F6E2B5] text-black border-[#C99A35]/30'
                              : m.movement_type === 'OUT' || m.movement_type === 'ORDER'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-[#F8F1E5] text-black border-[#EFE5D5]'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-black">
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#333333]">{m.balance_after} units</td>
                      <td className="py-3 px-4 text-[#333333] text-xs">
                        <div>{m.notes || 'Warehouse adjustment'}</div>
                        <div className="text-[10px] text-[#77716D]">Recorded by: {m.created_by?.username || 'Staff'}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-[#77716D]">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUSTMENT MODAL */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#EFE5D5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <h2 className="text-base font-serif font-bold text-black">Record Stock Adjustment</h2>
              <button onClick={() => setAdjustModalOpen(false)} className="p-1.5 rounded-lg text-black hover:bg-[#F8F1E5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Product *</label>
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                >
                  <option value="">Select Item</option>
                  {inventory.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (Current: {it.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Movement Type</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  >
                    <option value="IN">STOCK IN (+)</option>
                    <option value="OUT">STOCK OUT (-)</option>
                    <option value="CORRECTION">CORRECTION</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Units *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Reason / Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received new shipment from temple artisan workshop in Madurai"
                  className="w-full px-3 py-2 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:ring-2 focus:ring-[#C99A35] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE5D5]">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 border border-[#EFE5D5] rounded-xl text-xs font-semibold text-black hover:bg-[#F8F1E5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-xs font-bold shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Recording...' : 'Save Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
