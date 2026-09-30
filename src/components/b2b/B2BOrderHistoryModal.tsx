import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import {
  X,
  FileText,
  Package,
  Building2,
  Search,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Clock,
  Truck
} from 'lucide-react';

interface B2BOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const B2BOrderHistoryModal: React.FC<B2BOrderHistoryModalProps> = ({ isOpen, onClose, onViewInvoice }) => {
  const { orders, currentUser, guestOrderIds } = useApp();

  // Guest order lookup state
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookupContact, setLookupContact] = useState('');
  const [lookupResult, setLookupResult] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState('');

  if (!isOpen) return null;

  const isGuest = !currentUser;
  const isAdmin = currentUser?.role === 'admin';

  // Session orders placed during current browsing
  const sessionGuestOrders = isGuest 
    ? orders.filter(o => guestOrderIds.includes(o.id))
    : [];

  // Filtered orders for logged in users
  const userOrders = !isGuest
    ? orders.filter(order => {
        if (isAdmin) return true;
        const isOwner = order.customerId === currentUser.id || 
          order.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
        return isOwner;
      })
    : [];

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    const term = lookupOrderNumber.trim().toUpperCase();
    const contact = lookupContact.trim().toLowerCase();

    if (!term) {
      setLookupError('Please enter a Purchase Order or Invoice Reference Number.');
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
      setLookupError(`No commercial order found matching "${term}". Please verify the PO/Invoice number.`);
    }
  };

  const renderOrderCard = (order: Order) => (
    <div
      key={order.id}
      className="rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition overflow-hidden shadow-xs"
    >
      {/* Order header row */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-blue-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl text-white text-xs font-bold bg-blue-900">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                order.status === 'Delivered' 
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'Dispatched'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Booked on {order.date} • Invoice: <span className="font-mono font-semibold text-blue-700">{order.invoiceNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewInvoice(order)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold transition shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Commercial Details */}
      <div className="p-4 space-y-3">
        {order.businessDetails && (
          <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 font-medium">Billed To: </span>
              <strong className="text-slate-900">{order.businessDetails.businessName}</strong>
            </div>
            <div className="font-mono text-slate-600">
              GSTIN: <strong>{order.businessDetails.gstin}</strong>
            </div>
          </div>
        )}

        {/* Line Items Preview */}
        <div className="space-y-1.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="font-medium text-slate-800">{item.productTitle}</span>
                <span className="text-slate-400 font-mono text-[10px]">({item.quantity} {item.unit}s @ {formatCurrency(item.unitPrice)})</span>
              </div>
              <span className="font-mono font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        {/* Footer Total */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Payment: <strong className="text-slate-700">{order.paymentMethod}</strong> ({order.paymentStatus})
          </div>
          <div className="text-right">
            <span className="text-slate-500 mr-2">Total (incl. GST):</span>
            <span className="font-mono font-black text-sm text-slate-900">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Commercial Audit Trail
              </span>
              <h2 className="text-base sm:text-xl font-bold text-white">Wholesale Purchase Orders & Invoices</h2>
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
          
          {/* Quick PO / Invoice Lookup Tool */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Track Wholesale Purchase Order or Invoice</span>
            </h3>
            <form onSubmit={handleLookupSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={lookupOrderNumber}
                  onChange={(e) => setLookupOrderNumber(e.target.value)}
                  placeholder="PO or Invoice No. (e.g. GRE-B2B-2026-1049)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase font-mono"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={lookupContact}
                  onChange={(e) => setLookupContact(e.target.value)}
                  placeholder="Contact Email or Phone (Optional)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Locate PO Records
                </button>
              </div>
            </form>

            {lookupError && (
              <p className="text-xs text-rose-600 font-medium mt-2">{lookupError}</p>
            )}

            {lookupResult && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-bold text-emerald-800 mb-2">✅ Order Match Found:</p>
                {renderOrderCard(lookupResult)}
              </div>
            )}
          </div>

          {/* User's Order List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                {isAdmin ? 'All Commercial Orders (Admin View)' : 'Your Company Purchase Orders'}
              </h3>
              <span className="text-xs text-slate-500">
                Showing {userOrders.length + sessionGuestOrders.length} records
              </span>
            </div>

            {userOrders.length === 0 && sessionGuestOrders.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No wholesale orders found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Orders placed through your company account will appear here with downloadable GST tax invoices.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionGuestOrders.map(renderOrderCard)}
                {userOrders.map(renderOrderCard)}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
