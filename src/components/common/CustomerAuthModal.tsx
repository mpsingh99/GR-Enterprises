import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import {
  X,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signup' | 'signin';
  onSuccess?: () => void;
}

// Preset realistic Google accounts for fast 1-click test simulation
const PRESET_GOOGLE_ACCOUNTS = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '9837155667',
    address: {
      street: 'House 42, Civil Lines, Boundary Road',
      landmark: 'Near Circuit House & Commissioner Residence',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250001',
      country: 'India'
    }
  },
  {
    name: 'Pooja Verma',
    email: 'pooja.verma@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '9927088219',
    address: {
      street: 'Flat 302, Royal Residency, Delhi Road',
      landmark: 'Opposite Transport Nagar Commercial Complex',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250002',
      country: 'India'
    }
  },
  {
    name: 'Rohan Mehra',
    email: 'rohan.mehra@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    phone: '9818844332',
    address: {
      street: 'C-14, Sector 62, Electronic City',
      landmark: 'Near Metro Station Gate 2',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201309',
      country: 'India'
    }
  }
];

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab,
  onSuccess 
}) => {
  const { 
    authModalTab, 
    setAuthModalTab, 
    registerGoogleRetailUser, 
    registerRetailUser, 
    switchPersona, 
    setActiveModal, 
    showToast 
  } = useApp();

  const activeTab = initialTab || authModalTab;

  // Selected Google Account preset or custom
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [useCustomGoogle, setUseCustomGoogle] = useState<boolean>(false);
  const [isGoogleFlow, setIsGoogleFlow] = useState<boolean>(true);

  // Common Form Fields
  const [name, setName] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].name);
  const [email, setEmail] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].email);
  const [password, setPassword] = useState<string>('RetailPass@2026');
  const [phone, setPhone] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].phone);
  const [street, setStreet] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].address.street);
  const [landmark, setLandmark] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].address.landmark);
  const [city, setCity] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].address.city);
  const [state, setState] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].address.state);
  const [postalCode, setPostalCode] = useState<string>(PRESET_GOOGLE_ACCOUNTS[0].address.postalCode);
  const [addressType, setAddressType] = useState<'Home' | 'Work / Shop'>('Home');

  // Sign in form state
  const [loginEmail, setLoginEmail] = useState<string>('priya.sharma@example.com');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setUseCustomGoogle(false);
    setIsGoogleFlow(true);
    const acc = PRESET_GOOGLE_ACCOUNTS[idx];
    setName(acc.name);
    setEmail(acc.email);
    setPhone(acc.phone);
    setStreet(acc.address.street);
    setLandmark(acc.address.landmark);
    setCity(acc.address.city);
    setState(acc.address.state);
    setPostalCode(acc.address.postalCode);
    setErrorMsg('');
  };

  const handleCustomGoogleMode = () => {
    setUseCustomGoogle(true);
    setIsGoogleFlow(true);
    setSelectedPresetIndex(-1);
    setName('');
    setEmail('');
    setPhone('');
    setStreet('');
    setLandmark('');
    setCity('Meerut');
    setState('Uttar Pradesh');
    setPostalCode('250002');
    setErrorMsg('');
  };

  const handleEmailSignupMode = () => {
    setIsGoogleFlow(false);
    setUseCustomGoogle(false);
    setSelectedPresetIndex(-1);
    setName('');
    setEmail('');
    setPhone('');
    setStreet('');
    setLandmark('');
    setCity('Meerut');
    setState('Uttar Pradesh');
    setPostalCode('250002');
    setErrorMsg('');
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Phone validation
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for order delivery notifications.');
      return;
    }

    // Address validation
    if (!street.trim()) {
      setErrorMsg('Please enter your street address (House/Flat No., Building & Street).');
      return;
    }

    if (!city.trim()) {
      setErrorMsg('Please enter your city.');
      return;
    }

    if (!postalCode.trim() || postalCode.replace(/\D/g, '').length < 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);

    const deliveryAddress: Address = {
      street: street.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: state.trim() || 'Uttar Pradesh',
      postalCode: postalCode.trim(),
      country: 'India'
    };

    setTimeout(() => {
      if (isGoogleFlow) {
        const avatarUrl = selectedPresetIndex >= 0 && selectedPresetIndex < PRESET_GOOGLE_ACCOUNTS.length
          ? PRESET_GOOGLE_ACCOUNTS[selectedPresetIndex].avatar
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;

        registerGoogleRetailUser({
          name: name.trim(),
          email: email.trim(),
          avatar: avatarUrl,
          phone: `+91 ${cleanPhoneDigits.slice(-10)}`,
          address: deliveryAddress
        });
      } else {
        registerRetailUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: `+91 ${cleanPhoneDigits.slice(-10)}`,
          address: deliveryAddress
        });
      }

      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 350);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      switchPersona('d2c_customer');
      onClose();
      if (onSuccess) onSuccess();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[95vh] flex flex-col">
        
        {/* Header with Title & Mode Switcher */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm">
                GR
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Simple Retail Customer Sign-Up
                </h2>
                <p className="text-xs text-slate-500">
                  Quick personal account to unlock retail price tags & doorstep delivery
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher: Sign Up vs Sign In */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setAuthModalTab('signup'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up (Create Account)</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthModalTab('signin'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 text-xs">

          {/* ===================== SIGN UP TAB ===================== */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-5">
              
              {/* Google Sign Up Hero Button */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="font-bold text-blue-950 text-xs sm:text-sm">Sign Up with Google</span>
                  </div>
                  <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>

                <p className="text-[11px] text-blue-900/80">
                  Select a Google account to verify your identity. Your mobile number and delivery address below will be linked for express checkout.
                </p>

                {/* Preset Accounts Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {PRESET_GOOGLE_ACCOUNTS.map((acc, idx) => (
                    <button
                      type="button"
                      key={acc.email}
                      onClick={() => handleSelectPreset(idx)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        selectedPresetIndex === idx && isGoogleFlow && !useCustomGoogle
                          ? 'border-blue-600 bg-white shadow-xs ring-2 ring-blue-500/20'
                          : 'border-blue-100 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate text-[11px] leading-tight">{acc.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{acc.email}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-200/60">
                  <button
                    type="button"
                    onClick={handleCustomGoogleMode}
                    className={`font-semibold transition ${
                      useCustomGoogle ? 'text-blue-700 underline font-bold' : 'text-blue-600 hover:underline'
                    }`}
                  >
                    + Enter custom Google ID
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailSignupMode}
                    className={`font-semibold transition ${
                      !isGoogleFlow ? 'text-slate-900 underline font-bold' : 'text-slate-500 hover:underline'
                    }`}
                  >
                    Sign up with Email instead
                  </button>
                </div>
              </div>

              {/* Account Credentials Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    1. Account Credentials {isGoogleFlow && '(Google Authenticated)'}
                  </span>
                  {isGoogleFlow && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Google Profile Linked</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {!isGoogleFlow && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Mandatory Mobile Phone Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Delivery Mobile Phone Number *</span>
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded">
                    Mandatory for Dispatch
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Required for courier tracking SMS and doorstep dispatch from our Meerut center.
                </p>

                <div className="flex gap-2">
                  <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 select-none shrink-0">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile (e.g. 9837155667)"
                    value={phone.replace(/^\+?91\s*/, '')}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 3. Mandatory Delivery Address */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>3. Doorstep Delivery Address *</span>
                  </label>

                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                    {(['Home', 'Work / Shop'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`px-2 py-0.5 rounded font-semibold transition ${
                          addressType === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    House / Flat / Building & Street *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 42, Civil Lines, Boundary Road"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Circuit House"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meerut"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                    >
                      <option value="Uttar Pradesh">Uttar Pradesh (Home Hub)</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Other">Other Indian State</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 250001"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value="India (IN)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-slate-900/15 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating your retail account...</span>
                ) : isGoogleFlow ? (
                  <>
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Complete Google Sign-Up & Start Shopping</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Retail Account</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===================== SIGN IN TAB ===================== */}
          {activeTab === 'signin' && (
            <div className="space-y-5">
              {/* Google Fast Sign In */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 text-center">
                <h3 className="font-bold text-slate-900 text-sm">Sign In with Google</h3>
                <p className="text-[11px] text-slate-500">
                  Quickly access your saved retail orders and addresses with Google authentication.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPreset(0);
                      // Submit as Aarav
                      registerGoogleRetailUser({
                        name: PRESET_GOOGLE_ACCOUNTS[0].name,
                        email: PRESET_GOOGLE_ACCOUNTS[0].email,
                        avatar: PRESET_GOOGLE_ACCOUNTS[0].avatar,
                        phone: `+91 ${PRESET_GOOGLE_ACCOUNTS[0].phone}`,
                        address: PRESET_GOOGLE_ACCOUNTS[0].address
                      });
                      onClose();
                      if (onSuccess) onSuccess();
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition flex items-center gap-2.5 shadow-xs"
                  >
                    <img
                      src={PRESET_GOOGLE_ACCOUNTS[0].avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate text-xs">{PRESET_GOOGLE_ACCOUNTS[0].name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{PRESET_GOOGLE_ACCOUNTS[0].email}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPreset(1);
                      registerGoogleRetailUser({
                        name: PRESET_GOOGLE_ACCOUNTS[1].name,
                        email: PRESET_GOOGLE_ACCOUNTS[1].email,
                        avatar: PRESET_GOOGLE_ACCOUNTS[1].avatar,
                        phone: `+91 ${PRESET_GOOGLE_ACCOUNTS[1].phone}`,
                        address: PRESET_GOOGLE_ACCOUNTS[1].address
                      });
                      onClose();
                      if (onSuccess) onSuccess();
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition flex items-center gap-2.5 shadow-xs"
                  >
                    <img
                      src={PRESET_GOOGLE_ACCOUNTS[1].avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate text-xs">{PRESET_GOOGLE_ACCOUNTS[1].name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{PRESET_GOOGLE_ACCOUNTS[1].email}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Or manual email sign in */}
              <form onSubmit={handleSignInSubmit} className="space-y-3">
                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-slate-200"></div>
                  <span className="px-3 text-[10px] font-bold text-slate-400 uppercase">Or with registered email</span>
                  <div className="flex-1 border-t border-slate-200"></div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Password *
                    </label>
                    <span className="text-[10px] text-blue-600 hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition shadow flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Customer</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthModalTab('signup'); setErrorMsg(''); }}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    Sign up now with Google & Address →
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Retail Customer Protection Footnote */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Genuine Retail Products • Meerut Hub Dispatch</span>
          </div>
          <span className="text-[11px] text-slate-400">Secure Retail Ordering</span>
        </div>

      </div>
    </div>
  );
};
