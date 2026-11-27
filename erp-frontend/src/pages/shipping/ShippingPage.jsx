import React, { useState, useEffect } from 'react';
import { Truck, Navigation, Search, RefreshCw, Eye, Edit2, CheckCircle } from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function ShippingPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await erpService.getShipments();
      setShipments(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Logistics & Shipments</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Manage parcel dispatches, domestic courier partners (Blue Dart, DTDC, India Post) and AWB tracking.
          </p>
        </div>

        <button
          onClick={fetchShipments}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#EFE5D5] rounded-xl text-xs font-semibold text-black hover:bg-[#F8F1E5] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C99A35]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F1E5] text-black font-semibold border-b border-[#EFE5D5]">
              <tr>
                <th className="py-3.5 px-4">AWB / Tracking #</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Courier Partner</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Dispatch Status</th>
                <th className="py-3.5 px-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">Loading shipments...</td>
                </tr>
              ) : shipments.length > 0 ? (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F3EBDD]/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{s.tracking_number || 'PENDING-AWB'}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-800">{s.order?.order_number || 'Order'}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{s.carrier || 'Blue Dart Express'}</td>
                    <td className="py-3.5 px-4 text-gray-600">{s.destination_city || 'Tamil Nadu'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {s.status || 'IN_TRANSIT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    No active dispatches. When customer orders move to Shipped status, tracking entries appear here.
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
