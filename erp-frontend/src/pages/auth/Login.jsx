import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.errors?.detail ||
        err.response?.data?.detail ||
        err.message ||
        'Authentication failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F1E5] flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="max-w-md w-full">
        {/* BRAND LOGO & HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-black shadow-xs mb-4 border border-[#EFE5D5]">
            <span className="font-serif font-bold text-2xl tracking-wider">
              <span className="text-black">R</span>
              <span className="text-[#C99A35]">B</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-wide">
            RAJ BARATHAM NEEDS
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#C99A35] font-bold mt-1">
            Enterprise Resource Planning Portal
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#EFE5D5] text-black rounded-full text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C99A35] animate-pulse"></span>
            erp.rajbaratham.com &bull; Secure Access
          </div>
        </div>

        {/* LOGIN CARD (PURE WHITE) */}
        <div className="bg-white rounded-2xl shadow-xs border border-[#EFE5D5] overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-black">Portal Sign In</h2>
              <p className="text-xs sm:text-sm text-[#333333] mt-1">
                Enter your administrative credentials to access enterprise ERP operations.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#F8F1E5] border border-[#EFE5D5] rounded-xl flex items-start gap-3 text-black text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#C99A35] mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-black">Authentication Failed</p>
                  <p className="text-xs mt-0.5 text-[#333333]">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Username or Staff ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#333333]">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#333333]">
                    <Lock className="w-4 h-4 text-black" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#EFE5D5] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#C99A35] focus:border-transparent transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#77716D] hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#C99A35] hover:bg-[#B88928] text-black rounded-xl font-bold text-sm shadow-xs transition-all duration-200 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Secure Sign In</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-[#F8F1E5] px-6 py-4 border-t border-[#EFE5D5] flex items-center justify-between text-xs text-[#333333]">
            <span className="flex items-center gap-1.5 text-black font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C99A35]"></span>
              256-bit SSL Session
            </span>
            <span className="font-semibold text-black">Role-Based Access Control</span>
          </div>
        </div>

        {/* QUICK CREDENTIALS HINT */}
        <div className="mt-6 p-3.5 bg-white rounded-xl border border-[#EFE5D5] text-center text-xs text-[#333333] shadow-2xs">
          <p className="font-bold text-black">Administrator Sign-In Credentials:</p>
          <p className="mt-1 font-mono text-black">Username: <span className="font-bold text-black">admin</span> | Password: <span className="font-bold text-black">Admin@123</span></p>
        </div>

        <p className="text-center text-xs text-[#77716D] mt-6">
          &copy; {new Date().getFullYear()} RAJ BARATHAM NEEDS. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
