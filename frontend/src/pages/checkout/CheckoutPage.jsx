import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Minus,
  MessageCircle,
  ArrowLeft,
  Tag,
  ShoppingBag,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { checkoutService } from '../../services/checkoutService';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Assam',
  'Goa',
  'Other',
];

/**
 * Robust image resolver that inspects all backend and frontend image attributes,
 * category heuristics, and uses standard fallback.
 */
const resolveItemImage = (item) => {
  if (!item) return '/images/products/temple_jewellery.jpg';
  const prod = item.product || item;

  if (typeof prod.main_image === 'string' && prod.main_image.trim()) {
    return prod.main_image;
  }
  if (typeof prod.image === 'string' && prod.image.trim()) {
    return prod.image;
  }
  if (typeof prod.image_url === 'string' && prod.image_url.trim()) {
    return prod.image_url;
  }
  if (Array.isArray(prod.side_images) && prod.side_images.length > 0 && prod.side_images[0]?.image_url) {
    return prod.side_images[0].image_url;
  }
  if (prod.primary_image?.image_url) return prod.primary_image.image_url;
  if (prod.primary_image?.card_url) return prod.primary_image.card_url;
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    return prod.images[0]?.image_url || prod.images[0]?.card_url;
  }

  // Category fallback
  const cat = (typeof prod.category === 'object' ? prod.category?.name || prod.category?.slug : prod.category) || '';
  const catLower = String(cat).toLowerCase();
  if (catLower.includes('necklace') || catLower.includes('haram') || catLower.includes('choker')) {
    return '/images/categories/necklaces.jpg';
  }
  if (catLower.includes('earring') || catLower.includes('jhumka')) {
    return '/images/categories/earrings.jpg';
  }
  if (catLower.includes('bangle') || catLower.includes('valayal') || catLower.includes('bracelet')) {
    return '/images/categories/bangles.jpg';
  }
  if (catLower.includes('pendant')) {
    return '/images/categories/pendants.jpg';
  }
  if (catLower.includes('salangai') || catLower.includes('dance')) {
    return '/images/products/salangai.jpg';
  }

  return '/images/products/temple_jewellery.jpg';
};

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, clearCart, updateQuantity: updateCartQuantity, removeFromCart } = useCart();

  // 1. Resolve product ID & initial quantity from router state or query parameters
  const queryParams = new URLSearchParams(location.search);
  const targetProductId = location.state?.productId || queryParams.get('productId');
  const initialQuantity = parseInt(location.state?.quantity || queryParams.get('quantity') || '1', 10);

  const isCartMode = !targetProductId && Array.isArray(cartItems) && cartItems.length > 0;

  const [quantity, setQuantity] = useState(Math.max(1, initialQuantity));
  const [directProduct, setDirectProduct] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [loadingCalc, setLoadingCalc] = useState(true);
  const [errorCalc, setErrorCalc] = useState(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // 2. Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address form fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    houseBuilding: '',
    streetArea: '',
    landmark: '',
    city: '',
    state: 'Tamil Nadu',
    addressType: 'Home',
    isDefault: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [savingAddress, setSavingAddress] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // WhatsApp Configuration (Central setting with fallback)
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919994887758';

  // --------------------------------------------------------------------------
  // Recalculate verified pricing from Django backend
  // --------------------------------------------------------------------------
  const fetchSingleCalculation = useCallback(async (prodId, qty, coupon = '') => {
    if (!prodId) return;
    setLoadingCalc(true);
    setErrorCalc(null);

    try {
      const res = await checkoutService.calculateCheckout(prodId, qty, coupon);
      if (res.data) {
        setCalculation(res.data);
        if (res.data.coupon_message) {
          if (res.data.coupon_valid) {
            setCouponSuccess(res.data.coupon_message);
            setCouponError('');
          } else if (coupon) {
            setCouponError(res.data.coupon_message);
            setCouponSuccess('');
          }
        }
      }
    } catch (err) {
      console.error('Failed to calculate checkout on backend:', err);
      const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to verify product pricing with server. Please try again.';
      setErrorCalc(serverMsg);
    } finally {
      setLoadingCalc(false);
    }
  }, []);

  const fetchCartCalculation = useCallback(async (items, coupon = '') => {
    if (!items || items.length === 0) {
      setCalculation(null);
      setLoadingCalc(false);
      return;
    }
    setLoadingCalc(true);
    setErrorCalc(null);

    const payloadItems = items.map((itm) => ({
      product_id: itm.product?.id || itm.id,
      quantity: itm.quantity || 1,
      variant: itm.variant || itm.selectedVariant || null,
    }));

    try {
      const res = await checkoutService.calculateCartCheckout(payloadItems, coupon);
      if (res.data) {
        setCalculation(res.data);
        if (res.data.coupon_message) {
          if (res.data.coupon_valid) {
            setCouponSuccess(res.data.coupon_message);
            setCouponError('');
          } else if (coupon) {
            setCouponError(res.data.coupon_message);
            setCouponSuccess('');
          }
        }
      }
    } catch (err) {
      console.error('Failed to verify cart pricing on backend:', err);
      // Fallback gracefully so cart is not completely blocked
      setErrorCalc('Using cached cart pricing. Totals will be verified on checkout.');
    } finally {
      setLoadingCalc(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Load initial calculations and saved addresses
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    if (targetProductId) {
      productService
        .getProduct(targetProductId)
        .then((res) => {
          if (isMounted && res?.data) {
            setDirectProduct(res.data);
          }
        })
        .catch((err) => {
          console.warn('Could not load direct product details:', err);
        });
      fetchSingleCalculation(targetProductId, quantity, appliedCoupon);
    } else if (isCartMode) {
      fetchCartCalculation(cartItems, appliedCoupon);
    } else {
      setLoadingCalc(false);
    }
    return () => {
      isMounted = false;
    };
  }, [targetProductId, isCartMode, cartItems, quantity, appliedCoupon, fetchSingleCalculation, fetchCartCalculation]);

  useEffect(() => {
    // Load saved delivery addresses
    const loadAddresses = async () => {
      try {
        const lastPhone = localStorage.getItem('rbn_last_phone') || '';
        const res = await checkoutService.getSavedAddresses(lastPhone);
        const addrs = res.data?.addresses || [];
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          setShowAddressForm(false);
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        console.warn('Could not fetch saved addresses:', err);
        setShowAddressForm(true);
      }
    };

    loadAddresses();
  }, []);

  // Handle single product quantity changes
  const handleSingleQuantityChange = (newQty) => {
    if (newQty < 1 || newQty > 99) return;
    setQuantity(newQty);
  };

  // Handle cart item quantity change
  const handleCartItemQuantityChange = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartQuantity(itemId, newQty);
    }
  };

  // Handle coupon apply
  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;
    setAppliedCoupon(clean);
  };

  // Handle coupon remove
  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  // --------------------------------------------------------------------------
  // Address Form Validation & Submission
  // --------------------------------------------------------------------------
  const validateAddressForm = () => {
    const errs = {};
    const cleanPhone = (formData.phone || '').replace(/[^0-9]/g, '');
    const cleanPin = (formData.pincode || '').replace(/[^0-9]/g, '');

    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!cleanPhone || cleanPhone.length !== 10) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!cleanPin || cleanPin.length !== 6) errs.pincode = 'Enter a valid 6-digit PIN code';
    if (!formData.houseBuilding.trim()) errs.houseBuilding = 'Flat / House No. / Building is required';
    if (!formData.streetArea.trim()) errs.streetArea = 'Street / Area is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    setSavingAddress(true);
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');

    const payload = {
      id: editingAddressId || undefined,
      full_name: formData.fullName.trim(),
      phone: cleanPhone,
      pincode: formData.pincode.trim(),
      house_building: formData.houseBuilding.trim(),
      street_area: formData.streetArea.trim(),
      landmark: formData.landmark.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      address_type: formData.addressType || 'Home',
      is_default: formData.isDefault,
    };

    try {
      const res = await checkoutService.saveAddress(payload);
      const updatedList = res.data?.addresses || [];
      setSavedAddresses(updatedList);

      const active = editingAddressId
        ? updatedList.find((a) => a.id === editingAddressId)
        : updatedList[updatedList.length - 1];

      if (active) {
        setSelectedAddressId(active.id);
      }

      localStorage.setItem('rbn_last_phone', cleanPhone);

      setShowAddressForm(false);
      setEditingAddressId(null);
      resetForm();
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Could not save address. Please check your connection.');
    } finally {
      setSavingAddress(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      pincode: '',
      houseBuilding: '',
      streetArea: '',
      landmark: '',
      city: '',
      state: 'Tamil Nadu',
      addressType: 'Home',
      isDefault: false,
    });
    setFormErrors({});
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setFormData({
      fullName: addr.full_name,
      phone: addr.phone,
      pincode: addr.pincode,
      houseBuilding: addr.house_building,
      streetArea: addr.street_area,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      addressType: addr.address_type || 'Home',
      isDefault: addr.is_default || false,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    const phone = localStorage.getItem('rbn_last_phone') || '';
    try {
      const res = await checkoutService.deleteAddress(addrId, phone);
      const remaining = res.data?.addresses || [];
      setSavedAddresses(remaining);

      if (selectedAddressId === addrId) {
        if (remaining.length > 0) {
          setSelectedAddressId(remaining[0].id);
        } else {
          setSelectedAddressId(null);
          setShowAddressForm(true);
        }
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  // --------------------------------------------------------------------------
  // Resolved Display Items & Financial Calculations
  // --------------------------------------------------------------------------
  const displayItems = useMemo(() => {
    if (isCartMode) {
      if (calculation?.items && calculation.items.length > 0) {
        return calculation.items.map((srvItem) => {
          // Cross-reference with local cart item for variant or image fallback
          const localItem = cartItems.find(
            (c) => String(c.product?.id || c.id) === String(srvItem.product_id || srvItem.id)
          );
          return {
            id: srvItem.product_id || srvItem.id,
            product_id: srvItem.product_id || srvItem.id,
            name: srvItem.product_name || srvItem.name || localItem?.product?.name || 'Traditional Jewellery Piece',
            sku: srvItem.sku || srvItem.product_code || localItem?.product?.sku || `NG-${srvItem.product_id || srvItem.id}`,
            category: srvItem.category || srvItem.category_name || (typeof localItem?.product?.category === 'object' ? localItem.product.category?.name : localItem?.product?.category) || 'Temple Jewellery',
            weight: srvItem.weight || localItem?.product?.weight || null,
            variant: srvItem.variant || localItem?.variant || localItem?.selectedVariant || null,
            image: srvItem.image || srvItem.main_image || resolveItemImage(localItem || srvItem),
            quantity: srvItem.quantity,
            unit_price: Number(srvItem.unit_price || srvItem.price || 0),
            discounted_unit_price: Number(srvItem.discounted_unit_price || srvItem.unit_price || srvItem.price || 0),
            total_price: Number(srvItem.total_price || (srvItem.discounted_unit_price || srvItem.unit_price) * srvItem.quantity),
          };
        });
      }

      // If calculation is loading or not yet available, render from local cartItems
      return cartItems.map((itm) => {
        const p = itm.product || {};
        const unitPrice = Number(p.sale_price || p.price || 0);
        return {
          id: p.id || itm.id,
          product_id: p.id || itm.id,
          name: p.name || 'Handcrafted Traditional Jewellery',
          sku: p.sku || p.dimensions || `NG-${p.id || itm.id}`,
          category: (typeof p.category === 'object' ? p.category?.name : p.category) || 'Temple Jewellery',
          weight: p.weight || (p.dimensions && !p.dimensions.includes('-') ? p.dimensions : null),
          variant: itm.variant || itm.selectedVariant || null,
          image: resolveItemImage(itm),
          quantity: itm.quantity || 1,
          unit_price: unitPrice,
          discounted_unit_price: unitPrice,
          total_price: unitPrice * (itm.quantity || 1),
        };
      });
    }

    // Single product "Buy Now" flow
    if (calculation?.items && calculation.items.length > 0) {
      const srvItem = calculation.items[0];
      const p = srvItem.product || calculation.product || directProduct || srvItem;
      return [
        {
          id: p.id || srvItem.product_id || targetProductId,
          product_id: p.id || srvItem.product_id || targetProductId,
          name: p.name || srvItem.product_name || srvItem.name || directProduct?.name || 'Traditional Jewellery Piece',
          sku: srvItem.sku || srvItem.product_code || p.sku || `NG-${p.id || srvItem.product_id}`,
          category: srvItem.category || srvItem.category_name || p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || directProduct?.category_name || 'Traditional Jewellery',
          weight: srvItem.weight || p.weight || (p.dimensions && !p.dimensions.includes('-') ? p.dimensions : null),
          variant: calculation.variant || srvItem.variant || null,
          image: srvItem.image || srvItem.main_image || p.main_image || resolveItemImage(directProduct || p),
          quantity: calculation.total_quantity || srvItem.quantity || quantity,
          unit_price: Number(srvItem.unit_price || calculation.unit_price || p.price || directProduct?.price || 0),
          discounted_unit_price: Number(srvItem.discounted_unit_price || calculation.discounted_unit_price || srvItem.unit_price || 0),
          total_price: Number(srvItem.total_price || calculation.final_total || ((srvItem.discounted_unit_price || srvItem.unit_price) * (srvItem.quantity || quantity))),
        },
      ];
    }

    if (calculation?.product) {
      const p = calculation.product;
      return [
        {
          id: p.id || targetProductId,
          product_id: p.id || targetProductId,
          name: p.name || directProduct?.name || 'Traditional Jewellery Piece',
          sku: p.sku || `NG-${p.id}`,
          category: p.category || p.category_name || (typeof directProduct?.category === 'object' ? directProduct?.category?.name : directProduct?.category) || 'Traditional Jewellery',
          weight: p.weight || (p.dimensions && !p.dimensions.includes('-') ? p.dimensions : null),
          variant: calculation.variant || null,
          image: p.main_image || p.image || resolveItemImage(p),
          quantity: calculation.quantity || calculation.total_quantity || quantity,
          unit_price: Number(calculation.unit_price || p.price || directProduct?.price || 0),
          discounted_unit_price: Number(calculation.discounted_unit_price || calculation.unit_price || p.price || 0),
          total_price: Number(calculation.final_total || (calculation.unit_price * quantity)),
        },
      ];
    }

    if (directProduct) {
      const p = directProduct;
      const unitPrice = Number(p.price || p.sale_price || 0);
      return [
        {
          id: p.id || targetProductId,
          product_id: p.id || targetProductId,
          name: p.name || 'Traditional Jewellery Piece',
          sku: p.sku || (p.dimensions && p.dimensions.includes('-') ? p.dimensions : `NG-${p.id}`),
          category: (typeof p.category === 'object' ? p.category?.name : p.category) || 'Traditional Jewellery',
          weight: p.weight || (p.dimensions && !p.dimensions.includes('-') ? p.dimensions : null),
          variant: null,
          image: resolveItemImage(p),
          quantity: quantity,
          unit_price: unitPrice,
          discounted_unit_price: unitPrice,
          total_price: unitPrice * quantity,
        },
      ];
    }

    return [];
  }, [isCartMode, calculation, cartItems, directProduct, targetProductId, quantity]);

  // Accurate price calculations
  const subtotal = Number(
    calculation?.subtotal ??
    (isCartMode
      ? cartItems.reduce((acc, itm) => {
          const p = itm.product || {};
          return acc + Number(p.sale_price || p.price || 0) * (itm.quantity || 1);
        }, 0)
      : (directProduct?.price ? Number(directProduct.price) * quantity : (calculation?.original_total || 0)))
  );

  const totalQuantity = Number(
    calculation?.total_quantity ??
    (isCartMode
      ? cartItems.reduce((acc, itm) => acc + (itm.quantity || 1), 0)
      : quantity)
  );

  const otherDiscounts = Number(calculation?.other_discounts ?? calculation?.total_savings ?? 0);
  const couponDiscount = Number(calculation?.coupon_discount ?? 0);
  const deliveryCharge = 0; // Complimentary Insured Logistics
  const totalSavings = otherDiscounts + couponDiscount;
  const finalPayableTotal = Math.max(0, subtotal - totalSavings);

  // --------------------------------------------------------------------------
  // Proceed to Checkout & WhatsApp Dispatch
  // --------------------------------------------------------------------------
  const getSelectedAddress = () => {
    if (showAddressForm) {
      if (!validateAddressForm()) {
        return null;
      }
      return {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        pincode: formData.pincode.trim(),
        house_building: formData.houseBuilding.trim(),
        street_area: formData.streetArea.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        address_type: formData.addressType,
      };
    }

    return savedAddresses.find((a) => a.id === selectedAddressId) || null;
  };

  const handleProceedToCheckout = async () => {
    // Prevent duplicate checkout submissions while processing
    if (submittingOrder) return;

    const activeAddress = getSelectedAddress();
    if (!activeAddress) {
      alert('Please complete and select your delivery address to proceed.');
      return;
    }

    if (displayItems.length === 0) {
      alert('No products found for checkout. Please return to shopping.');
      return;
    }

    setSubmittingOrder(true);

    try {
      // 1. Prepare server payload
      let orderPayload;
      if (isCartMode) {
        orderPayload = {
          items: displayItems.map((item) => ({
            product_id: item.product_id || item.id,
            quantity: item.quantity,
            variant: item.variant || null,
          })),
          address: activeAddress,
          coupon_code: appliedCoupon || undefined,
        };
      } else {
        orderPayload = {
          product_id: targetProductId || displayItems[0].product_id,
          quantity,
          address: activeAddress,
          coupon_code: appliedCoupon || undefined,
        };
      }

      // 2. Call backend checkout API to verify products, save order, and trigger WhatsApp Cloud API
      const checkoutRes = await checkoutService.checkout(orderPayload);
      if (checkoutRes.error || !checkoutRes.data?.order_number) {
        alert(
          `Order Submission Failed: ${checkoutRes.error || 'Server error occurred. Please verify your address and try again.'}`
        );
        setSubmittingOrder(false);
        return;
      }

      const orderNumber = checkoutRes.data.order_number;
      const whatsappInfo = checkoutRes.data.whatsapp || {};

      // 3. Clear cart if cart checkout only after successful order placement
      if (isCartMode) {
        clearCart();
      }

      // 4. Open WhatsApp conversation with +91 9994887758 directly
      // IMPORTANT: Do NOT use navigator.share() or Windows Share dialog.
      const targetWaUrl =
        whatsappInfo.fallback_url ||
        `https://wa.me/919994887758?text=${encodeURIComponent(whatsappInfo.message_text || '')}`;

      try {
        window.open(targetWaUrl, '_blank', 'noopener,noreferrer');
      } catch (openErr) {
        console.warn('Could not open WhatsApp window automatically:', openErr);
      }

      // 5. Navigate immediately to official Order Summary Page using verified order ID
      navigate(`/order-summary/${orderNumber}`, { replace: true });
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred while creating your order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // --------------------------------------------------------------------------
  // Loading & Empty States
  // --------------------------------------------------------------------------
  if (loadingCalc && !calculation && displayItems.length === 0) {
    return (
      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-5 text-xs font-semibold text-[#241A12] uppercase tracking-widest">
            Verifying product pricing and order details...
          </p>
        </div>
      </main>
    );
  }

  if (!targetProductId && (!cartItems || cartItems.length === 0) && displayItems.length === 0) {
    return (
      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-[#F8F4EB]/70 border border-[#E9DFCE] p-10 rounded-2xl shadow-sm">
          <ShoppingBag className="w-14 h-14 text-[#D4AF37] mx-auto mb-4 stroke-[1.5]" />
          <h2 className="font-serif text-2xl text-[#241A12] font-semibold mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-[#76695C] mb-6 leading-relaxed">
            Explore our curated collections of classical Bharatanatyam adornments, temple jewellery, and heirloom pieces.
          </p>
          <Link
            to="/"
            className="inline-block px-7 py-3 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Explore Collections
          </Link>
        </div>
      </main>
    );
  }

  if (errorCalc && displayItems.length === 0) {
    return (
      <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center bg-[#F8F4EB]/70 border border-[#E9DFCE] p-10 rounded-2xl shadow-sm">
          <AlertCircle className="w-14 h-14 text-rose-600 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-[#241A12] font-semibold mb-2">Checkout Error</h2>
          <p className="text-xs text-[#76695C] mb-6 leading-relaxed">{errorCalc}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-7 py-3 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#76695C]">
            <li>
              <Link to="/" className="hover:text-[#D4AF37] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#E9DFCE]" />
            </li>
            <li>
              <Link to="/#shop-by-category" className="hover:text-[#D4AF37] transition-colors">
                Collections
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#E9DFCE]" />
            </li>
            <li className="font-semibold text-[#241A12]" aria-current="page">
              Express Checkout
            </li>
          </ol>
        </nav>

        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E9DFCE]">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#F8F4EB] border border-[#E9DFCE] text-[#241A12] flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#241A12] font-semibold tracking-tight">
                Express Checkout
              </h1>
              <p className="text-xs text-[#76695C] mt-0.5">
                Review your products, select delivery address and confirm order via WhatsApp concierge.
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Delivery Address & Order Review (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. DELIVERY ADDRESS SECTION */}
            <div className="bg-[#F8F4EB]/60 rounded-2xl border border-[#E9DFCE] p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#241A12] flex items-center justify-center font-bold text-xs shadow-2xs">
                    1
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#241A12]">
                    Delivery Address
                  </h2>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setEditingAddressId(null);
                      setShowAddressForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37] bg-white text-[#241A12] text-xs font-semibold hover:bg-[#D4AF37] transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Saved Address Cards */}
              {!showAddressForm && savedAddresses.length > 0 && (
                <div className="space-y-3.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-white border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]'
                            : 'bg-white/80 border-[#E9DFCE] hover:border-[#D4AF37]/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37]"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#241A12]">
                                {addr.full_name}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F8F4EB] border border-[#E9DFCE] text-[#76695C]">
                                {addr.address_type || 'Home'}
                              </span>
                              <span className="font-mono text-xs font-semibold text-[#241A12] ml-auto sm:ml-0">
                                {addr.phone}
                              </span>
                            </div>

                            <p className="text-xs text-[#241A12] leading-relaxed mt-2">
                              {addr.house_building}, {addr.street_area}
                              {addr.landmark && `, Near ${addr.landmark}`}
                              <br />
                              {addr.city}, {addr.state} — <strong className="font-mono">{addr.pincode}</strong>
                            </p>

                            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[#E9DFCE]/60">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(addr);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#76695C] hover:text-[#D4AF37] transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(addr.id);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors ml-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add / Edit Address Form */}
              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="bg-white p-5 rounded-xl border border-[#D4AF37]/50 shadow-sm mt-3 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E9DFCE]">
                    <h3 className="font-serif text-sm font-semibold text-[#241A12]">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </h3>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        }}
                        className="text-xs text-[#76695C] hover:text-[#241A12]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Priyadarshini Sundaram"
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] ${
                          formErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-[#E9DFCE]'
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-[10px] text-rose-600 mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 99948 87758"
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono ${
                          formErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-[#E9DFCE]'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[10px] text-rose-600 mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                        PIN Code (6 digits) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="e.g. 600028"
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono ${
                          formErrors.pincode ? 'border-rose-400 bg-rose-50/20' : 'border-[#E9DFCE]'
                        }`}
                      />
                      {formErrors.pincode && (
                        <p className="text-[10px] text-rose-600 mt-1">{formErrors.pincode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                        City / District *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Chennai"
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] ${
                          formErrors.city ? 'border-rose-400 bg-rose-50/20' : 'border-[#E9DFCE]'
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-[10px] text-rose-600 mt-1">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                        State *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                      House / Flat / Building / Floor *
                    </label>
                    <input
                      type="text"
                      value={formData.houseBuilding}
                      onChange={(e) => setFormData({ ...formData, houseBuilding: e.target.value })}
                      placeholder="e.g. Flat 4B, Royal Orchid Enclave"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] ${
                        formErrors.houseBuilding ? 'border-rose-400 bg-rose-50/20' : 'border-[#E9DFCE]'
                      }`}
                    />
                    {formErrors.houseBuilding && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors.houseBuilding}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                      Road / Street / Area / Colony *
                    </label>
                    <input
                      type="text"
                      value={formData.streetArea}
                      onChange={(e) => setFormData({ ...formData, streetArea: e.target.value })}
                      placeholder="e.g. 3rd Main Road, R.A. Puram"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] ${
                        formErrors.streetArea ? 'border-rose-400 bg-rose-50/20' : 'border-[#E9DFCE]'
                      }`}
                    />
                    {formErrors.streetArea && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors.streetArea}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#241A12] mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      placeholder="e.g. Near Sangeetha Hotel"
                      className="w-full px-3 py-2 text-xs border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#241A12] mb-1.5">
                      Address Type
                    </label>
                    <div className="flex items-center gap-4">
                      {['Home', 'Work', 'Other'].map((type) => (
                        <label key={type} className="inline-flex items-center gap-1.5 text-xs text-[#241A12] cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            value={type}
                            checked={formData.addressType === type}
                            onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                            className="text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37]"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        }}
                        className="px-4 py-2 border border-[#E9DFCE] rounded-lg text-xs font-semibold text-[#76695C] hover:bg-[#F8F4EB]"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-5 py-2 bg-[#D4AF37] hover:bg-[#C49A24] text-[#241A12] text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-2xs"
                    >
                      {savingAddress ? 'Saving Address...' : editingAddressId ? 'Update Address' : 'Save & Deliver Here'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2. ORDER ITEMS & PRODUCT DETAILS SECTION */}
            <div className="bg-[#F8F4EB]/60 rounded-2xl border border-[#E9DFCE] p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E9DFCE]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#241A12] flex items-center justify-center font-bold text-xs shadow-2xs">
                    2
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#241A12]">
                      Review Order Items
                    </h2>
                    <p className="text-[11px] text-[#76695C]">
                      Verify product details, quantity, weight, and pricing
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-[#E9DFCE] text-[#241A12]">
                  {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Product Summary Cards List */}
              <div className="space-y-4">
                {displayItems.map((item) => {
                  const resolvedImg = resolveItemImage(item);
                  const isItemCartMode = isCartMode;

                  return (
                    <div
                      key={item.product_id || item.id}
                      className="p-4 bg-white rounded-xl border border-[#E9DFCE] shadow-2xs transition-all hover:border-[#D4AF37]/50"
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        {/* Product Thumbnail with object-fit: contain */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#F8F4EB]/70 border border-[#E9DFCE] p-1.5 flex items-center justify-center shrink-0 overflow-hidden relative group">
                          <img
                            src={resolvedImg}
                            alt={item.name}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/products/temple_jewellery.jpg';
                            }}
                          />
                        </div>

                        {/* Product Detailed Information */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            {/* Category Badge & Item Total */}
                            <div className="flex items-start justify-between gap-2">
                              {item.category && (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F8F4EB] text-[#76695C] border border-[#E9DFCE]">
                                  {item.category}
                                </span>
                              )}
                              <span className="font-serif text-base sm:text-lg font-bold text-[#241A12] ml-auto">
                                ₹{Number(item.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Product Title */}
                            <h3 className="font-serif text-sm sm:text-base font-semibold text-[#241A12] leading-snug line-clamp-2 mt-1">
                              {item.name}
                            </h3>

                            {/* Attributes Grid (SKU, Weight, Variant) */}
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-[#76695C]">
                              {item.sku && (
                                <span className="font-mono">
                                  SKU: <strong className="text-[#241A12] font-semibold">{item.sku}</strong>
                                </span>
                              )}
                              {item.weight && (
                                <span className="font-mono">
                                  Weight: <strong className="text-[#241A12] font-semibold">{item.weight}</strong>
                                </span>
                              )}
                              {item.variant && (
                                <span>
                                  Variant: <strong className="text-[#241A12] font-semibold">{item.variant}</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pricing and Quantity Stepper Controls */}
                          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#E9DFCE]/60 flex-wrap gap-2">
                            {/* Individual Unit Price */}
                            <div className="text-xs text-[#76695C]">
                              <span>Price: </span>
                              <strong className="text-[#241A12] font-semibold">
                                ₹{Number(item.discounted_unit_price || item.unit_price).toLocaleString('en-IN')}
                              </strong>
                              {item.discounted_unit_price < item.unit_price && (
                                <span className="ml-1.5 text-[11px] line-through text-stone-400">
                                  ₹{Number(item.unit_price).toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className="text-[11px] text-[#76695C]"> / piece</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <div className="inline-flex items-center border border-[#E9DFCE] rounded-lg bg-white overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() =>
                                    isItemCartMode
                                      ? handleCartItemQuantityChange(item.id, item.quantity - 1)
                                      : handleSingleQuantityChange(quantity - 1)
                                  }
                                  disabled={(!isItemCartMode && quantity <= 1) || loadingCalc}
                                  className="w-7 h-7 flex items-center justify-center text-[#241A12] hover:bg-[#F8F4EB] disabled:opacity-40 transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-mono font-bold text-[#241A12]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    isItemCartMode
                                      ? handleCartItemQuantityChange(item.id, item.quantity + 1)
                                      : handleSingleQuantityChange(quantity + 1)
                                  }
                                  disabled={loadingCalc}
                                  className="w-7 h-7 flex items-center justify-center text-[#241A12] hover:bg-[#F8F4EB] transition-colors"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove Item Button (Cart Mode) */}
                              {isItemCartMode && (
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1.5 text-[#76695C] hover:text-rose-600 transition-colors"
                                  title="Remove item from checkout"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. DELIVERY ASSURANCE PANEL */}
            <div className="bg-[#F8F4EB]/40 border border-[#E9DFCE] rounded-xl p-4 flex items-center gap-4">
              <Truck className="w-6 h-6 text-[#D4AF37] shrink-0" />
              <div className="text-xs text-[#76695C]">
                <strong className="text-[#241A12] block">Secure Pan-India Insured Logistics</strong>
                Complimentary tamper-proof express delivery across all Indian pincodes with dedicated tracking.
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Checkout Action (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            
            <div className="bg-[#F8F4EB]/60 rounded-2xl border border-[#E9DFCE] p-5 sm:p-6 shadow-2xs space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E9DFCE]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#241A12] flex items-center justify-center font-bold text-xs shadow-2xs">
                    3
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#241A12]">
                    Order Summary
                  </h2>
                </div>

                <span className="text-xs font-semibold text-[#76695C]">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* COUPON CODE APPLICATION */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#241A12] uppercase tracking-wider">
                  Promotional Coupon / Privilege
                </label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <strong className="font-mono uppercase">{appliedCoupon}</strong>
                        {couponDiscount > 0 && (
                          <span className="text-emerald-700 ml-1.5 font-semibold">
                            (-₹{couponDiscount.toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-emerald-100 rounded-md transition-colors text-emerald-800"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. NATYAM10 or FLAT500"
                      className="flex-1 px-3 py-2 text-xs border border-[#E9DFCE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white font-mono uppercase"
                    />
                    <button
                      type="submit"
                      disabled={!couponInput.trim() || loadingCalc}
                      className="px-4 py-2 bg-[#241A12] hover:bg-black text-[#F8F4EB] text-xs font-semibold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Coupon Feedback Messages */}
                {couponSuccess && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" />
                    <span>{couponSuccess}</span>
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </p>
                )}

                {/* Quick Coupon Suggestions */}
                {!appliedCoupon && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-[10.5px] text-[#76695C]">
                    <span>Suggested:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponInput('NATYAM10');
                        setAppliedCoupon('NATYAM10');
                      }}
                      className="px-2 py-0.5 rounded bg-white border border-[#D4AF37]/50 text-[#241A12] hover:bg-[#D4AF37]/20 transition-colors font-mono font-semibold"
                    >
                      NATYAM10 (10% OFF)
                    </button>
                  </div>
                )}
              </div>

              {/* FINANCIAL BREAKDOWN CALCULATIONS */}
              <div className="space-y-2.5 pt-3 border-t border-[#E9DFCE] text-xs">
                {/* Product Subtotal */}
                <div className="flex justify-between text-[#76695C]">
                  <span>
                    Product Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-mono font-medium text-[#241A12]">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Promotional Savings */}
                {otherDiscounts > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promotional Discount</span>
                    <span className="font-mono">
                      -₹{otherDiscounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Coupon Discount */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Privilege ({appliedCoupon})</span>
                    <span className="font-mono">
                      -₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Delivery Fee */}
                <div className="flex justify-between text-[#76695C]">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
                    Free Delivery
                  </span>
                </div>

                {/* Final Payable Amount */}
                <div className="pt-3.5 border-t border-[#E9DFCE] flex justify-between items-baseline">
                  <div>
                    <span className="font-serif text-base font-bold text-[#241A12] block">
                      Final Payable Amount
                    </span>
                    <span className="text-[10px] text-[#76695C]">Inclusive of all taxes &amp; GST</span>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#241A12]">
                    ₹{finalPayableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Total Savings Callout */}
                {totalSavings > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-center text-xs text-emerald-800 font-medium mt-1">
                    ✨ You are saving ₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })} on this order!
                  </div>
                )}
              </div>

              {/* PROCEED TO CHECKOUT ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={submittingOrder || loadingCalc}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-[#D4AF37] hover:bg-[#C49A24] active:bg-[#B58C1F] text-[#241A12] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-[#241A12]" />
                  <span>{submittingOrder ? 'Generating Order...' : 'Proceed to Checkout (WhatsApp)'}</span>
                </button>

                <p className="text-[10.5px] text-[#76695C] text-center mt-2.5 leading-tight">
                  Generates verified order summary and opens WhatsApp to confirm availability directly with our artisan concierge.
                </p>
              </div>

            </div>

            {/* Authenticity Guarantee Card */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E9DFCE] text-xs text-[#76695C] shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <span>
                100% Certified Handcrafted Temple &amp; Classical Bharatanatyam Jewellery with Hallmark Authenticity.
              </span>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;