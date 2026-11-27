import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, RefreshCw, X, AlertCircle, Check } from 'lucide-react';
import { erpService } from '../../services/erpService';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    first_name: '',
    last_name: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await erpService.getEmployees();
      setEmployees(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await erpService.createEmployee(formData);
      setModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'EMPLOYEE', first_name: '', last_name: '' });
      fetchEmployees();
    } catch (err) {
      alert('Failed to create staff member: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-black">Staff & Access Control</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Manage administrative personnel, roles (Super Admin, Admin, Manager, Employee), and security permissions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFE5D5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F1E5] text-black font-semibold border-b border-[#EFE5D5]">
              <tr>
                <th className="py-3.5 px-4">Staff Name</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE5D5]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">Loading staff directory...</td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#F3EBDD]/40">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">
                        {`${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.username}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">{emp.username}</td>
                    <td className="py-3.5 px-4 text-gray-500">{emp.email || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.role === 'SUPER_ADMIN' ? 'bg-[#F8F1E5] text-[#C99A35] border border-[#EFE5D5]' :
                        emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        emp.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {emp.role || 'STAFF'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">No staff members listed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EFE5D5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE5D5]">
              <h2 className="text-base font-bold text-black font-serif">Add New Staff Member</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. rajesh_store"
                  className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rajesh@rajbaratham.com"
                  className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Security Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl text-sm text-black"
                >
                  <option value="EMPLOYEE">Employee (Fulfillment &amp; Orders)</option>
                  <option value="MANAGER">Manager (Catalog, Pricing &amp; Stock)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
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
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
