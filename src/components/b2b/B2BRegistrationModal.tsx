import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessType, Address, B2BApplicationDetails } from '../../types';
import { validateGSTIN, INDIAN_STATE_CODES } from '../../utils/gstValidation';
import {
  X,
  Building2,
  FileCheck2,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Info
} from 'lucide-react';

interface B2BRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const B2BRegistrationModal: React.FC<B2BRegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { submitB2BApplication, currentUser, showToast, openAuthModal } = useApp();

  if (!isOpen) return null;

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Private Limited (Pvt Ltd)');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('₹1 Lakh - ₹5 Lakhs');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [website, setWebsite] = useState('');

  // Contact
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [designation, setDesignation] = useState('Procurement Manager');

  // Shop / Registered Address
  const [shopStreet, setShopStreet] = useState('');
  const [shopLandmark, setShopLandmark] = useState('');
  const [shopCity, setShopCity] = useState('');
  const [shopState, setShopState] = useState('Uttar Pradesh');
  const [shopPostalCode, setShopPostalCode] = useState('');
  const [shopCountry] = useState('India');

  // Billing & Shipping
  const [sameAsShopAddress, setSameAsShopAddress] = useState(true);
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('Uttar Pradesh');
  const [billingPostalCode, setBillingPostalCode] = useState('');

  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('Uttar Pradesh');
  const [shippingPostalCode, setShippingPostalCode] = useState('');

  // Documents
  const [resaleCertFileName, setResaleCertFileName] = useState<string>('');
  const [supportingDocName, setSupportingDocName] = useState<string>('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gstFeedback, setGstFeedback] = useState<{ isValid: boolean; message: string; stateName?: string; panNumber?: string } | null>(null);

  const handleGstinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setGstin(val);
    if (val.length > 0) {
      const res = validateGSTIN(val);
      setGstFeedback(res);
      if (res.isValid && res.stateName) {
        // Auto-match state if found
        setShopState(res.stateName);
      }
      if (res.panNumber) {
        setPanNumber(res.panNumber);
      } else if (val.length >= 12) {
        setPanNumber(val.substring(2, 12));
      }
    } else {
      setGstFeedback(null);
    }
  };

  const handleFileSimulate = (type: 'cert' | 'support') => {
    // Generate simulated file attachment name
    if (type === 'cert') {
      setResaleCertFileName(`GST_Reg_Certificate_${businessName.replace(/\s+/g, '_') || 'Biz'}.pdf`);
      showToast('Document Attached', 'Resale / GST Certificate attached successfully', 'success');
    } else {
      setSupportingDocName(`Trade_License_${businessName.replace(/\s+/g, '_') || 'Biz'}.pdf`);
      showToast('Document Attached', 'Supporting Business License attached successfully', 'success');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) newErrors.businessName = 'Legal business name is required';
    
    // GST validation
    const gstRes = validateGSTIN(gstin);
    if (!gstRes.isValid) {
      newErrors.gstin = gstRes.message;
    }

    if (!contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!contactEmail.trim() || !contactEmail.includes('@')) newErrors.contactEmail = 'Valid corporate email required';
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 10) newErrors.contactPhone = 'Valid 10-digit mobile number required';

    if (!shopStreet.trim()) newErrors.shopStreet = 'Shop/Office street address is required';
    if (!shopCity.trim()) newErrors.shopCity = 'City is required';
    if (!shopPostalCode.trim() || shopPostalCode.length < 6) newErrors.shopPostalCode = 'Valid 6-digit postal code required';

    if (!sameAsShopAddress) {
      if (!billingStreet.trim()) newErrors.billingStreet = 'Billing street required';
      if (!shippingStreet.trim()) newErrors.shippingStreet = 'Shipping street required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Validation Error', 'Please complete all required fields and verify GSTIN format.', 'error');
      return;
    }

    const shopAddress: Address = {
      street: shopStreet,
      landmark: shopLandmark,
      city: shopCity,
      state: shopState,
      postalCode: shopPostalCode,
      country: shopCountry
    };

    const billingAddress: Address = sameAsShopAddress
      ? shopAddress
      : {
          street: billingStreet,
          city: billingCity,
          state: billingState,
          postalCode: billingPostalCode,
          country: shopCountry
        };

    const shippingAddress: Address = sameAsShopAddress
      ? shopAddress
      : {
          street: shippingStreet,
          city: shippingCity,
          state: shippingState,
          postalCode: shippingPostalCode,
          country: shopCountry
        };

    submitB2BApplication({
      userId: currentUser?.id || `user-b2b-${Date.now()}`,
      businessName,
      businessType,
      gstin: gstin.toUpperCase(),
      panNumber: panNumber.toUpperCase() || (gstin.length >= 12 ? gstin.substring(2, 12).toUpperCase() : 'PENDING'),
      website: website || undefined,
      contactName,
      contactEmail,
      contactPhone,
      designation,
      monthlyVolume,
      shopAddress,
      billingAddress,
      shippingAddress,
      sameAsShopAddress,
      resaleCertFileName: resaleCertFileName || 'Simulated_GSTIN_Doc.pdf',
      supportingDocName: supportingDocName || undefined,
      paymentTerms
    });

    onSuccess();
  };

  const stateNames = Object.values(INDIAN_STATE_CODES);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">GR Enterprises • B2B Wholesale Account Application</h2>
              <p className="text-xs text-blue-200">Register your verified business for wholesale pricing tiers and UP GST input credit (Meerut Hub)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8">
          
          {/* Important Legal Disclaimer Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Important Notice regarding Application Review</p>
              <p className="mt-0.5 leading-relaxed text-amber-900/90">
                Submitting an application <strong>does not guarantee immediate approval</strong>. Our compliance desk manually verifies your GSTIN, MCA status, and business physical address. While your application is <strong>Pending</strong>, you may browse the catalog, but wholesale checkout and approved-tier prices will remain locked until verified.
              </p>
            </div>
          </div>

          <form id="b2b-register-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Business Legal Identity */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">1</div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Business Legal Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Zenith Enterprises Pvt Ltd"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {errors.businessName && <p className="text-[11px] text-rose-600 mt-1">{errors.businessName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Entity Type *</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Private Limited (Pvt Ltd)">Private Limited (Pvt Ltd)</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="Trust / Society / NGO">Trust / Society / NGO</option>
                  </select>
                </div>

                {/* GSTIN Field with Live Validation */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      GSTIN / GST Registration Number *
                    </label>
                    <span className="text-[10px] text-slate-400">Standard 15-character format: 27AAAAA0000A1Z5</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={gstin}
                    onChange={handleGstinChange}
                    placeholder="e.g. 27AABCU9603R1ZM"
                    className={`w-full text-xs font-mono font-bold tracking-wider p-2.5 border rounded-xl uppercase transition ${
                      gstFeedback
                        ? gstFeedback.isValid
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 focus:ring-emerald-500'
                          : 'border-rose-400 bg-rose-50/50 text-rose-950 focus:ring-rose-500'
                        : 'bg-slate-50 border-slate-300 focus:bg-white'
                    }`}
                  />
                  
                  {/* GST Feedback message */}
                  {gstFeedback && (
                    <div className={`mt-1.5 p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                      gstFeedback.isValid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {gstFeedback.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                      <span>{gstFeedback.message}</span>
                    </div>
                  )}
                  {errors.gstin && <p className="text-[11px] text-rose-600 mt-1">{errors.gstin}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company PAN Card Number *</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. AABCU9603R"
                    className="w-full text-xs font-mono font-bold uppercase p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400">Auto-extracted from GSTIN digits 3 to 12</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Monthly Procurement Volume *</label>
                  <select
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Under ₹1,00,000">Under ₹1,00,000 / month</option>
                    <option value="₹1 Lakh - ₹5 Lakhs">₹1 Lakh - ₹5 Lakhs / month (Standard B2B)</option>
                    <option value="₹5 Lakhs - ₹25 Lakhs">₹5 Lakhs - ₹25 Lakhs / month (Volume Tier)</option>
                    <option value="₹25 Lakhs+">₹25 Lakhs+ / month (Enterprise Contract)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Credit Terms *</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Net 30">Net 30 Days (Commercial Invoice Credit)</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Advance / Prepaid">Advance / Prepaid (Immediate Dispatch)</option>
                    <option value="Net 60">Net 60 Days (High Volume Audited)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Website (Optional)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* 2. Authorized Contact */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">2</div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Authorized Commercial Contact</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  {errors.contactName && <p className="text-[11px] text-rose-600 mt-1">{errors.contactName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Procurement Head / Director"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. procurement@zenithenterprises.in"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  {errors.contactEmail && <p className="text-[11px] text-rose-600 mt-1">{errors.contactEmail}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 98450 11223"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  {errors.contactPhone && <p className="text-[11px] text-rose-600 mt-1">{errors.contactPhone}</p>}
                </div>
              </div>
            </div>

            {/* 3. Shop & Registered Business Address */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">3</div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Shop / Registered Business Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / Unit / Floor *</label>
                  <input
                    type="text"
                    required
                    value={shopStreet}
                    onChange={(e) => setShopStreet(e.target.value)}
                    placeholder="e.g. Plot 42, MIDC Industrial Area, Phase II"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  {errors.shopStreet && <p className="text-[11px] text-rose-600 mt-1">{errors.shopStreet}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={shopLandmark}
                    onChange={(e) => setShopLandmark(e.target.value)}
                    placeholder="e.g. Near Turbhe Station"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={shopCity}
                    onChange={(e) => setShopCity(e.target.value)}
                    placeholder="e.g. Navi Mumbai"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  {errors.shopCity && <p className="text-[11px] text-rose-600 mt-1">{errors.shopCity}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <select
                    value={shopState}
                    onChange={(e) => setShopState(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {stateNames.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shopPostalCode}
                    onChange={(e) => setShopPostalCode(e.target.value)}
                    placeholder="e.g. 400705"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  {errors.shopPostalCode && <p className="text-[11px] text-rose-600 mt-1">{errors.shopPostalCode}</p>}
                </div>
              </div>
            </div>

            {/* 4. Billing & Shipping Address Setup */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">4</div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Billing & Warehouse Locations</h3>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsShopAddress}
                    onChange={(e) => setSameAsShopAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Same as shop/registered office address</span>
                </label>
              </div>

              {!sameAsShopAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Billing Address (Tax Invoicing)</h4>
                    <input
                      type="text"
                      placeholder="Billing Street Address"
                      value={billingStreet}
                      onChange={(e) => setBillingStreet(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={billingPostalCode}
                        onChange={(e) => setBillingPostalCode(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Warehouse / Shipping Delivery Address</h4>
                    <input
                      type="text"
                      placeholder="Warehouse Street Address"
                      value={shippingStreet}
                      onChange={(e) => setShippingStreet(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Documents Upload (Resale Certificate / Supporting Docs) */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">5</div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Supporting Documents (Optional but recommended)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition flex flex-col items-center text-center">
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">GST Registration Certificate (Form REG-06)</span>
                  <p className="text-[11px] text-slate-500 mb-3">Upload PDF or scan of GSTIN certificate</p>
                  {resaleCertFileName ? (
                    <div className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[180px]">{resaleCertFileName}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFileSimulate('cert')}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Choose File / Attach</span>
                    </button>
                  )}
                </div>

                <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition flex flex-col items-center text-center">
                  <Building2 className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800">Trade License / Incorporation Certificate</span>
                  <p className="text-[11px] text-slate-500 mb-3">Upload supporting corporate proof or MSME Udhyam</p>
                  {supportingDocName ? (
                    <div className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[180px]">{supportingDocName}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFileSimulate('support')}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Choose File / Attach</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Secure GST Audited Portal • Strict Confidentiality</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="b2b-register-form"
              className="w-1/2 sm:w-auto px-8 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/25 transition flex items-center justify-center gap-2"
            >
              <span>Submit Application for Review</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
