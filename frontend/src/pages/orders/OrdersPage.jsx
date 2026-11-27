import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShoppingBag,
  Search,
  Phone,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { checkoutService } from '../../services/checkoutService';
import { useAuth } from '../../context/AuthContext';
import { siteConfig } from '../../config/siteConfig';

/**
 * Customer Order History & Tracking Hub
 * Shows all orders for authenticated user or allows phone lookup for guest orders.
 */
export const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guest lookup state
  const [searchPhone, setSearchPhone] = useState(() => {
    return localStorage.getItem('rbn_last_phone') || '';
  });
  const [searchingGuest, setSearchingGuest] = useState(false);

  const fetchOrders = useCallback(async (phoneQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (phoneQuery) {
        params.phone = phoneQuery;
      } else if (!isAuthenticated) {
        const lastPhone = localStorage.getItem('rbn_last_phone') || '';
        if (lastPhone) {
          params.phone = lastPhone;
        }
      }

      const res = await checkoutService.getMyOrders(params);
      if (res.data?.orders) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Could not fetch orders at this time. Please try again.');
    } finally {
      setLoading(false);
      setSearchingGuest(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleGuestSearch = (e) => {
    e.preventDefault();
    const clean = searchPhone.trim().replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    localStorage.setItem('rbn_last_phone', clean);
    setSearchingGuest(true);
    fetchOrders(clean);
  };

  const formatINR = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Delivered
        </span>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5 mr-1" />
          Shipped & In Transit
        </span>
      );
    }
    if (s === 'PROCESSING') {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 mr-1" />
          Crafting & QC
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 bg-luxury-ivory border border-luxury-border text-luxury-gold text-[11px] font-semibold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 mr-1" />
        Order Confirmed
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#FCFBF8] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-text-secondary">
            <li>
              <Link to="/" className="hover:text-luxury-gold transition-colors">
                Boutique
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-luxury-text-primary font-medium">
              Order History & Tracking
            </li>
          </ol>
        </nav>

        {/* Page Title & Overview */}
        <div className="bg-luxury-white border border-luxury-border p-6 sm:p-10 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-luxury-ivory border border-luxury-border text-[11px] uppercase tracking-widest font-medium text-luxury-gold mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>Client Concierge Archive</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text-primary tracking-wide">
              {isAuthenticated ? `Orders for ${user?.first_name || user?.full_name || 'Client'}` : 'Your Orders & Tracking'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-luxury-text-secondary max-w-xl">
              Track the progress of your handcrafted Bharatanatyam and temple jewellery commissions in real time.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="flex-shrink-0">
              <Link
                to="/signin?redirect=/orders"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-luxury-text-primary hover:bg-luxury-gold text-luxury-white text-xs uppercase tracking-widest font-semibold transition-colors"
              >
                <span>Sign In to Sync</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* GUEST LOOKUP CARD (Only if not authenticated or wanting to query by phone) */}
        {!isAuthenticated && (
          <div className="bg-luxury-ivory-light/60 border border-luxury-border p-6 shadow-2xs">
            <h2 className="font-serif text-base text-luxury-text-primary mb-1">
              Guest Order Lookup
            </h2>
            <p className="text-xs text-luxury-text-secondary mb-4">
              Placed an order without an account? Enter your 10-digit mobile number to view your order history.
            </p>
            <form onSubmit={handleGuestSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-text-secondary" />
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number (e.g. 99948 87758)"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-2.5 bg-luxury-white border border-luxury-border text-xs text-luxury-text-primary focus:outline-none focus:border-luxury-gold"
                />
              </div>
              <button
                type="submit"
                disabled={searchingGuest}
                className="px-6 py-2.5 bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-white text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {searchingGuest ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Orders</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 text-center bg-luxury-white border border-luxury-border">
            <div className="w-10 h-10 border-3 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest text-luxury-text-secondary">
              Retrieving Order Archive...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 p-6 text-center text-rose-700 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-600" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="mt-3 px-4 py-1.5 bg-rose-600 text-white uppercase tracking-wider text-[11px] font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-luxury-white border border-luxury-border p-12 text-center shadow-subtle">
            <div className="w-16 h-16 rounded-full bg-luxury-ivory border border-luxury-border flex items-center justify-center mx-auto mb-4 text-luxury-gold">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl text-luxury-text-primary tracking-wide mb-2">
              No Orders Found
            </h2>
            <p className="text-xs text-luxury-text-secondary max-w-md mx-auto mb-6">
              You haven't placed any orders yet. Discover our latest heritage temple jewellery and Bharatanatyam adornments.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-white text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ORDERS LIST */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-luxury-text-secondary pb-2 border-b border-luxury-border">
              <span>Showing {orders.length} order{orders.length === 1 ? '' : 's'}</span>
              <span>Sorted by recent orders</span>
            </div>

            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-luxury-white border border-luxury-border shadow-subtle hover:shadow-luxury-hover transition-all duration-200 overflow-hidden"
              >
                {/* Order Card Header */}
                <div className="p-5 sm:p-6 bg-luxury-ivory-light/40 border-b border-luxury-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-luxury-text-secondary block">
                        Order Placed
                      </span>
                      <span className="font-semibold text-luxury-text-primary">
                        {formatDate(ord.created_at)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-luxury-text-secondary block">
                        Total Amount
                      </span>
                      <span className="font-serif text-sm font-bold text-luxury-text-primary">
                        {formatINR(ord.total_amount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-luxury-text-secondary block">
                        Order Reference
                      </span>
                      <span className="font-mono font-medium text-luxury-text-primary">
                        #{ord.order_number}
                      </span>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(ord.status)}
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="p-5 sm:p-6 divide-y divide-luxury-border/60">
                  {(ord.items || []).map((itm, i) => (
                    <div key={itm.id || i} className="py-3 first:pt-0 last:pb-0 flex items-center space-x-4">
                      <img
                        src={itm.image || '/images/products/temple_jewellery.jpg'}
                        alt={itm.product_name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/temple_jewellery.jpg';
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-luxury-border flex-shrink-0 bg-luxury-ivory"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-sm sm:text-base text-luxury-text-primary font-medium truncate">
                          {itm.product_name}
                        </h3>
                        {itm.product_sku && (
                          <p className="text-[11px] uppercase tracking-wider text-luxury-text-secondary mt-0.5">
                            SKU: {itm.product_sku}
                          </p>
                        )}
                        <p className="text-xs text-luxury-text-secondary mt-1">
                          Qty: <strong>{itm.quantity}</strong> × {formatINR(itm.unit_price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-sm sm:text-base font-semibold text-luxury-text-primary">
                          {formatINR(itm.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 sm:px-6 py-4 bg-luxury-ivory-light/30 border-t border-luxury-border flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-luxury-text-secondary">
                    Recipient: <strong>{ord.customer_name}</strong> • Delivery: <strong>{ord.shipping_city}, {ord.shipping_state}</strong>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/order-summary/${ord.order_number}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-luxury-text-primary hover:bg-luxury-gold text-luxury-white text-xs uppercase tracking-widest font-semibold transition-colors"
                    >
                      <span>View Order Summary</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
