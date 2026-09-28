import React, { useState, useEffect, useRef } from 'react';
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
  UserPlus,
  MessageSquare,
  Smartphone,
  KeyRound,
  RotateCcw,
  Check
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
    sendPhoneOtp,
    loginWithPhoneOtp,
    switchPersona, 
    showToast 
  } = useApp();

  const activeTab = initialTab || authModalTab;

  // Primary Authenticator Selector: 'message' | 'google' | 'email'
  const [authMethod, setAuthMethod] = useState<'message' | 'google' | 'email'>('message');

  // ================= MESSAGE AUTHENTICATOR (OTP) STATE =================
  const [msgPhone, setMsgPhone] = useState<string>('9837155667');
  const [msgChannel, setMsgChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [incomingMessage, setIncomingMessage] = useState<string>('');
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ================= GOOGLE AUTHENTICATOR STATE =================
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [useCustomGoogle, setUseCustomGoogle] = useState<boolean>(false);
  const [customGoogleName, setCustomGoogleName] = useState<string>('Manendra Pratap Singh');
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('manendra.singh@gmail.com');

  // ================= COMMON / REGISTRATION FIELDS =================
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

  // ================= EMAIL SIGN IN STATE =================
  const [loginEmail, setLoginEmail] = useState<string>('priya.sharma@example.com');
  const [loginPassword, setLoginPassword] = useState<string>('RetailPass@2026');

  // General UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Countdown timer effect for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  if (!isOpen) return null;

  // ================= HANDLERS: MESSAGE AUTHENTICATOR =================
  const handleSendOtp = async (channelOverride?: 'sms' | 'whatsapp') => {
    const channelToUse = channelOverride || msgChannel;
    setErrorMsg('');

    const cleanPhoneDigits = msgPhone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(cleanPhoneDigits, channelToUse);
      if (res.success) {
        setIsOtpSent(true);
        setIncomingMessage(res.messagePreview || `Your 6-digit OTP code is ${res.simulatedOtp || '123456'}.`);
        setSimulatedOtp(res.simulatedOtp || '123456');
        setResendCountdown(30);
        setOtpDigits(['', '', '', '', '', '']);
        showToast(
          'Verification Code Dispatched',
          res.message,
          'success'
        );
        // Focus first OTP digit input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMsg(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending OTP. Please check your connection.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanChar = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      triggerVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = (code: string) => {
    const digits = code.slice(0, 6).split('');
    const padded = [...digits, '', '', '', '', ''].slice(0, 6);
    setOtpDigits(padded);
    triggerVerifyOtp(code);
  };

  const triggerVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP verification code.');
      return;
    }

    setErrorMsg('');
    setIsVerifyingOtp(true);

    try {
      const cleanPhoneDigits = msgPhone.replace(/\D/g, '');
      const deliveryAddress: Address = {
        street: street.trim() || 'Civil Lines Central',
        landmark: landmark.trim() || undefined,
        city: city.trim() || 'Meerut',
        state: state.trim() || 'Uttar Pradesh',
        postalCode: postalCode.trim() || '250001',
        country: 'India'
      };

      const customName = name.trim() || `Customer +91 ${cleanPhoneDigits.slice(-10)}`;
      const user = await loginWithPhoneOtp(
        cleanPhoneDigits,
        code,
        activeTab === 'signup' ? customName : undefined,
        deliveryAddress
      );

      if (user) {
        setIsVerifyingOtp(false);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('Invalid or expired OTP code. Please enter the correct 6-digit code or request a new one.');
        setIsVerifyingOtp(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
      setIsVerifyingOtp(false);
    }
  };

  // ================= HANDLERS: GOOGLE AUTHENTICATOR =================
  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setUseCustomGoogle(false);
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
    setSelectedPresetIndex(-1);
    setName(customGoogleName);
    setEmail(customGoogleEmail);
    setPhone('9837155667');
    setStreet('A-12, Sector 3, Meerut Bypass');
    setLandmark('Near Sports Goods Hub');
    setCity('Meerut');
    setState('Uttar Pradesh');
    setPostalCode('250002');
    setErrorMsg('');
  };

  const handleGoogleQuickSignIn = (idx: number) => {
    const acc = PRESET_GOOGLE_ACCOUNTS[idx];
    setIsSubmitting(true);
    setTimeout(() => {
      registerGoogleRetailUser({
        name: acc.name,
        email: acc.email,
        avatar: acc.avatar,
        phone: `+91 ${acc.phone}`,
        address: acc.address
      });
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 250);
  };

  const handleCustomGoogleSignIn = () => {
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google Gmail address.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      registerGoogleRetailUser({
        name: customGoogleName.trim() || 'Google User',
        email: customGoogleEmail.trim(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customGoogleName.trim() || customGoogleEmail)}`,
        phone: '+91 9837155667',
        address: {
          street: 'Civil Lines, Delhi Road',
          city: 'Meerut',
          state: 'Uttar Pradesh',
          postalCode: '250001',
          country: 'India'
        }
      });
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 250);
  };

  // ================= HANDLER: SIGN UP SUBMIT (Google or Email) =================
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for order delivery notifications.');
      return;
    }

    if (!street.trim()) {
      setErrorMsg('Please enter your street address.');
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
      if (authMethod === 'google') {
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
    }, 300);
  };

  // ================= HANDLER: EMAIL SIGN IN =================
  const handleEmailSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      switchPersona('d2c_customer');
      onClose();
      if (onSuccess) onSuccess();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[95vh] flex flex-col">
        
        {/* Header with Title & Mode Switcher */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
                GR
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeTab === 'signup' ? 'Retail Customer Sign-Up' : 'Customer Account Sign-In'}
                </h2>
                <p className="text-xs text-slate-500">
                  GR Enterprises • Unlock genuine retail pricing & express doorstep delivery
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Tabs: Sign Up vs Sign In */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-3">
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
              <span>Create Account (Sign Up)</span>
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

          {/* Authenticator Method Pills: Message OTP vs Google vs Email */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => { setAuthMethod('message'); setErrorMsg(''); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                authMethod === 'message'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>SMS / WhatsApp OTP</span>
              <span className="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full">Fast</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('google'); setErrorMsg(''); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                authMethod === 'google'
                  ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition border ${
                authMethod === 'email'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Pass</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 text-xs">

          {/* ===================== METHOD 1: MESSAGE AUTHENTICATOR (SMS / WHATSAPP OTP) ===================== */}
          {authMethod === 'message' && (
            <div className="space-y-4">
              
              {/* Channel Selector: WhatsApp vs SMS */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      💬
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">Message Authenticator (Mobile OTP)</p>
                      <p className="text-[11px] text-slate-500">Instant login without password via SMS or WhatsApp alert</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    No Password Needed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setMsgChannel('whatsapp'); }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      msgChannel === 'whatsapp'
                        ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-emerald-100 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      🟢
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs">WhatsApp Alert</p>
                      <p className="text-[10px] text-emerald-700 font-semibold truncate">Official GR Business</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMsgChannel('sms'); }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      msgChannel === 'sms'
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      💬
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs">SMS Message</p>
                      <p className="text-[10px] text-blue-700 font-semibold truncate">Direct Mobile SMS</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Phone Input Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Enter 10-Digit Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 text-xs shadow-xs">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={msgPhone}
                    onChange={e => setMsgPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9837155667"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs tracking-wider"
                  />
                  <button
                    type="button"
                    disabled={isSendingOtp || msgPhone.length < 10}
                    onClick={() => handleSendOtp()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                  >
                    {isSendingOtp ? (
                      <span>Sending...</span>
                    ) : isOtpSent ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend</span>
                      </>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  A 6-digit secure login code will be dispatched to your phone via {msgChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}.
                </p>
              </div>

              {/* Simulated Incoming Message Card */}
              {isOtpSent && incomingMessage && (
                <div className={`p-3.5 rounded-2xl shadow-lg border space-y-2.5 animate-in fade-in slide-in-from-top-2 ${
                  msgChannel === 'whatsapp'
                    ? 'bg-emerald-950 text-white border-emerald-700/60'
                    : 'bg-slate-900 text-white border-slate-700/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        msgChannel === 'whatsapp' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {msgChannel === 'whatsapp' ? '🟢' : '💬'}
                      </div>
                      <div>
                        <p className="font-bold text-xs flex items-center gap-1.5">
                          <span>{msgChannel === 'whatsapp' ? 'WhatsApp • GR Enterprises' : 'SMS • VM-GRENTR'}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            msgChannel === 'whatsapp' ? 'bg-emerald-800 text-emerald-100' : 'bg-blue-900 text-blue-100'
                          }`}>
                            Verified
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-300">Incoming Notification • Just now</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20">
                      Live Preview
                    </span>
                  </div>

                  <p className="text-xs p-2.5 rounded-xl bg-black/30 border border-white/10 font-mono leading-relaxed text-slate-100">
                    {incomingMessage}
                  </p>

                  {simulatedOtp && (
                    <button
                      type="button"
                      onClick={() => handleAutoFillOtp(simulatedOtp)}
                      className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Click to Auto-Fill Code ({simulatedOtp})</span>
                    </button>
                  )}
                </div>
              )}

              {/* 6-Digit OTP Input & Verification */}
              {isOtpSent && (
                <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 space-y-4 shadow-sm animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Enter 6-Digit Verification Code</span>
                    </span>
                    {resendCountdown > 0 ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-[11px] text-emerald-700 font-bold hover:underline"
                      >
                        Resend code now
                      </button>
                    )}
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className="w-10 sm:w-12 h-12 text-center text-lg font-black bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 transition"
                      />
                    ))}
                  </div>

                  {/* If in Sign-Up mode, also collect Name and Address */}
                  {activeTab === 'signup' && (
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <p className="font-bold text-slate-800 text-[11px]">Delivery & Profile Details for Express Retail Checkout</p>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g. Ramesh Chandra"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">PIN Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={postalCode}
                            onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verify Action Button */}
                  <button
                    type="button"
                    disabled={isVerifyingOtp || otpDigits.join('').length < 6}
                    onClick={() => triggerVerifyOtp()}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <span>Verifying code & logging in...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Verify OTP & {activeTab === 'signup' ? 'Complete Sign-Up' : 'Log In'}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ===================== METHOD 2: GOOGLE AUTHENTICATOR ===================== */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              
              {/* Google Fast Sign In / Sign Up Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <div>
                      <span className="font-bold text-blue-950 text-xs sm:text-sm">Google Authenticator</span>
                      <p className="text-[11px] text-blue-800">1-Click Sign-In with any Google or Gmail account</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                    OAuth 2.0
                  </span>
                </div>

                {/* 1-Click Fast Accounts */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-slate-700">Quick Test Google Profiles:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESET_GOOGLE_ACCOUNTS.map((acc, idx) => (
                      <button
                        type="button"
                        key={acc.email}
                        onClick={() => {
                          if (activeTab === 'signin') {
                            handleGoogleQuickSignIn(idx);
                          } else {
                            handleSelectPreset(idx);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                          selectedPresetIndex === idx && !useCustomGoogle
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
                </div>

                {/* Custom Google Account Section */}
                <div className="pt-2 border-t border-blue-200/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-950">Or Enter Your Own Google Account:</span>
                    <button
                      type="button"
                      onClick={handleCustomGoogleMode}
                      className={`text-[11px] font-semibold ${
                        useCustomGoogle ? 'text-blue-700 underline font-bold' : 'text-blue-600 hover:underline'
                      }`}
                    >
                      {useCustomGoogle ? '✓ Custom Mode Active' : '+ Custom Google Profile'}
                    </button>
                  </div>

                  {useCustomGoogle && (
                    <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-2.5 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">Your Full Name</label>
                          <input
                            type="text"
                            value={customGoogleName}
                            onChange={e => setCustomGoogleName(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">Google Gmail Address</label>
                          <input
                            type="email"
                            value={customGoogleEmail}
                            onChange={e => setCustomGoogleEmail(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {activeTab === 'signin' ? (
                        <button
                          type="button"
                          onClick={handleCustomGoogleSignIn}
                          disabled={isSubmitting}
                          className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Sign In with Custom Google ID</span>
                        </button>
                      ) : (
                        <p className="text-[10px] text-slate-500">
                          Custom Google credentials selected. Complete your delivery address below to finish sign-up.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* If in Sign Up mode, show Address & Details */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Delivery Address (Meerut / UP Fulfilled)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={e => setStreet(e.target.value)}
                          placeholder="House/Flat No, Building, Street"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={e => setLandmark(e.target.value)}
                          placeholder="e.g. Near Circuit House"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={postalCode}
                          onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Setting up Google retail account...</span>
                    ) : (
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
                    )}
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ===================== METHOD 3: EMAIL & PASSWORD ===================== */}
          {authMethod === 'email' && (
            <div className="space-y-4">
              {activeTab === 'signin' ? (
                <form onSubmit={handleEmailSignInSubmit} className="space-y-3.5">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-500 bg-white"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Account</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password *</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={e => setStreet(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">PIN Code *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={postalCode}
                          onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Retail Account</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>GR Enterprises Meerut Logistics Hub • 100% Secure Authentication</span>
          </div>
          <span className="text-[11px] text-slate-400">GSTIN Registered Hub</span>
        </div>

      </div>
    </div>
  );
};
