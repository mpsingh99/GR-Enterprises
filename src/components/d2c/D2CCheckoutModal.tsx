import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem, Address } from '../../types';
import { INDIAN_STATE_CODES, formatCurrency } from '../../utils/gstValidation';
import {
  X,
  CreditCard,
  QrCode,
  Truck,
  ShieldCheck,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface D2CCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const D2CCheckoutModal: React.FC<D2CCheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, cartSubtotal, currentUser, createOrder, showToast, storeSettings, setIsGoogleAuthModalOpen } = useApp();

  if (!isOpen || cart.length === 0) return null;

  // Checkout form state
  const [isGuest, setIsGuest] = useState(!currentUser);
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifySms, setNotifySms] = useState(true);

  // Shipping Address - defaulted to Uttar Pradesh (Meerut region) or saved
  const defaultSaved = currentUser?.savedAddresses?.[0];
  const [shippingStreet, setShippingStreet] = useState(defaultSaved?.street || 'A-304, Green Heights, Shastri Nagar');
  const [shippingLandmark, setShippingLandmark] = useState(defaultSaved?.landmark || 'Near Central Park');
  const [shippingCity, setShippingCity] = useState(defaultSaved?.city || 'Meerut');
  const [shippingState, setShippingState] = useState(defaultSaved?.state || 'Uttar Pradesh');
  const [shippingPostalCode, setShippingPostalCode] = useState(defaultSaved?.postalCode || '250004');
  const [shippingCountry] = useState('India');

  // Sync form when currentUser changes (e.g. after Google Sign-In)
  useEffect(() => {
    if (currentUser) {
      setIsGuest(false);
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.email) setCustomerEmail(currentUser.email);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.savedAddresses && currentUser.savedAddresses.length > 0) {
        const addr = currentUser.savedAddresses[0];
        setShippingStreet(addr.street);
        setShippingLandmark(addr.landmark || '');
        setShippingCity(addr.city);
        setShippingState(addr.state);
        setShippingPostalCode(addr.postalCode);
      }
    } else {
      setIsGuest(true);
    }
  }, [currentUser]);

  // Billing Address
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('Uttar Pradesh');
  const [billingPostalCode, setBillingPostalCode] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'Credit/Debit Card' | 'UPI / NetBanking' | 'Cash on Delivery'>('Credit/Debit Card');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');

  // Calculations
  const discountAmount = 0;
  const taxableSubtotal = cartSubtotal - discountAmount;
  const shippingFee = taxableSubtotal >= (storeSettings.freeShippingThreshold || 1000) ? 0 : 99;
  
  // Tax calculations: Seller is GR Enterprises registered in Meerut, Uttar Pradesh (State Code 09)
  const isInterstate = shippingState.trim().toLowerCase() !== 'uttar pradesh';
  const taxRate = 0.18;
  const totalTaxAmount = Math.round(taxableSubtotal * taxRate);
  const cgst = isInterstate ? 0 : Math.round(totalTaxAmount / 2);
  const sgst = isInterstate ? 0 : Math.round(totalTaxAmount / 2);
  const igst = isInterstate ? totalTaxAmount : 0;
  const grandTotal = taxableSubtotal + totalTaxAmount + shippingFee;

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.name = 'Full name is required';
    if (!customerEmail.trim() || !customerEmail.includes('@')) errors.email = 'Valid email address is required';
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) errors.phone = 'Valid 10-digit phone number is required';
    if (!shippingStreet.trim()) errors.shippingStreet = 'Street address is required';
    if (!shippingCity.trim()) errors.shippingCity = 'City is required';
    if (!shippingPostalCode.trim() || shippingPostalCode.length < 6) errors.shippingPostal = '6-digit PIN code is required';

    if (!sameAsShipping) {
      if (!billingStreet.trim()) errors.billingStreet = 'Billing street is required';
      if (!billingCity.trim()) errors.billingCity = 'Billing city is required';
      if (!billingPostalCode.trim()) errors.billingPostal = 'Billing postal code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Form Validation Error', 'Please correct the highlighted fields before placing order.', 'error');
      return;
    }

    const shippingAddress: Address = {
      street: shippingStreet,
      landmark: shippingLandmark,
      city: shippingCity,
      state: shippingState,
      postalCode: shippingPostalCode,
      country: shippingCountry
    };

    const billingAddress: Address = sameAsShipping
      ? shippingAddress
      : {
          street: billingStreet,
          city: billingCity,
          state: billingState,
          postalCode: billingPostalCode,
          country: shippingCountry
        };

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.productId,
      productTitle: item.product.title,
      sku: item.selectedVariant?.sku || item.product.sku,
      hsnCode: item.product.hsnCode,
      unit: item.product.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      taxAmount: Math.round(item.unitPrice * item.quantity * (item.product.taxRatePercent / 100)),
      variantName: item.selectedVariant?.name
    }));

    const newOrder = createOrder({
      mode: 'D2C',
      customerId: currentUser?.id || `guest-${Date.now()}`,
      customerName,
      customerEmail,
      customerPhone,
      isGuest,
      shippingAddress,
      billingAddress,
      items: orderItems,
      subtotal: cartSubtotal,
      discountAmount,
      shippingFee,
      taxAmount: totalTaxAmount,
      taxBreakdown: {
        cgst,
        sgst,
        igst
      },
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'COD' : 'Paid',
      trackingNumber: `GRE-EXP-${Math.floor(100000 + Math.random() * 900000)}`
    });

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (notifyWhatsApp) {
      showToast(
        'WhatsApp Order Alert Dispatched',
        `🟢 Official WhatsApp message sent to ${customerPhone}: Order #${newOrder.orderNumber} confirmed! Tracking details & GST tax invoice attached.`,
        'success'
      );
    }

    if (notifySms) {
      setTimeout(() => {
        showToast(
          'SMS Delivery Notification Sent',
          `💬 Priority SMS dispatched to ${customerPhone} via VM-GRENTR: Your order #${newOrder.orderNumber} is scheduled for Meerut hub dispatch.`,
          'info'
        );
      }, 600);
    }

    onOrderSuccess(newOrder);
  };

  const stateNames = Object.values(INDIAN_STATE_CODES);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">GR Enterprises • Direct Retail Checkout</h2>
              <p className="text-xs text-slate-500">Fulfilled from Meerut Logistics Hub • Live GST Calculation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8">
          <form onSubmit={handleSubmitOrder} id="d2c-checkout-form" className="space-y-8">
            
            {/* Google Express Checkout Banner for Guests */}
            {!currentUser && (
              <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-blue-950">Express Checkout with Google</p>
                      <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-1.5 py-0.2 rounded">Recommended</span>
                    </div>
                    <p className="text-[11px] text-blue-800">
                      Sign in with Google to prefill your mobile number & delivery address and track this order.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleAuthModalOpen(true)}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}

            {/* Google Profile Active Indicator */}
            {currentUser?.authProvider === 'google' && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-semibold text-blue-950">
                    Google Profile Active: <strong>{currentUser.name}</strong> ({currentUser.email}) • Mobile: {currentUser.phone || 'Saved'}
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 bg-white font-bold px-2 py-0.5 rounded border border-blue-200">
                  Address Auto-Synced
                </span>
              </div>
            )}

            {/* Guest vs Registered Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  {currentUser ? `Checking out as: ${currentUser.name} (${currentUser.email})` : 'Guest Checkout Available'}
                </p>
                <p className="text-[11px] text-emerald-800">
                  Direct dispatch from GR Enterprises Meerut center. Invoices with GST breakdown sent to your email.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsGuest(false)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${!isGuest ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-900 border border-emerald-300'}`}
                >
                  Saved Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsGuest(true)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${isGuest ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-900 border border-emerald-300'}`}
                >
                  Guest Checkout
                </button>
              </div>
            </div>

            {/* Step 1: Customer Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">1</div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. priya@example.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 99301 23456"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {formErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              {/* Real-time Order Notification Alerts */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-500">Order Updates Dispatched Via:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100/70 transition">
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={e => setNotifyWhatsApp(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🟢 WhatsApp Alerts</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100/70 transition">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={e => setNotifySms(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>💬 SMS Notification</span>
                </label>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">2</div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Shipping Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / House / Flat No. *</label>
                  <input
                    type="text"
                    required
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    placeholder="e.g. Flat 304, Green Heights, Shastri Nagar"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {formErrors.shippingStreet && <p className="text-[11px] text-rose-600 mt-1">{formErrors.shippingStreet}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={shippingLandmark}
                    onChange={(e) => setShippingLandmark(e.target.value)}
                    placeholder="e.g. Near Central Park"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="e.g. Meerut"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {formErrors.shippingCity && <p className="text-[11px] text-rose-600 mt-1">{formErrors.shippingCity}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {stateNames.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isInterstate 
                      ? 'Dispatching from Meerut (UP) to outside state: IGST (18%) applies' 
                      : 'Intrastate dispatch within Uttar Pradesh: CGST (9%) + SGST (9%) applies'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingPostalCode}
                    onChange={(e) => setShippingPostalCode(e.target.value)}
                    placeholder="e.g. 250004"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {formErrors.shippingPostal && <p className="text-[11px] text-rose-600 mt-1">{formErrors.shippingPostal}</p>}
                </div>
              </div>
            </div>

            {/* Step 3: Billing Address */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">3</div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Billing Address</h3>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Same as shipping address</span>
                </label>
              </div>

              {!sameAsShipping && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-3 animate-in fade-in">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Street Address *</label>
                    <input
                      type="text"
                      value={billingStreet}
                      onChange={(e) => setBillingStreet(e.target.value)}
                      placeholder="e.g. 102 Business Park, Delhi Road"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                    {formErrors.billingStreet && <p className="text-[11px] text-rose-600 mt-1">{formErrors.billingStreet}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Billing City *</label>
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      placeholder="e.g. Meerut"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Billing State *</label>
                    <select
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    >
                      {stateNames.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Billing PIN Code *</label>
                    <input
                      type="text"
                      value={billingPostalCode}
                      onChange={(e) => setBillingPostalCode(e.target.value)}
                      placeholder="e.g. 250001"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Payment Method */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">4</div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit/Debit Card')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'Credit/Debit Card'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-2 text-emerald-600" />
                  <span className="text-xs">Credit / Debit Card</span>
                  <span className="text-[10px] text-slate-400 font-normal">Visa, Mastercard, RuPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI / NetBanking')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'UPI / NetBanking'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-2 text-emerald-600" />
                  <span className="text-xs">Instant UPI & NetBanking</span>
                  <span className="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Truck className="w-5 h-5 mb-2 text-emerald-600" />
                  <span className="text-xs">Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Pay at doorstep upon delivery</span>
                </button>
              </div>

              {paymentMethod === 'Credit/Debit Card' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3 animate-in fade-in">
                  <div className="col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Card Number (Simulated)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVV Code</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI / NetBanking' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                  <label className="block text-[11px] font-semibold text-slate-700">UPI Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                  />
                  <p className="text-[10px] text-slate-500">Collect request will be initiated to your UPI handle.</p>
                </div>
              )}
            </div>

            {/* Step 5: Order Breakdown & Tax Summary */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Order Price & Tax Breakdown</h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Total ({cart.length} item kinds)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(cartSubtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Dispatch & Delivery (from Meerut Hub)</span>
                  <span className="font-semibold text-slate-900">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(shippingFee)}
                  </span>
                </div>

                {/* Live GST Breakdown based on Meerut (09) */}
                {isInterstate ? (
                  <div className="flex justify-between text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                    <span>IGST (Integrated GST @ 18% interstate supply from UP)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(igst)}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (Central Tax @ 9%)</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (UP State Tax @ 9%)</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(sgst)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-slate-950 pt-3 border-t border-slate-300">
                  <span>Final Payable Amount</span>
                  <span className="text-emerald-700 text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>GR Enterprises • Encrypted Secure Checkout</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Back to Cart
            </button>

            <button
              type="submit"
              form="d2c-checkout-form"
              className="w-1/2 sm:w-auto px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
            >
              <span>Pay & Place Order ({formatCurrency(grandTotal)})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
