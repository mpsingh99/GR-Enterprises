import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Building2,
  User,
  Search,
  ShoppingCart,
  Menu,
  X,
  FileText,
  Clock,
  Shield,
  Layers,
  ChevronDown,
  LogOut,
  Sparkles,
  ClipboardList,
  Sliders
} from 'lucide-react';

interface NavbarProps {
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  onOpenQuickOrder: () => void;
  onOpenQuotes: () => void;
  onOpenB2BStatus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOrders,
  onOpenAdmin,
  onOpenQuickOrder,
  onOpenQuotes,
  onOpenB2BStatus
}) => {
  const {
    mode,
    setMode,
    currentUser,
    cartCount,
    storeSettings,
    setIsCartDrawerOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setActiveModal,
    switchPersona,
    openAuthModal,
    openExperienceGate
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const categories = ['All', 'Electronics', 'Office & Workspaces', 'Packaging & Shipping', 'Commercial Supplies'];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm transition-colors duration-200">
      {/* Top Banner for B2B status alerts - Only in B2B mode */}
      {mode === 'B2B' && currentUser?.role === 'b2b_pending' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Your B2B application is under review by GR Enterprises (Meerut Desk). Wholesale rates will unlock once approved.</span>
          <button
            onClick={onOpenB2BStatus}
            className="underline font-semibold hover:text-black ml-1 cursor-pointer"
          >
            Check Application Status →
          </button>
        </div>
      )}

      {mode === 'B2B' && currentUser?.role === 'b2b_needs_info' && (
        <div className="bg-rose-600 text-white px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2">
          <span>⚠️ Action required: Additional information is needed to approve your GR Enterprises business account.</span>
          <button
            onClick={onOpenB2BStatus}
            className="bg-white text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold hover:bg-slate-100 ml-1 cursor-pointer"
          >
            Review & Resubmit
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          
          {/* Logo & Storefront Tag: GR Enterprises (Meerut) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-lg text-white shadow-md transition-colors shrink-0 ${
                mode === 'B2B' ? 'bg-gradient-to-br from-blue-700 to-indigo-950' : 'bg-gradient-to-br from-emerald-600 to-teal-800'
              }`}>
                GR
              </div>
              <div>
                <span className="font-black text-sm sm:text-lg tracking-tight text-slate-950 block leading-tight">
                  GR <span className={mode === 'B2B' ? 'text-blue-700' : 'text-emerald-700'}>Enterprises</span>
                </span>
                <span className="block text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-500 truncate max-w-[110px] sm:max-w-none">
                  {mode === 'B2B' ? 'Wholesale' : 'Retail'} • Meerut Hub
                </span>
              </div>
            </div>
          </div>

          {/* Active Mode Indicator - Pure separation without dual options */}
          <div className="hidden md:flex items-center gap-2">
            {mode === 'D2C' ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/90 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Retail Direct Storefront</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-blue-950 text-blue-100 border border-blue-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>B2B Wholesale Portal</span>
              </div>
            )}
            <button
              onClick={openExperienceGate}
              title="Switch between Retail and Wholesale experience"
              className="text-[11px] text-slate-400 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition"
            >
              Change Store
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-sm items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={mode === 'B2B' ? "Search SKU, bulk supplies in Meerut..." : "Search items, tech, office gear..."}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* 1 All-in-One Admin Control Panel Button - Always prominent! */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs border border-amber-500 transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Open the unified GR Enterprises Admin Command Center"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
              <span>Admin</span>
              <span className="hidden sm:inline text-[9px] bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full uppercase font-bold">
                Control
              </span>
            </button>

            {/* Mode-specific quick actions */}
            {mode === 'B2B' ? (
              <>
                <button
                  onClick={onOpenQuickOrder}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-300 transition"
                  title="Quickly add multiple items by SKU and bulk quantities"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden xl:inline">Quick Order Pad</span>
                  <span className="xl:hidden">Bulk</span>
                </button>

                {currentUser?.role === 'b2b_approved' && (
                  <button
                    onClick={onOpenQuotes}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-900 px-2.5 py-1.5 rounded-lg border border-blue-200 transition"
                    title="View Request For Quote (RFQ) history and status"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-blue-700" />
                    <span>My Quotes</span>
                  </button>
                )}
              </>
            ) : null}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold">
                {cartCount > 0 ? `${cartCount} items` : 'Cart'}
              </span>
            </button>

            {/* Customer Sign In & Sign Up buttons for Visitors */}
            {!currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-2 sm:px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 text-xs font-semibold transition shrink-0"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    if (mode === 'B2B') {
                      setActiveModal('b2b_register');
                    } else {
                      openAuthModal('signup');
                    }
                  }}
                  className={`hidden sm:inline-flex px-3 sm:px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition shadow-xs items-center gap-1.5 shrink-0 ${
                    mode === 'B2B' ? 'bg-blue-900 hover:bg-blue-800' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {mode === 'B2B' ? (
                    <>
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Register Business</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span>Sign Up (Simple)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* User Account / Profile Dropdown for Logged In Customers */
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition"
                  aria-expanded={userDropdownOpen}
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {currentUser.name[0]}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold leading-tight text-slate-900 truncate max-w-[110px]">
                        {currentUser.name.split(' ')[0]}
                      </p>
                      {currentUser.authProvider === 'google' && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" title="Google Authenticated" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {/* Dropdown Menu when Logged In */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      {currentUser.authProvider === 'google' && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <svg viewBox="0 0 24 24" className="w-3 h-3">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Google Account</span>
                          </span>
                          {currentUser.phone && (
                            <span className="text-[10px] text-slate-500 font-mono font-medium">
                              {currentUser.phone}
                            </span>
                          )}
                        </div>
                      )}
                      {currentUser.savedAddresses?.[0] && (
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                          📍 {currentUser.savedAddresses[0].street}, {currentUser.savedAddresses[0].city}
                        </p>
                      )}
                      {currentUser.businessProfile && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentUser.businessProfile.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : currentUser.businessProfile.status === 'needs_more_info'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          GST: {currentUser.businessProfile.gstin} ({currentUser.businessProfile.status.toUpperCase()})
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={onOpenAdmin}
                        className="w-full text-left px-4 py-2 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-amber-700" />
                        <span>Open Admin Control Center</span>
                      </button>

                      <button
                        onClick={onOpenOrders}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Order History & Invoices</span>
                      </button>

                      {mode === 'B2B' && currentUser.role.startsWith('b2b') && (
                        <button
                          onClick={onOpenB2BStatus}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>GR Enterprises B2B KYC Status</span>
                        </button>
                      )}

                      {mode === 'B2B' && (currentUser.role === 'd2c_customer' || currentUser.role === 'guest') && (
                        <button
                          onClick={() => setActiveModal('b2b_register')}
                          className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          <span>Register Business for Wholesale</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => switchPersona('guest')}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out (Browse as Guest)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Sub-bar: Active Mode Indicator */}
        <div className="md:hidden py-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border flex-1 ${
            mode === 'D2C' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-950 text-blue-100 border-blue-900'
          }`}>
            {mode === 'D2C' ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Retail Direct Storefront</span>
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>B2B Wholesale Portal</span>
              </>
            )}
          </div>
          <button
            onClick={openExperienceGate}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white shadow-2xs shrink-0 active:scale-95"
          >
            Change Store
          </button>
        </div>

        {/* Mobile Search Bar - Always accessible on smartphones */}
        <div className="md:hidden pb-2 pt-0.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={mode === 'B2B' ? "Search SKU, bulk supplies in Meerut..." : "Search items, tech, office gear..."}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile Drawer when toggled */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-100 bg-slate-50/95 rounded-2xl mb-2 space-y-2.5 animate-in fade-in duration-150">
            {/* User status or Sign In / Sign Up */}
            {!currentUser ? (
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-900">Welcome to GR Enterprises</div>
                <p className="text-[11px] text-slate-500">Sign in or create an account for fast checkout with delivery address and order tracking.</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('signin');
                    }}
                    className="py-2 text-center text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (mode === 'B2B') {
                        setActiveModal('b2b_register');
                      } else {
                        openAuthModal('signup');
                      }
                    }}
                    className={`py-2 text-center text-xs font-bold text-white rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 ${
                      mode === 'B2B' ? 'bg-blue-900 hover:bg-blue-800' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {mode === 'B2B' ? (
                      <>
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Register Business</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span>Sign Up</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2.5">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {currentUser.name[0]}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    {currentUser.phone && (
                      <p className="text-[10px] text-slate-600 font-medium">+91 {currentUser.phone}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    switchPersona('guest');
                  }}
                  className="w-full py-1.5 text-center text-xs text-rose-600 hover:bg-rose-50 font-medium rounded-lg transition border border-rose-100"
                >
                  Sign Out (Browse as Guest)
                </button>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="p-2.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl text-amber-950 font-bold flex items-center gap-2 transition"
              >
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Admin Panel</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOrders();
                }}
                className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-800 font-semibold flex items-center gap-2 transition"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Order History</span>
              </button>
            </div>

            {/* Wholesale registration link - strictly in B2B mode only */}
            {mode === 'B2B' && (currentUser?.role === 'd2c_customer' || !currentUser || currentUser?.role === 'guest') && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('b2b_register');
                }}
                className="w-full p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Register Business for Wholesale GSTIN Pricing</span>
              </button>
            )}

            {/* Switch Storefront Experience trigger */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openExperienceGate();
              }}
              className="w-full py-2 text-center text-xs text-slate-600 hover:text-slate-900 font-semibold border-t border-slate-200/80 pt-2 transition flex items-center justify-center gap-1.5"
            >
              <span>Change Store Mode (Retail / B2B)</span>
            </button>
          </div>
        )}

        {/* Categories Bar */}
        <div className="py-2 overflow-x-auto flex items-center gap-1.5 sm:gap-2 border-t border-slate-100 scrollbar-none text-xs touch-pan-x">
          <span className="text-slate-400 font-medium whitespace-nowrap pl-1 shrink-0 text-[11px] sm:text-xs">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 active:scale-95 ${
                selectedCategory === cat
                  ? mode === 'B2B'
                    ? 'bg-blue-900 text-white font-bold shadow-xs'
                    : 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
