import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CustomerMode,
  User,
  UserRole,
  Product,
  CartItem,
  Order,
  Quote,
  B2BApplicationDetails,
  ProductVariant,
  B2BStatus,
  OrderStatus,
  QuoteStatus,
  StoreSettings,
  Address
} from '../types';
import {
  DEFAULT_STORE_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_QUOTES,
  INITIAL_B2B_APPLICATIONS
} from '../data/mockData';
import {
  checkHealth,
  apiGetProducts,
  apiGetOrders,
  apiGetSettings,
  apiCreateOrder,
  apiRegisterRetail,
  apiGoogleSync,
  apiRegisterB2B,
  apiCreateQuote,
  apiUpdateSettings,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiUpdateOrderStatus,
  apiLogin,
  apiSendOtp,
  apiVerifyOtp,
  apiUpdateProfile
} from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  mode: CustomerMode;
  setMode: (mode: CustomerMode) => void;
  currentUser: User | null;
  switchPersona: (roleKey: 'guest' | 'd2c_customer' | 'b2b_pending' | 'b2b_needs_info' | 'b2b_approved' | 'admin') => void;
  
  // Database Connection Status (MongoDB Atlas / Local)
  dbStatus: { connected: boolean; host?: string; name?: string };

  // Store Settings (GR Enterprises, Meerut)
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: StoreSettings) => void;

  // Data collections
  products: Product[];
  orders: Order[];
  quotes: Quote[];
  b2bApplications: B2BApplicationDetails[];
  users: User[];
  updateUserRole: (userId: string, newRole: UserRole) => void;
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, quantity: number, variant?: ProductVariant) => boolean;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  
  // Orders & Checkout
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'invoiceNumber' | 'date' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  
  // B2B Applications
  submitB2BApplication: (appData: Omit<B2BApplicationDetails, 'id' | 'appliedDate' | 'status'>) => void;
  updateB2BApplicationByAdmin: (appId: string, status: B2BStatus, adminNotes?: string, creditLimit?: number, paymentTerms?: string) => void;
  updateB2BApplicationByCustomer: (appId: string, updatedFields: Partial<B2BApplicationDetails>) => void;
  
  // Quotes (RFQ)
  submitRFQ: (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'date' | 'status'>) => void;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus, offeredPrice?: number, adminNote?: string) => void;
  
  // Product management (Admin)
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  
  // Modals & Navigation UI
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedInvoiceOrder: Order | null;
  setSelectedInvoiceOrder: (order: Order | null) => void;
  selectedQuoteProduct: Product | null;
  setSelectedQuoteProduct: (product: Product | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  
  // Guest Orders
  guestOrderIds: string[];
  
  // Website Customer Authentication & Retail Onboarding
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'signup' | 'signin';
  setAuthModalTab: (tab: 'signup' | 'signin') => void;
  openAuthModal: (tab?: 'signup' | 'signin') => void;
  registerGoogleRetailUser: (profile: {
    credential?: string;
    name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    address?: Address;
  }) => Promise<User | null>;
  registerRetailUser: (profile: {
    name: string;
    email: string;
    phone?: string;
    address?: Address;
    password?: string;
  }) => Promise<User | null>;
  loginUser: (email: string, password?: string) => Promise<User | null>;
  isGoogleAuthModalOpen: boolean;
  setIsGoogleAuthModalOpen: (open: boolean) => void;

  // Mobile OTP & WhatsApp Message Authenticator
  sendPhoneOtp: (phone: string, channel?: 'sms' | 'whatsapp', email?: string) => Promise<{
    success: boolean;
    message: string;
    dispatched?: boolean;
    gatewayNotice?: string;
  }>;
  loginWithPhoneOtp: (
    phone: string,
    otp: string,
    name?: string,
    email?: string,
    age?: number,
    gender?: string,
    address?: Address,
    autoSetCurrentUser?: boolean
  ) => Promise<User | null>;
  completeLogin: (user: User) => void;
  updateCustomerProfile: (profileData: {
    userId: string;
    name: string;
    email: string;
    age?: number;
    gender?: string;
    address: Address;
    phone?: string;
  }) => Promise<User | null>;

  // Experience Gateway (Initial Visit Chooser)
  isExperienceGateOpen: boolean;
  setIsExperienceGateOpen: (open: boolean) => void;
  openExperienceGate: () => void;
  selectExperience: (chosenMode: CustomerMode) => void;

  // Utilities
  resetAllData: () => void;
  getB2BUnitPrice: (product: Product, quantity: number) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  MODE: 'gre_mode_v2',
  USER_ROLE: 'gre_user_role_v2',
  PRODUCTS: 'gre_products_v2',
  ORDERS: 'gre_orders_v2',
  QUOTES: 'gre_quotes_v2',
  APPLICATIONS: 'gre_b2b_apps_v2',
  USERS: 'gre_users_v2',
  CART: 'gre_cart_v2',
  SETTINGS: 'gre_settings_v2',
  GUEST_ORDERS: 'gre_guest_orders_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store Settings (GR Enterprises, Meerut)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
  });

  // Guest order IDs
  const [guestOrderIds, setGuestOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.GUEST_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  // Mode: D2C or B2B
  const [mode, setModeState] = useState<CustomerMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MODE);
    return (saved === 'B2B' || saved === 'D2C') ? saved : 'D2C';
  });

  // Users Directory
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current User (Defaults to null/guest for visitors until they sign up)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedRole = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ROLE);
    if (!savedRole || savedRole === 'guest') return null;
    return INITIAL_USERS.find(u => u.role === savedRole) || null;
  });

  // Experience Gateway (Prompts visitor on opening site: Retail or B2B)
  const [isExperienceGateOpen, setIsExperienceGateOpen] = useState<boolean>(() => {
    return !sessionStorage.getItem('gre_experience_chosen');
  });

  const openExperienceGate = () => {
    setIsExperienceGateOpen(true);
  };

  const selectExperience = (chosenMode: CustomerMode) => {
    setModeState(chosenMode);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MODE, chosenMode);
    sessionStorage.setItem('gre_experience_chosen', chosenMode);
    setIsExperienceGateOpen(false);
  };

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Quotes
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.QUOTES);
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

  // B2B Applications
  const [b2bApplications, setB2bApplications] = useState<B2BApplicationDetails[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.APPLICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_B2B_APPLICATIONS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedQuoteProduct, setSelectedQuoteProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signup' | 'signin'>('signup');
  const isGoogleAuthModalOpen = isAuthModalOpen;
  const setIsGoogleAuthModalOpen = (open: boolean) => setIsAuthModalOpen(open);

  const openAuthModal = (tab: 'signup' | 'signin' = 'signup') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICATIONS, JSON.stringify(b2bApplications));
  }, [b2bApplications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GUEST_ORDERS, JSON.stringify(guestOrderIds));
  }, [guestOrderIds]);

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; host?: string; name?: string }>({
    connected: false,
    host: 'Local Cache',
    name: 'Offline / Standalone'
  });

  // Attempt background sync with live MongoDB when backend server is running
  useEffect(() => {
    checkHealth()
      .then(health => {
        if (health) {
          setDbStatus({
            connected: health.database.connected,
            host: health.database.host,
            name: health.database.name
          });
          if (health.database.connected) {
            apiGetProducts().then(prods => {
              if (prods && prods.length > 0) setProducts(prods);
            });
            apiGetSettings().then(sett => {
              if (sett) setStoreSettings(sett);
            });
            apiGetOrders().then(ords => {
              if (ords && ords.length > 0) setOrders(ords);
            });
          }
        }
      })
      .catch(() => {
        // Backend server offline, continues running smoothly from local state
      });
  }, []);

  // Keep currentUser synced if applications change
  useEffect(() => {
    if (currentUser?.businessProfile) {
      const updatedApp = b2bApplications.find(a => a.id === currentUser.businessProfile?.id);
      if (updatedApp && updatedApp.status !== currentUser.businessProfile.status) {
        setCurrentUser(prev => {
          if (!prev) return null;
          const newRole = updatedApp.status === 'approved' 
            ? 'b2b_approved' 
            : updatedApp.status === 'needs_more_info' 
              ? 'b2b_needs_info' 
              : 'b2b_pending';
          return {
            ...prev,
            role: newRole,
            businessProfile: updatedApp
          };
        });
      }
    }
  }, [b2bApplications, currentUser]);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setMode = (newMode: CustomerMode) => {
    setModeState(newMode);
    if (newMode === 'B2B') {
      showToast(
        'GR Enterprises • B2B Wholesale Mode',
        'Viewing enterprise products, wholesale pricing tiers, and case pack requirements.',
        'info'
      );
    } else {
      showToast(
        'GR Enterprises • D2C Retail Mode',
        'Viewing consumer retail storefront with direct checkout from Meerut hub.',
        'info'
      );
    }
  };

  const switchPersona = (roleKey: 'guest' | 'd2c_customer' | 'b2b_pending' | 'b2b_needs_info' | 'b2b_approved' | 'admin') => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ROLE, roleKey);
    if (roleKey === 'guest') {
      setCurrentUser(null);
      showToast('Switched Persona', 'Now browsing as Unregistered Guest', 'info');
      return;
    }

    const matched = users.find(u => u.role === roleKey) || INITIAL_USERS.find(u => u.role === roleKey);
    if (matched) {
      let updatedUser = { ...matched };
      if (matched.businessProfile) {
        const freshApp = b2bApplications.find(a => a.id === matched.businessProfile?.id) || matched.businessProfile;
        updatedUser.businessProfile = freshApp;
      }
      setCurrentUser(updatedUser);

      if (roleKey.startsWith('b2b')) {
        setModeState('B2B');
      } else if (roleKey === 'd2c_customer') {
        setModeState('D2C');
      }

      showToast(
        'Persona Switched',
        `Logged in as ${matched.name} (${roleKey.toUpperCase()})`,
        'success'
      );
    }
  };

  const updateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    showToast('Store Settings Saved', 'Updated GR Enterprises company information and GST parameters.', 'success');
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
    showToast('User Role Updated', `User permissions updated to ${newRole.toUpperCase()}`, 'success');
  };

  const registerGoogleRetailUser = async (profile: {
    credential?: string;
    name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    address?: Address;
  }): Promise<User | null> => {
    try {
      const backendUser = await apiGoogleSync({
        credential: profile.credential,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        phone: profile.phone,
        address: profile.address
      });

      if (!backendUser) {
        showToast('Google Sign-In Notice', 'Could not sync Google credentials to MongoDB database. Please try again.', 'error');
        return null;
      }

      setCurrentUser(backendUser);
      setModeState('D2C');
      setUsers(prev => [backendUser, ...prev.filter(u => u.email.toLowerCase() !== backendUser.email.toLowerCase())]);

      if (guestOrderIds.length > 0) {
        setOrders(prev => prev.map(o => {
          if (guestOrderIds.includes(o.id)) {
            return {
              ...o,
              customerId: backendUser.id,
              customerName: backendUser.name,
              customerEmail: backendUser.email,
              customerPhone: backendUser.phone || o.customerPhone,
              isGuest: false
            };
          }
          return o;
        }));
      }

      showToast(
        'Google Verified & Saved',
        `Welcome to GR Enterprises, ${backendUser.name}! Account saved directly in MongoDB database.`,
        'success'
      );

      return backendUser;
    } catch (err: any) {
      showToast('Google Sign-In Error', err.message || 'Failed to authenticate with Google.', 'error');
      return null;
    }
  };

  const registerRetailUser = async (profile: {
    name: string;
    email: string;
    phone?: string;
    address?: Address;
    password?: string;
  }): Promise<User | null> => {
    try {
      const backendUser = await apiRegisterRetail({
        name: profile.name,
        email: profile.email,
        password: profile.password,
        phone: profile.phone,
        address: profile.address
      });

      if (!backendUser) {
        showToast('Sign-Up Failed', 'Unable to create account in database. Please check your details or try signing in.', 'error');
        return null;
      }

      setCurrentUser(backendUser);
      setModeState('D2C');
      setUsers(prev => [backendUser, ...prev.filter(u => u.email.toLowerCase() !== backendUser.email.toLowerCase())]);

      if (guestOrderIds.length > 0) {
        setOrders(prev => prev.map(o => {
          if (guestOrderIds.includes(o.id)) {
            return {
              ...o,
              customerId: backendUser.id,
              customerName: backendUser.name,
              customerEmail: backendUser.email,
              customerPhone: backendUser.phone || o.customerPhone,
              isGuest: false
            };
          }
          return o;
        }));
      }

      showToast(
        'Account Registered in Database',
        `Welcome to GR Enterprises, ${backendUser.name}! Your account and delivery details are safely stored in MongoDB Atlas.`,
        'success'
      );

      return backendUser;
    } catch (err: any) {
      showToast('Registration Error', err.message || 'Failed to register account.', 'error');
      return null;
    }
  };

  const loginUser = async (email: string, password?: string): Promise<User | null> => {
    try {
      const backendUser = await apiLogin(email, password);
      if (!backendUser) {
        showToast('Login Failed', 'Invalid email or password. Please verify credentials or sign up.', 'error');
        return null;
      }

      setCurrentUser(backendUser);
      if (backendUser.role.startsWith('b2b')) {
        setModeState('B2B');
      } else {
        setModeState('D2C');
      }
      setUsers(prev => [backendUser, ...prev.filter(u => u.email.toLowerCase() !== backendUser.email.toLowerCase())]);

      showToast('Logged In Successfully', `Welcome back, ${backendUser.name}!`, 'success');
      return backendUser;
    } catch (err: any) {
      showToast('Login Error', err.message || 'Unable to log in.', 'error');
      return null;
    }
  };

  // Real Mobile OTP & WhatsApp Message Authenticator implementations
  const sendPhoneOtp = async (
    phone: string,
    channel: 'sms' | 'whatsapp' = 'sms',
    email?: string
  ): Promise<{ success: boolean; message: string; dispatched?: boolean; gatewayNotice?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return {
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number.'
      };
    }

    try {
      const res = await apiSendOtp(cleanPhone, channel, email);
      if (res && res.success) {
        return {
          success: true,
          message: res.message,
          dispatched: res.dispatched,
          gatewayNotice: res.gatewayNotice
        };
      }
      return {
        success: false,
        message: res?.message || 'Failed to send verification code from server.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error reaching authentication server.'
      };
    }
  };

  const completeLogin = (user: User) => {
    setCurrentUser(user);
    setModeState('D2C');
    setUsers(prev => [user, ...prev.filter(u => u.id !== user.id)]);

    // Link guest orders
    if (guestOrderIds.length > 0) {
      setOrders(prev => prev.map(o => {
        if (guestOrderIds.includes(o.id)) {
          return {
            ...o,
            customerId: user.id,
            customerName: user.name,
            customerEmail: user.email,
            customerPhone: user.phone || o.customerPhone,
            isGuest: false
          };
        }
        return o;
      }));
    }
  };

  const loginWithPhoneOtp = async (
    phone: string,
    otp: string,
    name?: string,
    email?: string,
    age?: number,
    gender?: string,
    address?: Address,
    autoSetCurrentUser: boolean = true
  ): Promise<User | null> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || !otp) return null;

    try {
      const backendUser = await apiVerifyOtp({
        phone: cleanPhone,
        otp,
        name,
        email,
        age,
        gender,
        address
      });

      if (!backendUser) {
        showToast('Verification Failed', 'Invalid or expired OTP code. Please enter the correct code sent to your phone.', 'error');
        return null;
      }

      if (autoSetCurrentUser) {
        completeLogin(backendUser);
        showToast(
          'Mobile Number Verified',
          `Welcome to GR Enterprises, ${backendUser.name}! Account verified and saved in MongoDB Atlas.`,
          'success'
        );
      }

      return backendUser;
    } catch (err: any) {
      showToast('Verification Error', err.message || 'OTP verification failed.', 'error');
      return null;
    }
  };

  const updateCustomerProfile = async (profileData: {
    userId: string;
    name: string;
    email: string;
    age?: number;
    gender?: string;
    address: Address;
    phone?: string;
  }): Promise<User | null> => {
    try {
      const updatedUser = await apiUpdateProfile(profileData);
      if (updatedUser) {
        completeLogin(updatedUser);
        showToast('Profile Details Saved', `Welcome, ${updatedUser.name}! Your details and delivery address are saved in MongoDB Atlas.`, 'success');
        return updatedUser;
      }
      return null;
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not save profile details.', 'error');
      return null;
    }
  };

  // Pricing helper for B2B tiers
  const getB2BUnitPrice = (product: Product, quantity: number): number => {
    if (!product.priceTiers || product.priceTiers.length === 0) {
      return product.wholesalePrice;
    }
    const sortedTiers = [...product.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    const matchedTier = sortedTiers.find(tier => quantity >= tier.minQuantity);
    return matchedTier ? matchedTier.pricePerUnit : product.wholesalePrice;
  };

  const addToCart = (product: Product, quantity: number, variant?: ProductVariant): boolean => {
    if (mode === 'B2B') {
      const isApproved = currentUser?.role === 'b2b_approved';
      if (!isApproved) {
        showToast(
          'Verification Required for Wholesale Ordering',
          'Wholesale cart and checkout are reserved for approved business accounts. Please submit an application or switch persona to test.',
          'warning'
        );
        setActiveModal('b2b_register');
        return false;
      }

      if (quantity < product.moq) {
        showToast(
          'Minimum Order Quantity Not Met',
          `The minimum order quantity for ${product.title} is ${product.moq} ${product.unit}s.`,
          'warning'
        );
        return false;
      }

      if (product.casePackSize > 1 && quantity % product.casePackSize !== 0) {
        showToast(
          'Case Pack Requirement',
          `${product.title} is packaged in case packs of ${product.casePackSize} units. Please adjust quantity to a multiple of ${product.casePackSize}.`,
          'warning'
        );
        return false;
      }
    }

    const unitPrice = mode === 'B2B' 
      ? getB2BUnitPrice(product, quantity) + (variant?.additionalPrice || 0)
      : product.retailPrice + (variant?.additionalPrice || 0);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.productId === product.id && 
        item.mode === mode && 
        item.selectedVariant?.id === variant?.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        const newUnitPrice = mode === 'B2B' 
          ? getB2BUnitPrice(product, newQty) + (variant?.additionalPrice || 0)
          : product.retailPrice + (variant?.additionalPrice || 0);

        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          unitPrice: newUnitPrice
        };
        return updated;
      } else {
        return [...prev, {
          productId: product.id,
          product,
          quantity,
          mode,
          selectedVariant: variant,
          unitPrice
        }];
      }
    });

    showToast(
      'Added to Cart',
      `Added ${quantity} ${product.unit}(s) of "${product.title}" to your ${mode} cart.`,
      'success'
    );
    setIsCartDrawerOpen(true);
    return true;
  };

  const updateCartQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.productId === productId && item.selectedVariant?.id === variantId) {
        const newUnitPrice = item.mode === 'B2B'
          ? getB2BUnitPrice(item.product, quantity) + (item.selectedVariant?.additionalPrice || 0)
          : item.product.retailPrice + (item.selectedVariant?.additionalPrice || 0);
        return {
          ...item,
          quantity,
          unitPrice: newUnitPrice
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.selectedVariant?.id === variantId)));
    showToast('Removed from Cart', 'Item removed from your cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'invoiceNumber' | 'date' | 'status'>): Order => {
    const timestamp = Date.now().toString().slice(-4);
    const randomDigit = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = orderData.mode === 'B2B' 
      ? `GRE-B2B-2026-${randomDigit}`
      : `GRE-D2C-2026-${randomDigit}`;
    const invoiceNumber = orderData.mode === 'B2B'
      ? `INV-2026-GRE-B2B-${randomDigit}`
      : `INV-2026-GRE-RET-${randomDigit}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${timestamp}`,
      orderNumber,
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed'
    };

    setOrders(prev => [newOrder, ...prev]);

    if (!currentUser || orderData.isGuest) {
      setGuestOrderIds(prev => [newOrder.id, ...prev]);
    }

    // Deduct stock from products
    setProducts(prev => prev.map(p => {
      const orderItem = newOrder.items.find(item => item.productId === p.id);
      if (orderItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - orderItem.quantity)
        };
      }
      return p;
    }));

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      status, 
      trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber 
    } : o));
    showToast('Order Status Updated', `Order ${orderId} marked as ${status}`, 'success');
  };

  // B2B Applications
  const submitB2BApplication = (appData: Omit<B2BApplicationDetails, 'id' | 'appliedDate' | 'status'>) => {
    const newApp: B2BApplicationDetails = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setB2bApplications(prev => [newApp, ...prev]);

    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        role: 'b2b_pending',
        businessProfile: newApp
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    }

    showToast(
      'Application Submitted to GR Enterprises',
      'Your B2B account application is now Pending verification by our Meerut compliance desk.',
      'success'
    );
  };

  const updateB2BApplicationByAdmin = (
    appId: string,
    status: B2BStatus,
    adminNotes?: string,
    creditLimit?: number,
    paymentTerms?: string
  ) => {
    setB2bApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status,
          adminNotes: adminNotes ?? app.adminNotes,
          creditLimit: creditLimit !== undefined ? creditLimit : app.creditLimit,
          paymentTerms: paymentTerms ?? app.paymentTerms,
          reviewedDate: new Date().toISOString().split('T')[0],
          reviewedBy: 'Admin (GR Enterprises Meerut)'
        };
      }
      return app;
    }));

    // Also update associated user role if approved
    setUsers(prev => prev.map(u => {
      if (u.businessProfile?.id === appId) {
        const newRole = status === 'approved' 
          ? 'b2b_approved' 
          : status === 'needs_more_info' 
            ? 'b2b_needs_info' 
            : 'b2b_pending';
        return { ...u, role: newRole };
      }
      return u;
    }));

    showToast(
      'B2B Application Updated',
      `Application ${appId} changed to "${status.toUpperCase()}".`,
      status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning'
    );
  };

  const updateB2BApplicationByCustomer = (appId: string, updatedFields: Partial<B2BApplicationDetails>) => {
    setB2bApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          ...updatedFields,
          status: 'pending',
          appliedDate: new Date().toISOString().split('T')[0]
        };
      }
      return app;
    }));

    showToast(
      'Application Re-submitted to GR Enterprises',
      'Your updated business details have been sent to our Meerut verification desk.',
      'success'
    );
  };

  // Quotes
  const submitRFQ = (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'date' | 'status'>) => {
    const quoteNumber = `RFQ-GRE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: Quote = {
      ...quoteData,
      id: `q-${Date.now()}`,
      quoteNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted'
    };

    setQuotes(prev => [newQuote, ...prev]);
    showToast(
      'RFQ Submitted Successfully',
      `Quote request ${quoteNumber} submitted to GR Enterprises sales desk.`,
      'success'
    );
  };

  const updateQuoteStatus = (quoteId: string, status: QuoteStatus, offeredPrice?: number, adminNote?: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return {
          ...q,
          status,
          offeredPricePerUnit: offeredPrice !== undefined ? offeredPrice : q.offeredPricePerUnit,
          adminResponseNote: adminNote !== undefined ? adminNote : q.adminResponseNote
        };
      }
      return q;
    }));

    showToast('Quote Updated', `Quote ${quoteId} updated to ${status}.`, 'info');
  };

  // Products
  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast('Product Updated', `Saved changes for ${updated.title}`, 'success');
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const prod: Product = {
      ...newProd,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [prod, ...prev]);
    showToast('Product Created', `Added ${prod.title} to GR Enterprises catalog.`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product Removed', 'Product has been deleted from catalog.', 'info');
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.MODE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ORDERS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.QUOTES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USERS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CART);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.GUEST_ORDERS);

    sessionStorage.removeItem('gre_experience_chosen');

    setModeState('D2C');
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    setCurrentUser(null);
    setIsExperienceGateOpen(true);
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setQuotes(INITIAL_QUOTES);
    setB2bApplications(INITIAL_B2B_APPLICATIONS);
    setCart([]);
    setGuestOrderIds([]);
    showToast('Reset Complete', 'GR Enterprises Meerut database reset to fresh visitor state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        currentUser,
        switchPersona,
        storeSettings,
        updateStoreSettings,
        products,
        orders,
        quotes,
        b2bApplications,
        users,
        updateUserRole,
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        submitB2BApplication,
        updateB2BApplicationByAdmin,
        updateB2BApplicationByCustomer,
        submitRFQ,
        updateQuoteStatus,
        updateProduct,
        addProduct,
        deleteProduct,
        activeModal,
        setActiveModal,
        selectedProductId,
        setSelectedProductId,
        selectedInvoiceOrder,
        setSelectedInvoiceOrder,
        selectedQuoteProduct,
        setSelectedQuoteProduct,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        toasts,
        showToast,
        dismissToast,
        resetAllData,
        getB2BUnitPrice,
        guestOrderIds,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        registerGoogleRetailUser,
        registerRetailUser,
        loginUser,
        sendPhoneOtp,
        loginWithPhoneOtp,
        completeLogin,
        updateCustomerProfile,
        isGoogleAuthModalOpen,
        setIsGoogleAuthModalOpen,
        isExperienceGateOpen,
        setIsExperienceGateOpen,
        openExperienceGate,
        selectExperience,
        dbStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
