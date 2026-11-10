import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Eye, IndianRupee, ShoppingBag, Mail, Phone, Calendar } from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await erpService.getCustomers({ search });
      setCustomers(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
          <h1 className="text-2xl font-serif font-bold text-black">Customer Directory</h1>
          <p className="text-xs sm:text-sm text-[#333333] mt-0.5">
            Track customer relationship profiles, purchase frequency, and lifetime value.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs font-semibold text-black hover:bg-[#F8F1E5] hover:text-[#C99A35] shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C99A35]' : 'text-black'}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#EFE5D5] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716D]" />
          <input
            type="text"
            placeholder="Search customers by name, phone number, email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F1E5] text-black font-bold border-b border-[#EFE5D5]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Customer Since</th>
                <th className="py-3.5 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#77716D]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C99A35]" />
                    <span>Loading customer profiles...</span>
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F1E5]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-black">{c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Valued Customer'}</div>
                      <div className="text-[11px] text-[#C99A35] font-bold">Verified Shopper</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-black font-medium">{c.phone || '—'}</div>
                      <div className="text-[11px] text-[#77716D]">{c.email || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#333333]">
                      {c.total_orders || 1} order(s)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-black">
                      {formatINR(c.total_spent || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#77716D]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active Member'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 bg-[#F8F1E5] hover:bg-[#F6E2B5] text-black rounded-lg text-xs font-semibold border border-[#EFE5D5] transition-all"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#77716D]">
                    No customers found. Customer records will be automatically created when orders are placed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
