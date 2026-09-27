import React from 'react';
import { Building2, ShieldCheck, FileText, ArrowRight, Lock, CheckCircle2, Clock, AlertTriangle, Layers, Percent, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface B2BHeroProps {
  onOpenRegister: () => void;
  onOpenStatus: () => void;
  onOpenQuickOrder: () => void;
}

export const B2BHero: React.FC<B2BHeroProps> = ({ onOpenRegister, onOpenStatus, onOpenQuickOrder }) => {
  const { currentUser, storeSettings } = useApp();

  const isApproved = currentUser?.role === 'b2b_approved';
  const isPending = currentUser?.role === 'b2b_pending';
  const isNeedsInfo = currentUser?.role === 'b2b_needs_info';
  const isUnregistered = !currentUser || currentUser.role === 'd2c_customer' || currentUser.role === 'guest';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl mx-3 sm:mx-6 lg:mx-8 my-3 sm:my-6 p-5 sm:p-10 lg:p-12 shadow-2xl border border-slate-800">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl">
        
        {/* Dynamic Status Pill */}
        {isApproved && (
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300 mb-4 sm:mb-6 backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">GR Wholesale Active • {currentUser?.businessProfile?.businessName || 'Business Partner'}</span>
          </div>
        )}

        {isPending && (
          <div className="inline-flex items-center gap-2 bg-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 mb-4 sm:mb-6 backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>B2B KYC In Review (Meerut) • Rates Locked</span>
          </div>
        )}

        {isNeedsInfo && (
          <div className="inline-flex items-center gap-2 bg-rose-950/80 border border-rose-500/40 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-300 mb-4 sm:mb-6 backdrop-blur-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Action Required • Resubmit Business Details</span>
          </div>
        )}

        {isUnregistered && (
          <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-500/40 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-200 mb-4 sm:mb-6 backdrop-blur-xs">
            <Lock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span>GR Enterprises Wholesale • Business Sign-up Required</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight">
          Direct Commercial Sourcing & Wholesale Procurement • Meerut
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed mb-6 sm:mb-8 max-w-3xl">
          Procure directly from GR Enterprises with factory-direct rates, tiered bulk volume savings up to 45%, full GST input credit claim (State Code: 09), palletized logistics, and Net-30 credit terms.
        </p>

        {/* Dynamic Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {isApproved ? (
            <>
              <button
                onClick={onOpenQuickOrder}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-600/25 text-sm"
              >
                <Layers className="w-4 h-4" />
                <span>Open Quick Bulk Order Matrix</span>
              </button>

              <button
                onClick={onOpenStatus}
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-3 rounded-xl transition text-sm font-medium"
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>View Business Profile & Terms</span>
              </button>
            </>
          ) : isPending || isNeedsInfo ? (
            <>
              <button
                onClick={onOpenStatus}
                className={`inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm ${
                  isNeedsInfo
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <span>{isNeedsInfo ? 'Resolve & Resubmit Application' : 'Check Application Review Status'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenRegister}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-600/25 text-sm"
              >
                <Building2 className="w-4 h-4" />
                <span>Apply for B2B Wholesale Account</span>
              </button>

              <a
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-3.5 rounded-xl transition text-sm font-medium"
              >
                <span>Browse Wholesale Catalog & MOQs</span>
              </a>
            </>
          )}
        </div>

        {/* Enterprise Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
            <Percent className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="leading-tight">Tiered Bulk Savings (Up to 45%)</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="leading-tight">GSTIN: 09AABCG1234F1Z8</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="leading-tight">Meerut Fulfillment Hub</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="leading-tight">Net-30 Commercial Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
};
