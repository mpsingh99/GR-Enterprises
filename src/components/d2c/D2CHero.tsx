import React from 'react';
import { ShoppingBag, ShieldCheck, Zap, Truck, Tag, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const D2CHero: React.FC = () => {
  const { storeSettings } = useApp();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-2xl sm:rounded-3xl mx-3 sm:mx-6 lg:mx-8 my-3 sm:my-6 p-5 sm:p-10 lg:p-12 shadow-2xl border border-emerald-900/40">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-20 w-60 sm:w-72 h-60 sm:h-72 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-500/40 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-emerald-200 mb-4 sm:mb-6 backdrop-blur-xs">
          <Tag className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="truncate">GR Enterprises Retail • Dispatched from {storeSettings.city} Hub</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight">
          Premium Tech, Workspace & Packaging Supplies by GR Enterprises
        </h1>

        <p className="text-xs sm:text-base lg:text-lg text-emerald-100/90 font-normal leading-relaxed mb-6 sm:mb-8 max-w-2xl">
          Order high-performance monitors, dual-motor standing desks, ergonomic mesh chairs, and commercial supplies with doorstep delivery across India from our Meerut central distribution center.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
          <a
            href="#catalog"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 sm:px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 text-xs sm:text-sm active:scale-95 text-center"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Shop Retail Catalog</span>
          </a>

          <a
            href="#catalog"
            className="inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/90 text-white border border-slate-700 px-5 py-3 rounded-xl transition text-xs sm:text-sm font-medium backdrop-blur-xs active:scale-95 text-center"
          >
            <span>Explore All Retail Categories</span>
          </a>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-emerald-900/50 text-[11px] sm:text-xs text-emerald-200/90">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span>Free Express Delivery above ₹1,000</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span>100% Genuine Brand Warranty</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span>Central Meerut Warehouse</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span>Rapid 24h Order Dispatch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
