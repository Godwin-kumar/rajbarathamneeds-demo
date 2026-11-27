import React, { useState, useEffect } from 'react';
import {
  Coins, IndianRupee, TrendingUp, TrendingDown, Plus, RefreshCw, X, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function FinancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: 'EXPENSE',
    category: 'WORKSHOP_CHARGES',
    amount: '',
    description: '',
    reference_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await erpService.getFinance();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await erpService.createFinanceTransaction(formData);
      setModalOpen(false);
      setFormData({
        transaction_type: 'EXPENSE',
        category: 'WORKSHOP_CHARGES',
        amount: '',
        description: '',
        reference_id: '',
      });
      fetchFinance();
    } catch (err) {
      alert('Transaction error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const netProfit = Number(data?.net_profit || (Number(data?.total_income || 0) - Number(data?.total_expense || 0)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Sales & Financial Accounts</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Track business cash flow, jewellery crafting costs, marketing expenses, and net profit.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense / Entry</span>
        </button>
      </div>

      {/* FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5D5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Inflow (Income)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-serif text-emerald-800">
            {loading ? '...' : formatINR(data?.total_income || 0)}
          </div>
          <p className="text-xs text-gray-400 mt-1">E-commerce storefront sales + credits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5D5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Outflow (Expense)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-serif text-rose-700">
            {loading ? '...' : formatINR(data?.total_expense || 0)}
          </div>
          <p className="text-xs text-gray-400 mt-1">Procurement, logistics & operating costs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5D5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Net Profit / P&amp;L</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-[#F8F1E5] text-[#C99A35]' : 'bg-rose-50 text-rose-600'}`}>
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 text-2xl font-bold font-serif ${netProfit >= 0 ? 'text-black' : 'text-rose-700'}`}>
            {loading ? '...' : formatINR(netProfit)}
          </div>
          <p className="text-xs text-gray-400 mt-1">Net operational balance</p>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFE5D5] flex items-center justify-between">
          <h3 className="font-bold text-sm text-black">Ledger Transaction Journal</h3>
          <span className="text-xs text-gray-500">Automated Financial Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F1E5] text-black font-semibold border-b border-[#EFE5D5]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">Loading ledger...</td>
                </tr>
              ) : data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F3EBDD]/40">
                    <td className="py-3 px-4 text-gray-500 text-xs font-mono">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{t.category}</td>
                    <td className="py-3 px-4 text-gray-600">{t.description || 'General entry'}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{t.reference_id || '—'}</td>
                    <td className={`py-3 px-4 text-right font-bold ${t.transaction_type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {t.transaction_type === 'INCOME' ? `+${formatINR(t.amount)}` : `-${formatINR(t.amount)}`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400">
                    No manual transactions logged. Store orders automatically log under sales income.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD ENTRY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EFE5D5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <h2 className="text-base font-bold text-black font-serif">Record Financial Transaction</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, transaction_type: 'EXPENSE' })}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      formData.transaction_type === 'EXPENSE'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'border-[#EFE5D5] text-gray-600'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, transaction_type: 'INCOME' })}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      formData.transaction_type === 'INCOME'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-[#EFE5D5] text-gray-600'
                    }`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. WORKSHOP_CHARGES, LOGISTICS, PACKAGING, RAW_MATERIALS"
                  className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (INR ₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description / Memo</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Temple brass polish and velvet presentation boxes"
                  className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                ></textarea>
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
                  className="px-5 py-2 bg-[#C99A35] text-black rounded-xl text-xs font-semibold shadow-sm hover:bg-[#B88928] disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Record Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
