import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem, Address } from '../../types';
import { INDIAN_STATE_CODES, formatCurrency, validateGSTIN } from '../../utils/gstValidation';
import {
  X,
  CreditCard,
  Building2,
  FileText,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Landmark,
  BadgeCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface B2BCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const B2BCheckoutModal: React.FC<B2BCheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, cartSubtotal, currentUser, createOrder, showToast, storeSettings } = useApp();

  if (!isOpen || cart.length === 0) return null;

  // Business & Contact details
  const [businessName, setBusinessName] = useState(
    currentUser?.businessProfile?.businessName || 'Shree Ganesh Traders & Enterprises'
  );
  const [businessType, setBusinessType] = useState(
    currentUser?.businessProfile?.businessType || 'Private Limited (Pvt Ltd)'
  );
  const [gstin, setGstin] = useState(
    currentUser?.businessProfile?.gstin || '09AABCS1429B1Z4'
  );
  const [gstFeedback, setGstFeedback] = useState<{ isValid: boolean; message: string; stateName?: string; panNumber?: string } | null>(null);

  const [poNumber, setPoNumber] = useState(`PO-GRE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [contactName, setContactName] = useState(currentUser?.name || 'Manoj Kumar Gupta');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'procurement@shreeganesh.in');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '9876543210');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  // Commercial Shipping / Warehouse Address
  const defaultSaved = currentUser?.savedAddresses?.[0];
  const [shippingStreet, setShippingStreet] = useState(defaultSaved?.street || 'Plot 42, Transport Nagar, Phase 2');
  const [shippingLandmark, setShippingLandmark] = useState(defaultSaved?.landmark || 'Near Indian Oil Depot');
  const [shippingCity, setShippingCity] = useState(defaultSaved?.city || 'Meerut');
  const [shippingState, setShippingState] = useState(defaultSaved?.state || 'Uttar Pradesh');
  const [shippingPostalCode, setShippingPostalCode] = useState(defaultSaved?.postalCode || '250002');
  const [shippingCountry] = useState('India');

  // Billing Address
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('Uttar Pradesh');
  const [billingPostalCode, setBillingPostalCode] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'B2B Credit (Net 30)' | 'RTGS / NEFT / IMPS Bank Transfer' | 'UPI / NetBanking' | 'Cash on Delivery'>('B2B Credit (Net 30)');

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setContactName(currentUser.name);
      if (currentUser.email && !currentUser.email.includes('@phone.grenterprises.in')) setContactEmail(currentUser.email);
      if (currentUser.phone) setContactPhone(currentUser.phone.replace(/\D/g, '').slice(-10));
      if (currentUser.businessProfile) {
        setBusinessName(currentUser.businessProfile.businessName);
        setGstin(currentUser.businessProfile.gstin);
        setBusinessType(currentUser.businessProfile.businessType);
      }
      if (currentUser.savedAddresses && currentUser.savedAddresses.length > 0) {
        const addr = currentUser.savedAddresses[0];
        setShippingStreet(addr.street);
        setShippingLandmark(addr.landmark || '');
        setShippingCity(addr.city);
        setShippingState(addr.state);
        setShippingPostalCode(addr.postalCode);
      }
    }
  }, [currentUser]);

  // Validate GSTIN on change
  useEffect(() => {
    if (gstin.trim()) {
      const res = validateGSTIN(gstin.trim().toUpperCase());
      setGstFeedback(res);
      if (res.isValid && res.stateName) {
        setShippingState(res.stateName);
      }
    } else {
      setGstFeedback(null);
    }
  }, [gstin]);

  // Tax calculations: Seller is GR Enterprises registered in Meerut, Uttar Pradesh (State Code 09)
  const taxableSubtotal = cartSubtotal;
  const isInterstate = shippingState.trim().toLowerCase() !== 'uttar pradesh';
  const taxRate = 0.18; // 18% GST average
  const totalTaxAmount = Math.round(taxableSubtotal * taxRate);
  const cgst = isInterstate ? 0 : Math.round(totalTaxAmount / 2);
  const sgst = isInterstate ? 0 : Math.round(totalTaxAmount / 2);
  const igst = isInterstate ? totalTaxAmount : 0;
  const freightFee = taxableSubtotal >= 25000 ? 0 : 450; // Commercial pallet freight
  const grandTotal = taxableSubtotal + totalTaxAmount + freightFee;

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!businessName.trim()) errors.businessName = 'Business/Company Name is required for B2B invoice';
    if (!contactName.trim()) errors.contactName = 'Authorized contact person name is required';
    if (!contactEmail.trim() || !contactEmail.includes('@')) errors.contactEmail = 'Valid business email is required for tax invoice dispatch';
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 10) errors.contactPhone = 'Valid 10-digit phone number is required';
    if (!shippingStreet.trim()) errors.shippingStreet = 'Warehouse / Commercial delivery address is required';
    if (!shippingCity.trim()) errors.shippingCity = 'City is required';
    if (!shippingPostalCode.trim() || shippingPostalCode.length < 6) errors.shippingPostal = '6-digit PIN code is required';

    if (!sameAsShipping) {
      if (!billingStreet.trim()) errors.billingStreet = 'Billing street address is required';
      if (!billingCity.trim()) errors.billingCity = 'Billing city is required';
      if (!billingPostalCode.trim()) errors.billingPostal = 'Billing PIN code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Form Validation Notice', 'Please correct the highlighted commercial details before placing wholesale order.', 'error');
      return;
    }

    const cleanGstin = gstin.trim().toUpperCase() || '09AABCS1429B1Z4';

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
      mode: 'B2B',
      customerId: currentUser?.id || `b2b-${Date.now()}`,
      customerName: contactName,
      customerEmail: contactEmail,
      customerPhone: `+91 ${contactPhone.replace(/\D/g, '').slice(-10)}`,
      businessDetails: {
        businessName: businessName.trim(),
        gstin: cleanGstin,
        businessType: businessType,
        panNumber: cleanGstin.length >= 12 ? cleanGstin.substring(2, 12) : undefined
      },
      shippingAddress,
      billingAddress,
      items: orderItems,
      subtotal: cartSubtotal,
      discountAmount: 0,
      shippingFee: freightFee,
      taxAmount: totalTaxAmount,
      taxBreakdown: {
        cgst,
        sgst,
        igst
      },
      totalAmount: grandTotal,
      paymentMethod: paymentMethod === 'RTGS / NEFT / IMPS Bank Transfer' ? 'UPI / NetBanking' : paymentMethod,
      paymentStatus: paymentMethod === 'B2B Credit (Net 30)' ? 'Pending Invoice' : paymentMethod === 'Cash on Delivery' ? 'COD' : 'Paid',
      trackingNumber: `GRE-LOG-${Math.floor(100000 + Math.random() * 900000)}`
    });

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (notifyWhatsApp) {
      showToast(
        'WhatsApp PO Confirmation Dispatched',
        `🟢 Official WhatsApp notification sent to ${contactPhone}: Wholesale Order #${newOrder.orderNumber} confirmed! GST Tax invoice generated.`,
        'success'
      );
    }

    showToast(
      'Wholesale Order Placed',
      `Commercial Purchase Order #${newOrder.orderNumber} booked. Invoice: ${newOrder.invoiceNumber}`,
      'success'
    );

    onClose();
    onOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-4 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
                  B2B Commercial Portal
                </span>
                <span className="text-xs text-slate-400">Meerut Logistics Hub</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white">Wholesale Purchase Order Checkout</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <form id="b2b-checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Section 1: Business Information & GSTIN */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <BadgeCheck className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">1. Commercial Entity & Tax Identification (GSTIN)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Trade Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Shree Ganesh Traders & Enterprises"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      formErrors.businessName ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.businessName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.businessName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buyer GSTIN (for Input Tax Credit) *
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 09AABCS1429B1Z4"
                    maxLength={15}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                  />
                  {gstFeedback && (
                    <p className={`text-[10px] mt-1 font-medium ${gstFeedback.isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {gstFeedback.isValid ? '✅ Valid GSTIN format' : '⚠️ Format check'} • {gstFeedback.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Order (PO) Number / Work Order Reference
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-GRE-2026-9041"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Constitution
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Private Limited (Pvt Ltd)">Private Limited (Pvt Ltd)</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Public Limited">Public Limited</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Person */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <FileText className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">2. Procurement Manager / Authorized Contact</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Manoj Kumar Gupta"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      formErrors.contactName ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.contactName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.contactName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Email (for Tax Invoices) *
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="procurement@shreeganesh.in"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      formErrors.contactEmail ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.contactEmail && <p className="text-[11px] text-rose-600 mt-1">{formErrors.contactEmail}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-xs bg-slate-200 text-slate-700 border border-r-0 border-slate-300 rounded-l-xl font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className={`w-full px-3 py-2 text-xs bg-white border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono ${
                        formErrors.contactPhone ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {formErrors.contactPhone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.contactPhone}</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={notifyWhatsApp}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700">
                  Send live order tracking updates & digital tax invoice to WhatsApp (+91 {contactPhone})
                </span>
              </label>
            </div>

            {/* Section 3: Commercial Shipping & Warehouse Address */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Truck className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">3. Commercial Delivery & Warehouse Destination</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warehouse / Factory / Commercial Premise Street Address *
                  </label>
                  <input
                    type="text"
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    placeholder="Plot No., Industrial Area, Sector, Road"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      formErrors.shippingStreet ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.shippingStreet && <p className="text-[11px] text-rose-600 mt-1">{formErrors.shippingStreet}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Landmark (for Heavy Freight Drivers)
                  </label>
                  <input
                    type="text"
                    value={shippingLandmark}
                    onChange={(e) => setShippingLandmark(e.target.value)}
                    placeholder="e.g. Near Transporter Union Office"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Hub *
                  </label>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="e.g. Meerut, Noida, Delhi, Ghaziabad"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      formErrors.shippingCity ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.shippingCity && <p className="text-[11px] text-rose-600 mt-1">{formErrors.shippingCity}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State (Determines CGST/SGST vs IGST) *
                  </label>
                  <select
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {Object.values(INDIAN_STATE_CODES).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    value={shippingPostalCode}
                    onChange={(e) => setShippingPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="250002"
                    maxLength={6}
                    className={`w-full px-3 py-2 text-xs font-mono bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      formErrors.shippingPostal ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.shippingPostal && <p className="text-[11px] text-rose-600 mt-1">{formErrors.shippingPostal}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Payment Terms */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Landmark className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">4. Commercial Settlement & Payment Terms</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'B2B Credit (Net 30)',
                    title: 'Corporate Credit (Net 30)',
                    desc: 'Official 30-day payment term with GST tax invoice billing'
                  },
                  {
                    id: 'RTGS / NEFT / IMPS Bank Transfer',
                    title: 'Bank Transfer (RTGS / NEFT)',
                    desc: 'Direct remittance to GR Enterprises Axis Current A/c'
                  },
                  {
                    id: 'UPI / NetBanking',
                    title: 'Corporate UPI / NetBanking',
                    desc: 'Instant settlement via corporate banking gateway'
                  },
                  {
                    id: 'Cash on Delivery',
                    title: 'Pay on Pallet Delivery (COD)',
                    desc: 'Handover payment upon commercial receipt at warehouse'
                  }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      paymentMethod === opt.id 
                        ? 'border-blue-700 bg-blue-50/60 shadow-xs' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900">{opt.title}</div>
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id as any)}
                        className="text-blue-600 mt-0.5"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                  </label>
                ))}
              </div>

              {paymentMethod === 'RTGS / NEFT / IMPS Bank Transfer' && (
                <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">GR Enterprises Meerut Hub Bank Coordinates:</p>
                  <p>Bank: <strong>Axis Bank Ltd, Meerut Main Branch</strong></p>
                  <p>A/c Name: <strong>GR Enterprises Private Limited</strong></p>
                  <p>A/c Number: <strong>926020045812903</strong> (Current A/c)</p>
                  <p>IFSC: <strong>UTIB0000184</strong></p>
                </div>
              )}
            </div>

            {/* Section 5: Order Items & Tax Summary */}
            <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm">Wholesale PO Bill of Materials ({cart.length} items)</span>
                <span className="text-xs text-slate-400">Supplier: GR Enterprises (UP-09)</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                    <div>
                      <span className="font-semibold">{item.product.title}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        SKU: {item.product.sku} | HSN: {item.product.hsnCode} | {item.quantity} {item.product.unit}s @ {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-slate-200">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax & Total breakdown */}
              <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Taxable Wholesale Value</span>
                  <span className="font-mono font-semibold">{formatCurrency(taxableSubtotal)}</span>
                </div>

                {isInterstate ? (
                  <div className="flex justify-between text-blue-300">
                    <span>IGST (Integrated GST 18%)</span>
                    <span className="font-mono font-semibold">{formatCurrency(igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-blue-300">
                      <span>CGST (Central GST 9%)</span>
                      <span className="font-mono font-semibold">{formatCurrency(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-blue-300">
                      <span>SGST (State GST 9%)</span>
                      <span className="font-mono font-semibold">{formatCurrency(sgst)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span>Commercial Freight Logistics</span>
                  <span className="font-mono font-semibold">
                    {freightFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : formatCurrency(freightFee)}
                  </span>
                </div>

                <div className="flex justify-between text-base sm:text-lg font-black text-white pt-2 border-t border-slate-700">
                  <span>Grand Total (Invoice Value)</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>GST Tax Invoice with E-Way Bill generated instantly on PO confirmation</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 hover:bg-blue-600 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2"
              >
                <span>Authorize & Place Purchase Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
