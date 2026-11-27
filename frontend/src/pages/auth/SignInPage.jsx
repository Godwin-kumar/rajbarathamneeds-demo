import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  X,
  Lock,
  Mail,
  User,
  Phone,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

/**
 * Simplified, Clean and Professional Sign In Page for Natyam Gold.
 * Prioritizes minimal styling, clear typography, and mobile responsiveness.
 */
export const SignInPage = ({ initialMode = 'signin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, logout, isAuthenticated } = useAuth();

  // Active tab state: 'signin' or 'register'
  const [activeTab, setActiveTab] = useState(() => {
    if (
      initialMode === 'register' ||
      location.pathname.includes('/register') ||
      location.pathname.includes('/signup') ||
      location.search.includes('mode=register')
    ) {
      return 'register';
    }
    return 'signin';
  });

  // Keep active tab in sync with URL changes
  useEffect(() => {
    if (
      location.pathname.includes('/register') ||
      location.pathname.includes('/signup') ||
      location.search.includes('mode=register')
    ) {
      setActiveTab('register');
    } else if (
      location.pathname.includes('/signin') ||
      location.pathname.includes('/login')
    ) {
      setActiveTab('signin');
    }
  }, [location.pathname, location.search]);

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State (Preserved for registration mode)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI Feedback State
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Redirect target
  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect') || location.state?.from || '/';

  // Load remembered identifier if saved
  useEffect(() => {
    try {
      const savedIdentifier = localStorage.getItem('m_remember_identifier');
      if (savedIdentifier) {
        setSignInIdentifier(savedIdentifier);
      }
    } catch {
      // ignore
    }
  }, []);

  // Password strength for registration
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: '', color: '' };
    let score = 0;
    if (regPassword.length >= 6) score += 1;
    if (regPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(regPassword)) score += 1;
    if (/[0-9]/.test(regPassword) || /[^A-Za-z0-9]/.test(regPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: '', color: 'bg-gray-200' };
    }
  }, [regPassword]);

  // Tab switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setGeneralError('');
    setFieldErrors({});
    setActionSuccess('');
  };

  // Sign In Validation
  const validateSignIn = () => {
    const errors = {};
    const trimmedId = signInIdentifier.trim();

    if (!trimmedId) {
      errors.identifier = 'Please enter your email or mobile number.';
    }

    if (!signInPassword) {
      errors.password = 'Please enter your password.';
    } else if (signInPassword.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Register Validation
  const validateRegister = () => {
    const errors = {};
    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName) {
      errors.name = 'Please enter your full name.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Please provide an email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!regPassword) {
      errors.password = 'Please create a password.';
    } else if (regPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.terms = 'Please accept the terms and conditions.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setActionSuccess('');

    if (!validateSignIn()) return;

    setLoading(true);
    try {
      await login({
        username: signInIdentifier.trim(),
        password: signInPassword,
        rememberMe,
      });

      setActionSuccess('Signed in successfully.');
      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 500);
    } catch (err) {
      console.error('Sign In error:', err);
      setGeneralError(
        err.message || 'Invalid email/mobile number or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setActionSuccess('');

    if (!validateRegister()) return;

    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: regPassword,
      });

      setActionSuccess('Account created successfully.');
      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 600);
    } catch (err) {
      console.error('Registration error:', err);
      setGeneralError(
        err.message || 'Unable to complete registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);

    const emailTrimmed = forgotEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      await authService.forgotPassword(emailTrimmed);
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(
        err.message || 'Unable to submit request. Please try again later.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-[85vh] bg-white sm:bg-[#FDFBF7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center"
    >
      {/* Centered Sign In Card Container */}
      <div className="w-full max-w-md mx-auto">
        
        {/* Simple Brand Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex flex-col items-center group focus:outline-none mb-3"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.14em] uppercase font-semibold text-[#241A12] group-hover:text-[#D4AF37] transition-colors">
              Natyam Gold
            </span>
            <span className="text-[10.5px] tracking-[0.2em] uppercase text-[#76695C] mt-0.5">
              Traditional Temple Jewellery
            </span>
          </Link>

          <h1 className="font-serif text-2xl font-semibold text-[#241A12] mt-3">
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-xs text-[#76695C] mt-1">
            {activeTab === 'signin'
              ? 'Enter your email or mobile number to continue'
              : 'Fill in your details to create an account'}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-[#E9DFCE] rounded-2xl p-6 sm:p-8 shadow-xs">
          
          {/* USER ALREADY AUTHENTICATED */}
          {isAuthenticated && user && !actionSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-[#F8F4EB] border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-serif text-xl font-bold mx-auto">
                {user.first_name ? user.first_name[0] : (user.username ? user.username[0].toUpperCase() : 'N')}
              </div>
              <div>
                <h2 className="text-lg font-serif font-semibold text-[#241A12]">
                  Welcome, {user.first_name || user.full_name || user.username}
                </h2>
                <p className="text-xs text-[#76695C] mt-0.5">
                  Signed in as {user.email || user.username}
                </p>
              </div>

              <div className="pt-3 flex flex-col gap-2.5">
                <Link
                  to={redirectTarget}
                  className="w-full py-2.5 px-4 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors text-center shadow-2xs"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/orders"
                  className="w-full py-2.5 px-4 bg-white border border-[#E9DFCE] text-[#241A12] hover:bg-[#F8F4EB] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors text-center"
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setGeneralError('');
                    setActionSuccess('');
                  }}
                  className="text-xs text-[#76695C] hover:text-[#241A12] transition-colors py-1 mt-1"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SUCCESS ALERT */}
              {actionSuccess && (
                <div
                  role="status"
                  className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2.5 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess} Redirecting...</span>
                </div>
              )}

              {/* ERROR ALERT */}
              {generalError && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2.5 text-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block">Sign In Failed</span>
                    <span className="mt-0.5 block">{generalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralError('')}
                    className="text-rose-400 hover:text-rose-700 p-0.5"
                    aria-label="Dismiss error"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ======================================================== */}
              {/* CLEAN SIGN IN FORM */}
              {/* ======================================================== */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignInSubmit} noValidate className="space-y-4">
                  
                  {/* Field: Email / Mobile Number */}
                  <div>
                    <label
                      htmlFor="signin-identifier"
                      className="block text-xs font-semibold text-[#241A12] mb-1.5"
                    >
                      Email / Mobile Number
                    </label>
                    <input
                      id="signin-identifier"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={signInIdentifier}
                      onChange={(e) => {
                        setSignInIdentifier(e.target.value);
                        if (fieldErrors.identifier) {
                          setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                        }
                      }}
                      placeholder="e.g. name@example.com or 9994887758"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                        fieldErrors.identifier
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-[#E9DFCE] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
                      }`}
                    />
                    {fieldErrors.identifier && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.identifier}</span>
                      </p>
                    )}
                  </div>

                  {/* Field: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="signin-password"
                        className="block text-xs font-semibold text-[#241A12]"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotError('');
                          setForgotSuccess(false);
                          if (signInIdentifier.includes('@')) {
                            setForgotEmail(signInIdentifier.trim());
                          }
                        }}
                        className="text-xs text-[#76695C] hover:text-[#241A12] transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="signin-password"
                        name="password"
                        type={showSignInPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={signInPassword}
                        onChange={(e) => {
                          setSignInPassword(e.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => ({ ...prev, password: '' }));
                          }
                        }}
                        placeholder="Enter your password"
                        className={`w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                          fieldErrors.password
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-[#E9DFCE] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#76695C] hover:text-[#241A12] focus:outline-none transition-colors"
                      >
                        {showSignInPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {fieldErrors.password && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me Option */}
                  <div className="flex items-center pt-0.5">
                    <label className="inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#D4AF37] border-[#E9DFCE] focus:ring-[#D4AF37] accent-[#D4AF37] cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-[#76695C]">
                        Remember me on this device
                      </span>
                    </label>
                  </div>

                  {/* Sign In Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || Boolean(actionSuccess)}
                      className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#C49A24] active:bg-[#B58C1F] text-[#241A12] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                    >
                      {loading || Boolean(actionSuccess) ? 'Signing In...' : 'Sign In'}
                    </button>
                  </div>

                  {/* Create Account Link */}
                  <div className="text-center pt-4 border-t border-[#E9DFCE]/80 mt-5">
                    <p className="text-xs text-[#76695C]">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('register')}
                        className="font-semibold text-[#241A12] hover:text-[#D4AF37] underline underline-offset-4 ml-1 transition-colors cursor-pointer"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>

                </form>
              )}

              {/* ======================================================== */}
              {/* REGISTER (CREATE ACCOUNT) FORM - PRESERVED & CLEAN */}
              {/* ======================================================== */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="reg-name"
                      className="block text-xs font-semibold text-[#241A12] mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: '' }));
                      }}
                      placeholder="e.g. Priya Sundaram"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-xs font-semibold text-[#241A12] mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                      }}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="reg-phone"
                      className="block text-xs font-semibold text-[#241A12] mb-1"
                    >
                      Phone Number (Optional)
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="reg-password"
                        className="block text-xs font-semibold text-[#241A12] mb-1"
                      >
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                          }}
                          placeholder="Min 6 chars"
                          className="w-full px-3 py-2 pr-8 text-xs bg-white border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#76695C]"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="reg-confirm"
                        className="block text-xs font-semibold text-[#241A12] mb-1"
                      >
                        Confirm *
                      </label>
                      <div className="relative">
                        <input
                          id="reg-confirm"
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => {
                            setRegConfirmPassword(e.target.value);
                            if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                          }}
                          placeholder="Repeat password"
                          className="w-full px-3 py-2 pr-8 text-xs bg-white border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#76695C]"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-600">{fieldErrors.password}</p>
                  )}
                  {fieldErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-600">{fieldErrors.confirmPassword}</p>
                  )}

                  {/* Terms */}
                  <label className="flex items-start cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#D4AF37] border-[#E9DFCE] focus:ring-[#D4AF37] accent-[#D4AF37]"
                    />
                    <span className="ml-2 text-xs text-[#76695C] leading-snug">
                      I agree to the Terms of Service and Privacy Policy. *
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p className="text-[11px] text-rose-600">{fieldErrors.terms}</p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || Boolean(actionSuccess)}
                      className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#C49A24] active:bg-[#B58C1F] text-[#241A12] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {loading || Boolean(actionSuccess) ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>

                  {/* Switch back to sign in */}
                  <div className="text-center pt-4 border-t border-[#E9DFCE]/80 mt-5">
                    <p className="text-xs text-[#76695C]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('signin')}
                        className="font-semibold text-[#241A12] hover:text-[#D4AF37] underline underline-offset-4 ml-1 transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </>
          )}

        </div>

        {/* Back Link to Boutique */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs text-[#76695C] hover:text-[#241A12] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Store</span>
          </Link>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E9DFCE] rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1 text-[#76695C] hover:text-[#241A12] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <h2 className="font-serif text-xl font-semibold text-[#241A12]">
                Reset Password
              </h2>
              <p className="text-xs text-[#76695C] mt-1 leading-relaxed">
                Enter your registered email address to receive password reset instructions.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    If an account exists for <strong>{forgotEmail}</strong>, password reset instructions have been sent.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-xs font-semibold rounded-lg uppercase tracking-wider"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                {forgotError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="forgot-email-input"
                    className="block text-xs font-semibold text-[#241A12] mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 border border-[#E9DFCE] text-[#76695C] hover:bg-[#F8F4EB] text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-xs font-semibold rounded-lg uppercase tracking-wider disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default SignInPage;
