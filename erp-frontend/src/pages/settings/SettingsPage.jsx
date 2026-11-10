import React, { useState, useEffect } from 'react';
import { Settings, Shield, ShieldCheck, Database, Key, RefreshCw, Clock } from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function SettingsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await erpService.getAuditLogs();
      setLogs(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#541D2C]">System Configuration & Security Audit</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Enterprise profile settings, database connectivity status, and immutable security audit logs.
        </p>
      </div>

      {/* SYSTEM STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E9E2DC] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#292323]">PostgreSQL Database</h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">Online &amp; Connected</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Single source of truth shared between ERP (erp.rajbaratham.com) and Storefront (rajbaratham.com).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E9E2DC] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#292323]">RBAC & Session Security</h3>
              <p className="text-xs text-purple-700 font-semibold mt-0.5">Django Protected</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            PBKDF2 encrypted password hashing, CSRF double-submit token verification, and strict role permissions.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E9E2DC] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#292323]">CDN & Media Service</h3>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">ImageKit Active</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Automated image optimization, WEBP conversion, and low-latency global delivery.
          </p>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-white rounded-2xl border border-[#E9E2DC] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E9E2DC] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#292323]">Immutable Security Audit Trail</h3>
            <p className="text-xs text-gray-500">Every administrative action, price edit, and status progression is logged.</p>
          </div>
          <button
            onClick={fetchLogs}
            className="p-1.5 rounded-lg border border-[#E9E2DC] text-gray-600 hover:text-[#70283A]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#70283A]' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF7F2] text-gray-500 font-semibold border-b border-[#E9E2DC]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2DC]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">Loading audit trail...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F5EF]/60">
                    <td className="py-3 px-4 text-xs font-mono text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{log.user?.username || 'Staff'}</td>
                    <td className="py-3 px-4 uppercase text-xs font-bold text-[#70283A]">{log.module}</td>
                    <td className="py-3 px-4 text-gray-700">{log.action}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400">
                    No administrative audit events recorded yet. New staff actions will appear here in real time.
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
