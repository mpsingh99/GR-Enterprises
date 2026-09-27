import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quote } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import {
  X,
  MessageSquareQuote,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  UserX,
  LogIn,
  Search,
  AlertCircle
} from 'lucide-react';

interface B2BQuotesListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const B2BQuotesListModal: React.FC<B2BQuotesListModalProps> = ({ isOpen, onClose }) => {
  const { quotes, currentUser, switchPersona } = useApp();

  // Guest lookup state
  const [lookupRfqNumber, setLookupRfqNumber] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<Quote | null>(null);
  const [lookupError, setLookupError] = useState('');

  if (!isOpen) return null;

  const isGuest = !currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const userQuotes = !isGuest
    ? quotes.filter(q => {
        if (isAdmin) return true;
        return q.businessId === currentUser.id || q.contactEmail.toLowerCase() === currentUser.email.toLowerCase();
      })
    : [];

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    const term = lookupRfqNumber.trim().toUpperCase();
    const contact = lookupEmail.trim().toLowerCase();

    if (!term) {
      setLookupError('Please enter an RFQ Reference Number (e.g. RFQ-GRE-2026-0045).');
      return;
    }

    const matched = quotes.find(q => {
      const numberMatches = q.quoteNumber.toUpperCase() === term;
      if (!contact) return numberMatches;
      return numberMatches && q.contactEmail.toLowerCase().includes(contact);
    });

    if (matched) {
      setLookupResult(matched);
    } else {
      setLookupError(`No quote matching "${term}" ${contact ? `and email "${contact}"` : ''} was found in the GR Enterprises records.`);
    }
  };

  const renderQuoteCard = (quote: Quote) => (
    <div
      key={quote.id}
      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-slate-900">{quote.quoteNumber}</span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            quote.status === 'Quoted' || quote.status === 'Accepted'
              ? 'bg-emerald-100 text-emerald-900'
              : 'bg-purple-100 text-purple-900'
          }`}>
            {quote.status}
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
            {quote.businessName}
          </span>
        </div>
        <span className="text-xs text-slate-500">Submitted on {quote.date}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Product Title</span>
          <span className="font-semibold text-slate-900 block truncate">{quote.productTitle}</span>
          <span className="text-[10px] text-slate-500 font-mono">SKU: {quote.sku}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Requested Volume</span>
          <span className="font-bold text-slate-900 text-sm">{quote.requestedQuantity} units</span>
          {quote.targetPricePerUnit && (
            <span className="text-[10px] text-slate-500 block">Target: {formatCurrency(quote.targetPricePerUnit)}/unit</span>
          )}
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Offered Wholesale Rate</span>
          <span className="font-extrabold text-blue-900 text-sm">
            {quote.offeredPricePerUnit ? formatCurrency(quote.offeredPricePerUnit) : 'Under Review'}
          </span>
          {quote.validUntil && (
            <span className="text-[10px] text-emerald-700 block font-medium">Valid until: {quote.validUntil}</span>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <p><strong>Applicant Notes:</strong> "{quote.notes}"</p>
        {quote.adminResponseNote && (
          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
            <strong>GR Enterprises Sales Manager Offer Note:</strong> "{quote.adminResponseNote}"
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Enterprise Quote Requests (RFQ)
              </h2>
              <p className="text-xs text-purple-200">
                {isGuest 
                  ? 'Guest Portal • Sign in or track a specific quote by reference number'
                  : isAdmin
                    ? 'Administrator Access • Viewing RFQ proposals across all accounts'
                    : `Track custom volume proposals for ${currentUser.name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN USER VIEW */}
        {!isGuest && (
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
            {userQuotes.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <MessageSquareQuote className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No quote requests found for your account</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You can request custom enterprise quotes on bulk-eligible products from the wholesale catalog.
                </p>
              </div>
            ) : (
              userQuotes.map(quote => renderQuoteCard(quote))
            )}
          </div>
        )}

        {/* GUEST VIEW (NOT LOGGED IN) */}
        {isGuest && (
          <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-6">
            
            {/* Privacy Alert */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
              <UserX className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-amber-950">You are browsing as a Guest</h3>
                <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                  Enterprise wholesale quotes and negotiated pricing terms are confidential commercial records. To protect business privacy, quotation proposals are only accessible when authenticated or via RFQ reference verification.
                </p>
              </div>
            </div>

            {/* Quick Sign-In Option */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Sign in with an authorized enterprise account
                </h4>
                <p className="text-xs text-slate-500">
                  Switch to a registered B2B account to view active proposals:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => switchPersona('b2b_approved')}
                  className="p-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-xs text-slate-900">Rajesh Gupta</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 rounded">Acme Corp</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">rajesh@acmelogistics.in (2 active RFQs)</span>
                  </div>
                  <LogIn className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
                </button>

                <button
                  onClick={() => switchPersona('admin')}
                  className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-bold text-xs text-slate-900">Gaurav Rawat (Store Owner)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">admin@grenterprises.in • Meerut HQ</span>
                  </div>
                  <LogIn className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
                </button>
              </div>
            </div>

            {/* Guest RFQ Lookup Form */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-purple-600" />
                  <span>Look up your RFQ by Reference Number</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your RFQ reference number and registered contact email to look up your quotation.
                </p>
              </div>

              <form onSubmit={handleLookupSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      RFQ Reference Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RFQ-GRE-2026-0045"
                      value={lookupRfqNumber}
                      onChange={e => setLookupRfqNumber(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Registered Contact Email (Optional verification)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@acmelogistics.in"
                      value={lookupEmail}
                      onChange={e => setLookupEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Try sample RFQ: <button type="button" onClick={() => { setLookupRfqNumber('RFQ-GRE-2026-0045'); setLookupEmail('rajesh@acmelogistics.in'); }} className="text-purple-600 underline font-mono">RFQ-GRE-2026-0045</button>
                  </span>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Quote</span>
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupResult && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Quotation Record Verified:</span>
                  </div>
                  {renderQuoteCard(lookupResult)}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
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
