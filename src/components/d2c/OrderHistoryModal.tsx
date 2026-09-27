import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import {
  X,
  FileText,
  Package,
  Building2,
  ShoppingBag,
  UserX,
  Search,
  LogIn,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose, onViewInvoice }) => {
  const { orders, currentUser, switchPersona, guestOrderIds, setIsGoogleAuthModalOpen, mode } = useApp();
  const [filterMode, setFilterMode] = useState<'All' | 'D2C' | 'B2B'>('All');

  // Guest order lookup state
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookupContact, setLookupContact] = useState('');
  const [lookupResult, setLookupResult] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState('');

  if (!isOpen) return null;

  const isGuest = !currentUser;
  const isAdmin = currentUser?.role === 'admin';

  // Session guest orders placed during current browsing
  const sessionGuestOrders = isGuest 
    ? orders.filter(o => guestOrderIds.includes(o.id))
    : [];

  // Filtered orders for logged in users
  const userOrders = !isGuest
    ? orders.filter(order => {
        if (isAdmin) {
          return filterMode === 'All' ? true : order.mode === filterMode;
        }
        const isOwner = order.customerId === currentUser.id || 
          order.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
        const modeMatches = order.mode === mode;
        return isOwner && modeMatches;
      })
    : [];

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    const term = lookupOrderNumber.trim().toUpperCase();
    const contact = lookupContact.trim().toLowerCase();

    if (!term) {
      setLookupError('Please enter an Order Reference Number.');
      return;
    }

    const matched = orders.find(o => {
      const numberMatches = o.orderNumber.toUpperCase() === term || o.invoiceNumber.toUpperCase() === term;
      if (!contact) return numberMatches;
      const contactMatches = o.customerEmail.toLowerCase().includes(contact) || 
        o.customerPhone.replace(/\D/g, '').includes(contact.replace(/\D/g, ''));
      return numberMatches && contactMatches;
    });

    if (matched) {
      setLookupResult(matched);
    } else {
      setLookupError(`No order found matching "${term}". Please verify the order number and email/phone.`);
    }
  };

  const renderOrderCard = (order: Order) => {
    const isB2B = order.mode === 'B2B';
    return (
      <div
        key={order.id}
        className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition overflow-hidden shadow-xs"
      >
        {/* Order header row */}
        <div className={`p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 ${
          isB2B ? 'bg-blue-50/50' : 'bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl text-white text-xs font-bold ${
              isB2B ? 'bg-blue-900' : 'bg-emerald-600'
            }`}>
              {isB2B ? <Building2 className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isB2B ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {order.mode}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Placed on {order.date} • {order.customerName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              order.status === 'Delivered'
                ? 'bg-emerald-100 text-emerald-800'
                : order.status === 'Dispatched'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
            }`}>
              {order.status}
            </span>

            <button
              onClick={() => onViewInvoice(order)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Tax Invoice</span>
            </button>
          </div>
        </div>

        {/* Order item details */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                    {item.quantity}×
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{item.productTitle}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SKU: {item.sku} • HSN: {item.hsnCode} {item.variantName ? `(${item.variantName})` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</span>
                  <span className="text-[10px] text-slate-400 block">
                    @{formatCurrency(item.unitPrice)}/{item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Meta info & total */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 space-y-0.5">
              <p>
                <strong>Ship to:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              {order.businessDetails?.gstin && (
                <p className="text-blue-700 font-medium">
                  GSTIN: <strong>{order.businessDetails.gstin}</strong> ({order.businessDetails.businessName})
                </p>
              )}
              <p>Payment: {order.paymentMethod} ({order.paymentStatus})</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total (Tax Incl.):</span>
              <span className="text-base font-extrabold text-slate-950">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Order History & Tax Invoices
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isGuest 
                ? 'Guest Portal • Sign in or track a specific order by order reference' 
                : isAdmin 
                  ? 'Administrator Access • Viewing orders across all customer accounts'
                  : `Signed in as ${currentUser.name} (${currentUser.email})`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN USER VIEW */}
        {!isGuest && (
          <>
            {/* Filter Bar */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3 text-xs shrink-0">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Filter View:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(['All', 'D2C', 'B2B'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setFilterMode(tab)}
                        className={`px-3 py-1 rounded-md font-semibold transition ${
                          filterMode === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab === 'All' ? 'All Orders' : tab === 'D2C' ? 'Retail (D2C)' : 'Wholesale (B2B)'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {mode === 'B2B' ? 'Wholesale Commercial Orders' : 'Retail Orders & Invoices'}
                  </span>
                </div>
              )}

              <span className="text-slate-500">
                Showing <strong>{userOrders.length}</strong> orders for this account
              </span>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
              {userOrders.length === 0 ? (
                <div className="py-14 text-center text-slate-400 space-y-3">
                  <Package className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No orders found for your account</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    There are no orders placed under {currentUser.email} in this view.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Start Browsing Catalog
                  </button>
                </div>
              ) : (
                userOrders.map(order => renderOrderCard(order))
              )}
            </div>
          </>
        )}

        {/* GUEST VIEW (NOT LOGGED IN) */}
        {isGuest && (
          <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-6">
            
            {/* Notice Banner */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
              <UserX className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-amber-950">You are currently browsing as a Guest</h3>
                <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                  Saved account order history is private and tied to registered customers. To protect customer confidentiality, orders are only visible when authenticated into that account.
                </p>
              </div>
            </div>

            {/* Google Sign In Callout - strictly for Retail shoppers */}
            {mode === 'D2C' && (
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
                    <h4 className="text-xs font-bold text-blue-950">Have a Google Account?</h4>
                    <p className="text-[11px] text-blue-800">
                      Sign in with Google to view your retail order history and auto-sync your delivery address.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleAuthModalOpen(true)}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}

            {/* Quick Sign-In Option - Filtered strictly by mode */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Sign in with a registered {mode === 'B2B' ? 'business' : 'retail'} account
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select a customer account to view their dedicated orders and tax invoices:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {mode === 'D2C' && (
                  <button
                    onClick={() => switchPersona('d2c_customer')}
                    className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-900">Priya Sharma</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">Retail Shopper</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">priya.sharma@example.com</span>
                    </div>
                    <LogIn className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                  </button>
                )}

                {mode === 'B2B' && (
                  <button
                    onClick={() => switchPersona('b2b_approved')}
                    className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-xs text-slate-900">Acme Logistics Corp</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 rounded">B2B Wholesale</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">rajesh@acmelogistics.in (GST Verified)</span>
                    </div>
                    <LogIn className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                  </button>
                )}
              </div>
            </div>

            {/* Track Specific Guest Order by Reference # */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>Look up a specific guest order</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed an order as a guest? Enter your Order Reference # (e.g. <strong>{mode === 'B2B' ? 'GRE-B2B-2026-0891' : 'GRE-D2C-2026-4432'}</strong>):
                </p>
              </div>

              <form onSubmit={handleLookupSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Order Reference Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GRE-D2C-2026-4432"
                      value={lookupOrderNumber}
                      onChange={(e) => setLookupOrderNumber(e.target.value)}
                      className="w-full text-xs font-mono font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Email or Phone (Verification)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. priya.sharma@example.com"
                      value={lookupContact}
                      onChange={(e) => setLookupContact(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                {lookupError && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{lookupError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Locate Order & Invoice</span>
                </button>
              </form>

              {/* Lookup match result card */}
              {lookupResult && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Found Order Matching "{lookupResult.orderNumber}":</span>
                  </div>
                  {renderOrderCard(lookupResult)}
                </div>
              )}
            </div>

            {/* Session guest orders (if guest just placed an order right now) */}
            {sessionGuestOrders.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your Current Session Orders ({sessionGuestOrders.length})</span>
                </div>
                {sessionGuestOrders.map(o => renderOrderCard(o))}
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Official Tax Invoices issued under Section 31 of CGST Act • Meerut Hub
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
