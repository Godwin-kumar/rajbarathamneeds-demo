import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Printer,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { checkoutService } from '../../services/checkoutService';
import { siteConfig } from '../../config/siteConfig';

/**
 * Luxury Order Summary & Confirmation Page
 * Displays confirmed order details, delivery address, itemized invoice, and tracking timeline.
 */
export const OrderSummaryPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setError('No order reference provided.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await checkoutService.getOrderSummary(orderNumber);
        if (res.data?.order) {
          setOrder(res.data.order);
        } else {
          setError(res.error || `Order "${orderNumber}" could not be retrieved.`);
        }
      } catch (err) {
        console.error('Failed to fetch order summary:', err);
        setError('Unable to load order summary. Please check your order reference number.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handleCopyOrderNumber = () => {
    if (!order?.order_number) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppContact = () => {
    if (!order) return;
    const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '9199948 87758';
    const cleanNumber = waNumber.replace(/[^0-9]/g, '');
    const msg = `Hello ${siteConfig?.brand?.name || 'RAJ BARATHAM NEEDS'},\nI am inquiring about my Order: ${order.order_number}.\nStatus: ${order.status_display || order.status}\nCustomer: ${order.customer_name} (${order.customer_phone})\nTotal: ₹${Number(order.total_amount).toLocaleString('en-IN')}.\nKindly provide delivery updates. Thank you!`;
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Status step calculation
  const getStatusStep = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') return 4;
    if (s === 'SHIPPED') return 3;
    if (s === 'PROCESSING') return 2;
    return 1; // PENDING or CONFIRMED
  };

  const currentStep = getStatusStep(order?.status);

  if (loading) {
    return (
      <main className="min-h-screen bg-luxury-ivory-light/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 border-3 border-luxury-gold border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="font-serif text-xl text-luxury-text-primary tracking-wide">
            Retrieving Order Details
          </h2>
          <p className="text-xs uppercase tracking-widest text-luxury-text-secondary mt-2">
            Connecting to Maison Concierge Database...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-luxury-ivory-light/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-luxury-white border border-luxury-border p-8 sm:p-12 text-center shadow-subtle">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl text-luxury-text-primary tracking-wide mb-2">
            Order Not Located
          </h1>
          <p className="text-sm text-luxury-text-secondary mb-6 leading-relaxed">
            {error || 'We could not find the specified order record in our archive.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-6 py-3 bg-luxury-text-primary text-luxury-white text-xs uppercase tracking-widest font-semibold hover:bg-luxury-gold transition-colors"
            >
              View Order History
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 border border-luxury-border text-luxury-text-primary text-xs uppercase tracking-widest font-semibold hover:bg-luxury-ivory transition-colors"
            >
              Return to Boutique
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFBF8] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb - Hidden in print */}
        <nav aria-label="Breadcrumb" className="print:hidden">
          <ol className="flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-text-secondary">
            <li>
              <Link to="/" className="hover:text-luxury-gold transition-colors">
                Boutique
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link to="/orders" className="hover:text-luxury-gold transition-colors">
                Orders
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-luxury-text-primary font-medium">
              #{order.order_number}
            </li>
          </ol>
        </nav>

        {/* CONFIRMATION HERO BANNER */}
        <div className="bg-luxury-white border border-luxury-border shadow-subtle p-6 sm:p-10 text-center relative overflow-hidden print:border-none print:shadow-none print:p-0">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4 animate-scale-in">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 bg-luxury-ivory border border-luxury-border text-[11px] uppercase tracking-widest font-medium text-luxury-gold mb-3">
            Order Confirmed & Received
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text-primary tracking-wide">
            Thank You, {order.customer_name}!
          </h1>
          <p className="mt-2 text-sm text-luxury-text-secondary max-w-lg mx-auto">
            Your order has been officially registered with our master artisans. We are preparing your heritage jewellery with exquisite care.
          </p>

          {/* Order reference badge */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-luxury-ivory-light/80 border border-luxury-border px-5 py-3">
            <span className="text-xs uppercase tracking-widest text-luxury-text-secondary">
              Order Reference:
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-luxury-text-primary">
              #{order.order_number}
            </span>
            <button
              onClick={handleCopyOrderNumber}
              className="inline-flex items-center space-x-1 text-xs text-luxury-gold hover:text-luxury-text-primary transition-colors print:hidden"
              title="Copy Order ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Actions Bar - Hidden in print */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-luxury-white border border-luxury-border text-xs uppercase tracking-widest font-medium text-luxury-text-primary hover:bg-luxury-ivory transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Print Tax Invoice</span>
            </button>

            <button
              onClick={handleWhatsAppContact}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-widest font-semibold transition-colors shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Concierge WhatsApp</span>
            </button>

            <Link
              to="/orders"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-luxury-text-primary hover:bg-luxury-gold text-white text-xs uppercase tracking-widest font-medium transition-colors shadow-2xs"
            >
              <Package className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </Link>
          </div>
        </div>

        {/* STATUS TIMELINE TRACKER - Hidden in print */}
        <div className="bg-luxury-white border border-luxury-border p-6 sm:p-8 shadow-subtle print:hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-luxury-border">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-luxury-gold" />
              <h2 className="font-serif text-lg text-luxury-text-primary tracking-wide">
                Order Fulfillment Progress
              </h2>
            </div>
            <span className="text-xs uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 font-semibold">
              {order.status_display || order.status}
            </span>
          </div>

          {/* 4-Step Progress Line */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                  currentStep >= 1
                    ? 'bg-luxury-gold text-luxury-white ring-4 ring-luxury-gold/20'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                <Check className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-text-primary">
                Order Placed
              </span>
              <span className="text-[11px] text-luxury-text-secondary mt-0.5">
                {formatDate(order.created_at)}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                  currentStep >= 2
                    ? 'bg-luxury-gold text-luxury-white ring-4 ring-luxury-gold/20'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-text-primary">
                Crafting & QC
              </span>
              <span className="text-[11px] text-luxury-text-secondary mt-0.5">
                Artisanal Check
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                  currentStep >= 3
                    ? 'bg-luxury-gold text-luxury-white ring-4 ring-luxury-gold/20'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {currentStep > 3 ? <Check className="w-5 h-5" /> : '3'}
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-text-primary">
                Dispatched
              </span>
              <span className="text-[11px] text-luxury-text-secondary mt-0.5">
                Insured Courier
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                  currentStep >= 4
                    ? 'bg-emerald-600 text-luxury-white ring-4 ring-emerald-600/20'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {currentStep >= 4 ? <Check className="w-5 h-5" /> : '4'}
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-text-primary">
                Delivered
              </span>
              <span className="text-[11px] text-luxury-text-secondary mt-0.5">
                To Your Doorstep
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-luxury-border/60 flex items-center justify-between text-xs text-luxury-text-secondary">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-luxury-gold" />
              <span>
                Estimated Delivery: <strong>3–5 Business Days</strong> across India
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Transit Insurance Included</span>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: ITEM LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-luxury-white border border-luxury-border p-6 sm:p-8 shadow-subtle">
              <div className="flex items-center justify-between pb-4 border-b border-luxury-border mb-6">
                <h2 className="font-serif text-lg text-luxury-text-primary tracking-wide">
                  Order Items ({order.items_count || order.items?.length || 1})
                </h2>
                <span className="text-xs uppercase tracking-widest text-luxury-text-secondary">
                  Heritage Collection
                </span>
              </div>

              {/* Items Table / List */}
              <div className="divide-y divide-luxury-border/60">
                {(order.items || []).map((item, idx) => (
                  <div key={item.id || idx} className="py-4 first:pt-0 last:pb-0 flex items-center space-x-4">
                    <img
                      src={item.image || '/images/products/temple_jewellery.jpg'}
                      alt={item.product_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/products/temple_jewellery.jpg';
                      }}
                      className="w-18 h-18 sm:w-20 sm:h-20 object-cover border border-luxury-border flex-shrink-0 bg-luxury-ivory"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base text-luxury-text-primary font-medium truncate">
                        {item.product_name}
                      </h3>
                      {item.product_sku && (
                        <p className="text-[11px] uppercase tracking-wider text-luxury-text-secondary mt-0.5">
                          SKU / Spec: {item.product_sku}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-luxury-text-secondary">
                        <span>Qty: <strong>{item.quantity}</strong></span>
                        <span>•</span>
                        <span>Unit: {formatINR(item.unit_price)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-base font-semibold text-luxury-text-primary">
                        {formatINR(item.total_price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DELIVERY ADDRESS & CUSTOMER DETAILS */}
            <div className="bg-luxury-white border border-luxury-border p-6 sm:p-8 shadow-subtle">
              <div className="flex items-center space-x-2 pb-4 border-b border-luxury-border mb-4">
                <MapPin className="w-4 h-4 text-luxury-gold" />
                <h2 className="font-serif text-lg text-luxury-text-primary tracking-wide">
                  Delivery Destination
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="uppercase tracking-widest text-luxury-text-secondary font-medium block mb-1">
                    Recipient Information
                  </span>
                  <p className="font-semibold text-luxury-text-primary text-sm">
                    {order.customer_name}
                  </p>
                  <div className="flex items-center space-x-1.5 text-luxury-text-secondary mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 {order.customer_phone}</span>
                  </div>
                  {order.customer_email && (
                    <div className="flex items-center space-x-1.5 text-luxury-text-secondary mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{order.customer_email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="uppercase tracking-widest text-luxury-text-secondary font-medium block mb-1">
                    Shipping Address
                  </span>
                  <p className="text-luxury-text-primary font-medium leading-relaxed">
                    {order.shipping_address}
                  </p>
                  <p className="text-luxury-text-secondary mt-0.5">
                    {order.shipping_city}, {order.shipping_state} — <strong>{order.shipping_pincode}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRICE BREAKDOWN & PAYMENT */}
          <div className="space-y-6">
            <div className="bg-luxury-white border border-luxury-border p-6 sm:p-8 shadow-subtle">
              <h2 className="font-serif text-lg text-luxury-text-primary tracking-wide pb-4 border-b border-luxury-border mb-4">
                Payment Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-luxury-text-secondary">
                  <span>Subtotal (List Price)</span>
                  <span className="font-medium text-luxury-text-primary">
                    {formatINR(order.subtotal || order.total_amount)}
                  </span>
                </div>

                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Artisanal Privilege Savings</span>
                    <span className="font-medium">
                      -{formatINR(order.discount_amount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-luxury-text-secondary">
                  <span>Insured Express Shipping</span>
                  <span className="font-semibold uppercase tracking-wider text-emerald-700">
                    FREE
                  </span>
                </div>

                <div className="pt-4 border-t border-luxury-border flex justify-between items-baseline">
                  <div>
                    <span className="font-serif text-base text-luxury-text-primary font-semibold block">
                      Total Amount
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-luxury-text-secondary">
                      (Inclusive of all Taxes & GST)
                    </span>
                  </div>
                  <span className="font-serif text-2xl font-bold text-luxury-text-primary">
                    {formatINR(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mt-6 pt-5 border-t border-luxury-border/60 bg-luxury-ivory-light/60 p-4 border border-luxury-border">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-luxury-text-secondary uppercase tracking-widest">
                    Payment Method
                  </span>
                  <span className="font-semibold text-luxury-text-primary uppercase tracking-wider">
                    {order.payment_method || 'ONLINE'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-luxury-text-secondary uppercase tracking-widest">
                    Payment Status
                  </span>
                  <span className="inline-flex items-center text-emerald-700 font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {order.payment_status || 'PAID'}
                  </span>
                </div>
              </div>
            </div>

            {/* Authenticity & Guarantee Note */}
            <div className="bg-luxury-ivory border border-luxury-border p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-luxury-white border border-luxury-border flex items-center justify-center mx-auto text-luxury-gold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base text-luxury-text-primary font-medium">
                Maison Guarantee of Purity
              </h3>
              <p className="text-xs text-luxury-text-secondary leading-relaxed">
                Every piece is authenticated by master jewellers and comes with a 100% Quality Assurance Certificate.
              </p>
              <Link
                to="/"
                className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-luxury-gold hover:text-luxury-text-primary font-semibold transition-colors pt-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderSummaryPage;
