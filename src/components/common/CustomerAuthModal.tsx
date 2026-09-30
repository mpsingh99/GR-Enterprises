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
  Check,
  Settings,
  HelpCircle,
  Calendar
} from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signup' | 'signin';
  onSuccess?: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

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
    loginUser,
    sendPhoneOtp,
    loginWithPhoneOtp,
    updateCustomerProfile,
    showToast 
  } = useApp();

  const activeTab = initialTab || authModalTab;

  // Authenticator Method: 'message' (SMS/WhatsApp OTP) | 'google' (Real Google OAuth) | 'email' (Email & Password)
  const [authMethod, setAuthMethod] = useState<'message' | 'google' | 'email'>('message');

  // ================= 1. REAL MOBILE OTP STATE =================
  const [msgPhone, setMsgPhone] = useState<string>('');
  const [msgChannel, setMsgChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [dispatchStatusMsg, setDispatchStatusMsg] = useState<string>('');
  const [gatewayNotice, setGatewayNotice] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 2 Customer Profile details state after OTP is verified
  const [otpStep, setOtpStep] = useState<'phone' | 'profile'>('phone');
  const [verifiedCustomer, setVerifiedCustomer] = useState<any>(null);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // ================= 2. REAL GOOGLE OAUTH 2.0 STATE =================
  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('gre_google_client_id') || '944114337019-6kf4iudg57jkqua4jeg731oijr0obqmq.apps.googleusercontent.com';
  });
  const [showGoogleConfig, setShowGoogleConfig] = useState<boolean>(false);
  const [isGoogleGsiLoaded, setIsGoogleGsiLoaded] = useState<boolean>(false);

  // ================= 3. REGISTRATION / PROFILE FIELDS =================
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [city, setCity] = useState<string>('Meerut');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [postalCode, setPostalCode] = useState<string>('250001');

  // ================= 4. EMAIL SIGN-IN STATE =================
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // General form feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // OTP resend countdown timer
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

  // Check if Google Identity Services is available
  useEffect(() => {
    const checkGsi = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setIsGoogleGsiLoaded(true);
      }
    };
    checkGsi();
    const interval = setInterval(checkGsi, 500);
    return () => clearInterval(interval);
  }, []);

  // Render official Google Sign-In button whenever Google method is active
  useEffect(() => {
    if (authMethod !== 'google' || !googleBtnContainerRef.current) return;

    if (window.google?.accounts?.id && googleClientId.trim()) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId.trim(),
          callback: handleGoogleCredentialResponse,
        });

        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: activeTab === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
        });
      } catch (e) {
        console.warn('Google Identity button initialization error:', e);
      }
    }
  }, [authMethod, activeTab, googleClientId, isGoogleGsiLoaded]);

  if (!isOpen) return null;

  // ================= HANDLER: REAL GOOGLE CREDENTIAL TOKEN =================
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setErrorMsg('Google authentication was cancelled or returned empty credential.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const deliveryAddress: Address = {
        street: street.trim() || 'Central City Area',
        landmark: landmark.trim() || undefined,
        city: city.trim() || 'Meerut',
        state: state.trim() || 'Uttar Pradesh',
        postalCode: postalCode.trim() || '250001',
        country: 'India',
      };

      const user = await registerGoogleRetailUser({
        credential: response.credential,
        phone: phone.trim() ? `+91 ${phone.replace(/\D/g, '').slice(-10)}` : undefined,
        address: deliveryAddress,
      });

      setIsSubmitting(false);
      if (user) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Google verification failed on backend database.');
    }
  };

  const handleSaveGoogleClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleClientId.trim()) return;
    localStorage.setItem('gre_google_client_id', googleClientId.trim());
    setShowGoogleConfig(false);
    showToast('Google Client ID Saved', 'Google OAuth 2.0 Web Client configured successfully.', 'success');
  };

  // ================= HANDLER: REAL MOBILE OTP DISPATCH =================
  const handleSendOtp = async () => {
    setErrorMsg('');
    const cleanPhoneDigits = msgPhone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSendingOtp(true);
    setGatewayNotice('');

    try {
      const res = await sendPhoneOtp(cleanPhoneDigits, msgChannel);
      if (res.success) {
        setIsOtpSent(true);
        setDispatchStatusMsg(res.message);
        if (res.gatewayNotice) {
          setGatewayNotice(res.gatewayNotice);
        }
        setResendCountdown(30);
        setOtpDigits(['', '', '', '', '', '']);

        showToast(
          'Verification Code Dispatched',
          res.message,
          res.dispatched ? 'success' : 'info'
        );

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMsg(res.message || 'Failed to dispatch OTP from backend server.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with server.');
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

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    const padded = [...digits, '', '', '', '', ''].slice(0, 6);
    setOtpDigits(padded);
    if (pasted.length === 6) {
      triggerVerifyOtp(pasted);
    }
  };

  const triggerVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setErrorMsg('');
    setIsVerifyingOtp(true);

    try {
      const cleanPhoneDigits = msgPhone.replace(/\D/g, '');
      const user = await loginWithPhoneOtp(
        cleanPhoneDigits,
        code
      );

      setIsVerifyingOtp(false);
      if (user) {
        setVerifiedCustomer(user);

        // Check if customer profile needs completion
        const isDefaultName = !user.name || user.name.startsWith('Customer +91');
        const isDefaultEmail = !user.email || user.email.includes('@phone.grenterprises.in');
        const isAddressMissing = !user.savedAddresses || user.savedAddresses.length === 0 || !user.savedAddresses[0]?.street || user.savedAddresses[0]?.street === 'Central City Area';
        const isIncomplete = isDefaultName || isDefaultEmail || !user.age || isAddressMissing;

        if (activeTab === 'signup' || isIncomplete) {
          if (user.name && !isDefaultName) setName(user.name);
          if (user.email && !isDefaultEmail) setEmail(user.email);
          if (user.age) setAge(String(user.age));
          if (user.gender) setGender(user.gender);
          if (user.savedAddresses && user.savedAddresses.length > 0) {
            const addr = user.savedAddresses[0];
            if (addr.street && addr.street !== 'Central City Area') setStreet(addr.street);
            if (addr.landmark) setLandmark(addr.landmark);
            if (addr.city) setCity(addr.city);
            if (addr.state) setState(addr.state);
            if (addr.postalCode) setPostalCode(addr.postalCode);
          }
          setOtpStep('profile');
          showToast('Phone Number Verified', 'Please enter your customer profile details to finish registration.', 'info');
        } else {
          onClose();
          if (onSuccess) onSuccess();
        }
      } else {
        setErrorMsg('Invalid or expired OTP code. Please enter the correct code received on your mobile.');
      }
    } catch (err: any) {
      setIsVerifyingOtp(false);
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    }
  };

  // ================= HANDLER: SAVE CUSTOMER PROFILE DETAILS AFTER OTP =================
  const handleSaveCustomerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('A valid email address is required.');
      return;
    }

    if (!street.trim()) {
      setErrorMsg('Street address / House number is required for deliveries.');
      return;
    }

    if (!city.trim()) {
      setErrorMsg('City is required.');
      return;
    }

    if (!postalCode.trim() || postalCode.replace(/\D/g, '').length < 6) {
      setErrorMsg('Please enter a valid 6-digit PIN code.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const deliveryAddress: Address = {
        street: street.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim() || 'Meerut',
        state: state.trim() || 'Uttar Pradesh',
        postalCode: postalCode.trim() || '250001',
        country: 'India',
      };

      const cleanPhoneDigits = msgPhone.replace(/\D/g, '').slice(-10);
      const updated = await updateCustomerProfile({
        userId: verifiedCustomer?.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: age.trim() ? Number(age) : undefined,
        gender: gender || 'Male',
        address: deliveryAddress,
        phone: verifiedCustomer?.phone || `+91 ${cleanPhoneDigits}`,
      });

      setIsSavingProfile(false);
      if (updated) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setIsSavingProfile(false);
      setErrorMsg(err.message || 'Failed to save customer profile details.');
    }
  };

  // ================= HANDLER: REAL RETAIL REGISTRATION (DATABASE) =================
  const handleSignUpSubmit = async (e: React.FormEvent) => {
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

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for delivery notifications.');
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
      country: 'India',
    };

    try {
      const user = await registerRetailUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        phone: `+91 ${cleanPhoneDigits.slice(-10)}`,
        address: deliveryAddress,
      });

      setIsSubmitting(false);
      if (user) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to register account in database.');
    }
  };

  // ================= HANDLER: REAL EMAIL SIGN-IN (DATABASE) =================
  const handleEmailSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await loginUser(loginEmail.trim().toLowerCase(), loginPassword);
      setIsSubmitting(false);
      if (user) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
                GR
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeTab === 'signup' ? 'Create Customer Account' : 'Customer Sign-In'}
                </h2>
                <p className="text-xs text-slate-500">
                  GR Enterprises • Verified Customer Authentication & MongoDB Atlas Storage
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

          {/* Top Switchers: Only show when not in Step 2 Customer Profile */}
          {otpStep === 'profile' ? (
            <div className="flex items-center justify-between p-2 bg-emerald-50/80 rounded-2xl border border-emerald-200">
              <button
                type="button"
                onClick={() => setOtpStep('phone')}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white transition"
              >
                <span>←</span>
                <span>Back to Phone OTP</span>
              </button>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Step 2: Customer Details & Address</span>
              </div>
            </div>
          ) : (
            <>
              {/* Top Switcher: Sign Up vs Sign In */}
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

              {/* Authenticator Selector: Real Mobile OTP vs Real Google vs Real Email */}
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
                  <span>Mobile OTP</span>
                  <span className="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full">SMS & WhatsApp</span>
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
                  <span>Email & Password</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 text-xs">

          {/* ===================== AUTHENTICATOR 1: REAL MOBILE OTP ===================== */}
          {authMethod === 'message' && (
            <div className="space-y-4">
              
              {/* STEP 2: PROFILE DETAILS FORM (NAME, EMAIL, AGE, GENDER, ADDRESS) */}
              {otpStep === 'profile' ? (
                <form onSubmit={handleSaveCustomerDetails} className="space-y-4 animate-in fade-in">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Mobile Number Verified</p>
                        <p className="text-[11px] text-emerald-800 font-semibold">+91 {msgPhone.replace(/\D/g, '').slice(-10)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      Step 2 of 2
                    </span>
                  </div>

                  <div className="text-center pb-1">
                    <h3 className="font-black text-slate-900 text-base">Complete Customer Details</h3>
                    <p className="text-[11px] text-slate-500">
                      Please enter your name, age, email and delivery address for order fulfillment & invoicing.
                    </p>
                  </div>

                  {/* Personal Information Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Personal Information</span>
                    </p>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g. Manendra Singh"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="e.g. manendra@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            placeholder="e.g. 26"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery Address (Meerut & UP Fulfillment)</span>
                    </p>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Flat / House No. / Street Address *</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        placeholder="e.g. House #42, Blossom Residency, Civil Lines"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={e => setLandmark(e.target.value)}
                        placeholder="e.g. Near Circuit House / Clock Tower"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
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
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Details Button */}
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <span>Saving details in MongoDB database...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Customer Details & Enter Store</span>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Customer details saved directly in MongoDB Atlas database</span>
                  </div>
                </form>
              ) : (
                /* STEP 1: PHONE NUMBER & OTP CODE DISPATCH */
                <>
                  {/* Channel Selector: SMS vs WhatsApp */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          📱
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">Real Mobile Phone OTP</p>
                          <p className="text-[11px] text-slate-500">Live 6-digit verification code delivered directly to your Indian mobile</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        Direct Cellular Dispatch
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMsgChannel('sms')}
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
                          <p className="font-bold text-slate-900 text-xs">SMS Text Message</p>
                          <p className="text-[10px] text-blue-700 font-semibold truncate">Direct Cellular SMS</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMsgChannel('whatsapp')}
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
                          <p className="font-bold text-slate-900 text-xs">WhatsApp Message</p>
                          <p className="text-[10px] text-emerald-700 font-semibold truncate">Official Business Alert</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Phone Number Input */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Enter Your 10-Digit Mobile Number
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex flex-1 gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 text-xs shadow-xs shrink-0">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          value={msgPhone}
                          onChange={e => setMsgPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit number"
                          className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs tracking-wider"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isSendingOtp || msgPhone.length < 10}
                        onClick={handleSendOtp}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                      >
                        {isSendingOtp ? (
                          <span>Sending...</span>
                        ) : isOtpSent ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Resend Code</span>
                          </>
                        ) : (
                          <>
                            <span>Send Code</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Verification code will be dispatched to your phone via {msgChannel === 'whatsapp' ? 'WhatsApp' : 'cellular SMS'}.
                    </p>
                  </div>

                  {/* Real Dispatch Notification Status */}
                  {isOtpSent && dispatchStatusMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="font-medium">{dispatchStatusMsg}</span>
                    </div>
                  )}

                  {/* Gateway Configuration Notice if waiting for keys */}
                  {gatewayNotice && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Live SMS Gateway Setup</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {gatewayNotice}
                      </p>
                    </div>
                  )}

                  {/* 6-Digit OTP Input & Verification */}
                  {isOtpSent && (
                    <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 space-y-4 shadow-sm animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enter 6-Digit Code Received on Mobile</span>
                        </span>
                        {resendCountdown > 0 ? (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Resend in {resendCountdown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-[11px] text-emerald-700 font-bold hover:underline"
                          >
                            Resend code now
                          </button>
                        )}
                      </div>

                      {/* 6 Digit Input Boxes */}
                      <div className="flex justify-between gap-1 sm:gap-2">
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
                            onPaste={handlePasteOtp}
                            className="w-9 sm:w-12 h-11 sm:h-12 text-center text-lg font-black bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 transition flex-1 max-w-[48px]"
                          />
                        ))}
                      </div>

                      {/* Verify Action Button */}
                      <button
                        type="button"
                        disabled={isVerifyingOtp || otpDigits.join('').length < 6}
                        onClick={() => triggerVerifyOtp()}
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                      >
                        {isVerifyingOtp ? (
                          <span>Verifying code with database...</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Verify Code & Continue</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* ===================== AUTHENTICATOR 2: REAL GOOGLE OAUTH ===================== */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-bold text-blue-950 text-sm">Official Google Sign-In (OAuth 2.0)</span>
                </div>
                <p className="text-[11px] text-blue-900/80">
                  Authenticate securely using your real Google Account. Verified credentials will be stored directly in MongoDB Atlas.
                </p>

                {/* Google Button Container */}
                <div className="flex justify-center pt-2 min-h-[44px]">
                  {googleClientId.trim() ? (
                    <div ref={googleBtnContainerRef} className="flex justify-center" />
                  ) : (
                    <div className="text-center p-3 bg-white rounded-xl border border-blue-200 w-full">
                      <p className="text-xs text-slate-600 mb-2">Google OAuth Web Client ID not configured yet.</p>
                      <button
                        type="button"
                        onClick={() => setShowGoogleConfig(true)}
                        className="px-3.5 py-1.5 bg-blue-900 text-white rounded-lg font-bold text-xs hover:bg-blue-800 transition"
                      >
                        Configure Google Client ID
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-blue-200/60 text-slate-500">
                  <span>Google Identity Services (GSI)</span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleConfig(!showGoogleConfig)}
                    className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Settings className="w-3 h-3" />
                    <span>{showGoogleConfig ? 'Hide Config' : 'Client ID Settings'}</span>
                  </button>
                </div>

                {/* Optional Google Client ID Configuration Panel */}
                {showGoogleConfig && (
                  <form onSubmit={handleSaveGoogleClientId} className="p-3 bg-white rounded-xl border border-blue-300 text-left space-y-2 animate-in fade-in">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase">
                      Google OAuth 2.0 Web Client ID
                    </label>
                    <input
                      type="text"
                      value={googleClientId}
                      onChange={e => setGoogleClientId(e.target.value)}
                      placeholder="e.g. 123456789-xxxx.apps.googleusercontent.com"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowGoogleConfig(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800"
                      >
                        Save Client ID
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* If in Sign-Up mode, also capture delivery address */}
              {activeTab === 'signup' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Default Delivery Address for Google Profile</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        placeholder="House/Flat No, Building, Street"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Mobile Phone (For Order SMS / WhatsApp)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================== AUTHENTICATOR 3: REAL EMAIL & PASSWORD ===================== */}
          {authMethod === 'email' && (
            <div className="space-y-4">
              {activeTab === 'signin' ? (
                <form onSubmit={handleEmailSignInSubmit} className="space-y-3.5">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Registered Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-500 bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Password *
                        </label>
                      </div>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Verifying with database...</span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Account</span>
                      </>
                    )}
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
                          placeholder="Your real name"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Create Password *</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile"
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
                          placeholder="House/Flat No., Road, Area"
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
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving to MongoDB Atlas...</span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register Account in Database</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Real Error Message Alert */}
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
            <span>GR Enterprises • Live MongoDB Atlas Database Persistence</span>
          </div>
          <span className="text-[11px] text-slate-400">100% Real Authentication</span>
        </div>

      </div>
    </div>
  );
};
