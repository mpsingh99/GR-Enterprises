import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/gstValidation';
import { B2BApplicationDetails } from '../../types';
import {
  X,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle,
  UserX,
  LogIn,
  Search,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface B2BApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const B2BApplicationStatusModal: React.FC<B2BApplicationStatusModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    b2bApplications, 
    updateB2BApplicationByCustomer, 
    showToast, 
    setMode, 
    switchPersona, 
    setActiveModal 
  } = useApp();

  // Guest lookup state
  const [lookupTerm, setLookupTerm] = useState('');
  const [lookupResult, setLookupResult] = useState<B2BApplicationDetails | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Needs more info resolution state
  const [updatedNotes, setUpdatedNotes] = useState('');
  const [reuploadedDoc, setReuploadedDoc] = useState('');

  if (!isOpen) return null;

  const isGuest = !currentUser;

  // Find user's application if logged in
  const loggedInApp = !isGuest 
    ? (currentUser.businessProfile || b2bApplications.find(a => 
        a.userId === currentUser.id || 
        (currentUser.email && a.contactEmail.toLowerCase() === currentUser.email.toLowerCase())
      ))
    : null;

  // Handle guest application lookup
  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    const term = lookupTerm.trim().toLowerCase();
    if (!term) {
      setLookupError('Please enter an Application ID, GSTIN, or registered email address.');
      return;
    }

    const matched = b2bApplications.find(a => 
      a.id.toLowerCase() === term ||
      a.gstin.toLowerCase() === term ||
      a.contactEmail.toLowerCase() === term ||
      a.businessName.toLowerCase().includes(term)
    );

    if (matched) {
      setLookupResult(matched);
    } else {
      setLookupError(`No B2B application matching "${lookupTerm}" was found in GR Enterprises records.`);
    }
  };

  const handleResubmit = (targetAppId: string, currentResaleDoc?: string) => {
    if (!reuploadedDoc && !updatedNotes) {
      showToast('Input Required', 'Please attach a document or enter clarification notes to resubmit.', 'warning');
      return;
    }

    updateB2BApplicationByCustomer(targetAppId, {
      adminNotes: `[Applicant Response]: ${updatedNotes} (Attached: ${reuploadedDoc || 'Same doc'})`,
      resaleCertFileName: reuploadedDoc || currentResaleDoc
    });

    setUpdatedNotes('');
    setReuploadedDoc('');
    showToast('Application Resubmitted', 'Your clarification has been submitted to GR Enterprises Meerut compliance team.', 'success');
  };

  const renderApplicationCard = (app: B2BApplicationDetails) => (
    <div className="space-y-6">
      {/* Status Banner Card */}
      {app.status === 'approved' && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-emerald-900">Application Approved</h3>
              <span className="text-xs bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full uppercase">
                Wholesale Active
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Congratulations! Your business credentials have been fully verified. You have full access to wholesale tier pricing, minimum order quantity rules, bulk quick-order pad, and corporate credit terms.
            </p>
            {app.creditLimit && (
              <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-emerald-700 block text-[11px]">Approved Credit Limit:</span>
                  <span className="font-extrabold text-emerald-950">{formatCurrency(app.creditLimit)}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[11px]">Payment Terms:</span>
                  <span className="font-bold text-emerald-950">{app.paymentTerms || 'Net 30'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {app.status === 'pending' && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-amber-950">Application Under Verification</h3>
              <span className="text-xs bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-full uppercase">
                Pending Review
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
              Your application was submitted on <strong>{app.appliedDate}</strong>. Our business compliance team in Meerut is currently cross-referencing your GSTIN (<strong>{app.gstin}</strong>) and principal place of business.
            </p>
            <div className="mt-3 p-3 bg-amber-100/60 rounded-xl text-xs text-amber-950 font-medium">
              🔒 <strong>Current Access Level:</strong> You may browse wholesale products and explore the catalog, but wholesale checkout and approved-tier prices remain locked until approval is finalized.
            </div>
          </div>
        </div>
      )}

      {app.status === 'needs_more_info' && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-rose-950">Additional Information Required</h3>
              <span className="text-xs bg-rose-200 text-rose-950 font-bold px-2.5 py-0.5 rounded-full uppercase">
                Needs More Info
              </span>
            </div>
            <p className="text-xs text-rose-900 mt-1">
              Our compliance officer reviewed your application and requested the following clarification:
            </p>
            {/* Admin Note Quote */}
            <div className="mt-2.5 p-3 rounded-xl bg-white border border-rose-200 text-xs font-medium text-slate-800 italic">
              "{app.adminNotes || 'Please upload an authorized GST certificate showing the registered business location.'}"
            </div>
          </div>
        </div>
      )}

      {/* Resubmit form if status is 'needs_more_info' */}
      {app.status === 'needs_more_info' && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Submit Requested Documentation or Clarification</span>
          </h4>

          <form onSubmit={(e) => { e.preventDefault(); handleResubmit(app.id, app.resaleCertFileName); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clarification / Response Note *
              </label>
              <textarea
                rows={3}
                required
                value={updatedNotes}
                onChange={(e) => setUpdatedNotes(e.target.value)}
                placeholder="Describe the updated details or confirm address match..."
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Re-upload Document (GST Certificate / License)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const docName = `Updated_GST_Certificate_${Date.now().toString().slice(-4)}.pdf`;
                    setReuploadedDoc(docName);
                    showToast('File Attached', 'Updated GST PDF attached.', 'success');
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{reuploadedDoc ? 'Replace Document' : 'Attach Updated File'}</span>
                </button>
                {reuploadedDoc && (
                  <span className="text-xs font-mono text-emerald-700 font-semibold">{reuploadedDoc}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resubmit Application for Approval</span>
            </button>
          </form>
        </div>
      )}

      {/* Application Details Summary */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Submitted Business Profile
        </h4>
        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white">
            <div className="p-4 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Legal Entity Name</span>
                <span className="font-bold text-slate-900 text-sm">{app.businessName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Entity Type</span>
                <span className="text-slate-800">{app.businessType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">GSTIN</span>
                <span className="font-mono font-bold text-blue-900">{app.gstin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Corporate PAN</span>
                <span className="font-mono text-slate-800">{app.panNumber}</span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Primary Contact</span>
                <span className="font-semibold text-slate-800">{app.contactName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Official Email</span>
                <span className="text-slate-800">{app.contactEmail}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Phone Number</span>
                <span className="text-slate-800">{app.contactPhone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Attached Resale Doc</span>
                <span className="text-slate-700 font-mono text-[11px] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {app.resaleCertFileName || 'Not attached'}
                </span>
              </div>
            </div>
          </div>

          {/* Shop & Billing Addresses */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Registered Office</span>
              <p className="text-slate-700">
                {app.shopAddress.street}, {app.shopAddress.city}, {app.shopAddress.state} - {app.shopAddress.postalCode}, {app.shopAddress.country}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Warehouse/Shipping Address</span>
              <p className="text-slate-700">
                {app.shippingAddress.street}, {app.shippingAddress.city}, {app.shippingAddress.state} - {app.shippingAddress.postalCode}, {app.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">
                {isGuest 
                  ? 'GR Enterprises Wholesale KYC Portal' 
                  : loggedInApp 
                    ? `Application ID: ${loggedInApp.id}`
                    : 'Customer Account Status'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isGuest ? 'B2B Wholesale Application Status' : loggedInApp?.businessName || currentUser.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-6">

          {/* LOGGED IN USER WITH APPLICATION */}
          {!isGuest && loggedInApp && (
            renderApplicationCard(loggedInApp)
          )}

          {/* LOGGED IN USER WITHOUT APPLICATION (e.g. Retail Customer) */}
          {!isGuest && !loggedInApp && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No B2B Application on File</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  You are currently logged in as <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.email}), which is registered as a Direct-to-Consumer retail profile.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
                <p className="font-semibold text-slate-800">Benefits of GR Enterprises B2B Account:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Up to 45% tiered wholesale discounts</li>
                  <li>Official Tax Invoices with GST Input Credit (09 - UP)</li>
                  <li>Net-30 Corporate credit terms upon approval</li>
                  <li>Bulk multi-SKU quick order matrix</li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    setActiveModal('b2b_register');
                  }}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Apply for Wholesale Account Now</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* GUEST VIEW (NOT LOGGED IN) */}
          {isGuest && (
            <div className="space-y-6">
              {/* Privacy Warning */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                <UserX className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-amber-950">You are browsing as a Guest</h3>
                  <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                    Wholesale verification records and GSTIN compliance filings are confidential commercial documents. To safeguard business privacy, onboarding records are only visible to authenticated account holders or via verified application reference credentials.
                  </p>
                </div>
              </div>

              {/* Fast Sign-In Options */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Sign in with a registered business account
                  </h4>
                  <p className="text-xs text-slate-500">
                    Switch to one of our test business profiles to inspect different onboarding stages:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={() => switchPersona('b2b_approved')}
                    className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Approved</span>
                        <LogIn className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 block truncate">Acme Logistics Corp</span>
                      <span className="text-[10px] text-slate-500 font-mono">GST: 09AABCU9603R1ZM</span>
                    </div>
                  </button>

                  <button
                    onClick={() => switchPersona('b2b_pending')}
                    className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Pending</span>
                        <LogIn className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 block truncate">Zenith Enterprises</span>
                      <span className="text-[10px] text-slate-500 font-mono">GST: 09AAECZ1234F1Z5</span>
                    </div>
                  </button>

                  <button
                    onClick={() => switchPersona('b2b_needs_info')}
                    className="p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">Needs Info</span>
                        <LogIn className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 block truncate">Metro Supermarts</span>
                      <span className="text-[10px] text-slate-500 font-mono">GST: 09AABCM5678Q1Z1</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Guest Application Lookup Form */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>Check Application by GSTIN or Application ID</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    If you already submitted an onboarding form as a guest, search with your GSTIN or Application ID:
                  </p>
                </div>

                <form onSubmit={handleLookupSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      GSTIN, Application ID, or Registered Email *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 09AABCU9603R1ZM or app-b2b-01 or rajesh@acmelogistics.in"
                        value={lookupTerm}
                        onChange={e => setLookupTerm(e.target.value)}
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      Try sample: <button type="button" onClick={() => setLookupTerm('09AABCU9603R1ZM')} className="text-blue-600 underline font-mono">09AABCU9603R1ZM</button>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setActiveModal('b2b_register');
                      }}
                      className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Register New Business →</span>
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
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Application Record Found:</span>
                    </div>
                    {renderApplicationCard(lookupResult)}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Audited Corporate KYC Desk • Meerut</span>
          </div>

          <div className="flex items-center gap-3">
            {loggedInApp?.status === 'approved' && (
              <button
                onClick={() => {
                  onClose();
                  setMode('B2B');
                }}
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <span>Shop Wholesale Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
