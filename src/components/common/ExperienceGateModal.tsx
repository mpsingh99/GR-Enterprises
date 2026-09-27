import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Building2,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  Sparkles,
  FileText,
  Percent,
  X
} from 'lucide-react';

export const ExperienceGateModal: React.FC = () => {
  const { isExperienceGateOpen, setIsExperienceGateOpen, selectExperience, mode, storeSettings } = useApp();

  if (!isExperienceGateOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 sm:p-8 text-white text-center relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Close button (defaults to current active mode) */}
          <button
            onClick={() => setIsExperienceGateOpen(false)}
            className="absolute top-3.5 right-3.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Continue with current view"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-amber-300 mb-2 sm:mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>GR Enterprises • {storeSettings.city} Hub</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
            Welcome to GR Enterprises
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
            Please choose how you would like to shop today. We offer two dedicated platforms tailored to your purchasing needs:
          </p>
        </div>

        {/* Two Core Options Grid */}
        <div className="p-4 sm:p-8 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* OPTION 1: RETAIL STOREFRONT */}
            <div 
              onClick={() => selectExperience('D2C')}
              className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 p-4 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Retail Direct
              </div>

              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-xs">
                  <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-700 transition">
                    Shop for Myself
                  </h3>
                  <span className="text-[10px] sm:text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">Individual</span>
                </div>

                <p className="text-xs text-slate-500 mb-4 sm:mb-5 leading-relaxed">
                  Best for individual buyers, home offices, and personal technology supplies with direct doorstep delivery across India.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Single units & consumer pack ordering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fast dispatch from Meerut central warehouse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Simple 30-sec sign-up (Google or Mobile OTP)</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-medium">Price tags unlocked right after simple sign-up</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectExperience('D2C');
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
              >
                <span>Enter Retail Storefront</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* OPTION 2: B2B WHOLESALE PORTAL */}
            <div 
              onClick={() => selectExperience('B2B')}
              className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-600 p-4 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                B2B Wholesale
              </div>

              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-xs">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-700 transition">
                    Buy for My Business
                  </h3>
                  <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-semibold">Commercial</span>
                </div>

                <p className="text-xs text-slate-500 mb-4 sm:mb-5 leading-relaxed">
                  Engineered for companies, wholesalers, retail stores, and contractors procuring in bulk with GST tax invoices.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Tiered wholesale volume discounts (up to 45% OFF)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>18% GST Input Tax Credit (ITC) with formal invoice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Net-30 commercial credit terms & custom RFQs</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px] font-medium">Wholesale price tags unlocked via B2B registration</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectExperience('B2B');
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-blue-900/20"
              >
                <span>Enter B2B Wholesale Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Subtext info */}
          <div className="mt-4 sm:mt-6 text-center text-xs text-slate-500">
            <span>You can switch store environments at any time by clicking "Change Store" in the header.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
