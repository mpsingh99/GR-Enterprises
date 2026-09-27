import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Building2, Search, ShoppingCart, FileText, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  onFocusSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenOrders,
  onOpenAdmin,
  onFocusSearch
}) => {
  const { mode, cartCount, setIsCartDrawerOpen } = useApp();

  const handleScrollCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around safe-area-bottom w-full max-w-full"
    >
      {/* 1. Home / Catalog */}
      <button
        onClick={handleScrollCatalog}
        className="flex flex-col items-center justify-center p-1.5 min-w-[56px] text-slate-600 hover:text-slate-900 active:scale-95 transition"
      >
        {mode === 'B2B' ? (
          <Building2 className="w-5 h-5 text-blue-700" />
        ) : (
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
        )}
        <span className="text-[10px] font-semibold mt-0.5">Catalog</span>
      </button>

      {/* 2. Search */}
      <button
        onClick={onFocusSearch}
        className="flex flex-col items-center justify-center p-1.5 min-w-[56px] text-slate-600 hover:text-slate-900 active:scale-95 transition"
      >
        <Search className="w-5 h-5 text-slate-600" />
        <span className="text-[10px] font-semibold mt-0.5">Search</span>
      </button>

      {/* 3. Cart with Badge */}
      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="relative flex flex-col items-center justify-center p-1.5 min-w-[56px] text-slate-600 hover:text-slate-900 active:scale-95 transition"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-slate-700" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[9px] font-extrabold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold mt-0.5">Cart</span>
      </button>

      {/* 4. Orders */}
      <button
        onClick={onOpenOrders}
        className="flex flex-col items-center justify-center p-1.5 min-w-[56px] text-slate-600 hover:text-slate-900 active:scale-95 transition"
      >
        <FileText className="w-5 h-5 text-slate-600" />
        <span className="text-[10px] font-semibold mt-0.5">Orders</span>
      </button>

      {/* 5. Master Admin Panel */}
      <button
        onClick={onOpenAdmin}
        className="flex flex-col items-center justify-center p-1.5 min-w-[56px] text-amber-900 hover:text-amber-950 active:scale-95 transition"
      >
        <div className="p-1 rounded-lg bg-amber-100 text-amber-800">
          <Shield className="w-4 h-4 text-amber-700" />
        </div>
        <span className="text-[10px] font-bold text-amber-900 mt-0.5">Admin</span>
      </button>
    </nav>
  );
};
