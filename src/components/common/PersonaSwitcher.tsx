import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, ShieldCheck, Clock, AlertTriangle, Building2, ShoppingBag, RotateCcw } from 'lucide-react';

export const PersonaSwitcher: React.FC = () => {
  const { currentUser, switchPersona, resetAllData, mode, setMode } = useApp();

  const personas = [
    {
      key: 'guest' as const,
      label: 'Guest',
      sub: 'Unregistered visitor',
      icon: ShoppingBag,
      role: 'guest'
    },
    {
      key: 'd2c_customer' as const,
      label: 'Retail Shopper',
      sub: 'Priya Sharma (D2C)',
      icon: UserCheck,
      role: 'd2c_customer'
    },
    {
      key: 'b2b_pending' as const,
      label: 'B2B Pending',
      sub: 'Zenith Ent. (Awaiting Review)',
      icon: Clock,
      role: 'b2b_pending'
    },
    {
      key: 'b2b_needs_info' as const,
      label: 'B2B Needs Info',
      sub: 'Metro Marts (Action Required)',
      icon: AlertTriangle,
      role: 'b2b_needs_info'
    },
    {
      key: 'b2b_approved' as const,
      label: 'B2B Approved',
      sub: 'Acme Logistics (Wholesale Active)',
      icon: Building2,
      role: 'b2b_approved'
    },
    {
      key: 'admin' as const,
      label: 'Admin Portal',
      sub: 'Store Administrator',
      icon: ShieldCheck,
      role: 'admin'
    }
  ];

  const currentRole = currentUser ? currentUser.role : 'guest';

  // Filter test personas strictly based on active store mode (Retail vs B2B)
  const filteredPersonas = personas.filter(p => {
    if (p.key === 'guest' || p.key === 'admin') return true;
    if (mode === 'D2C') return p.key === 'd2c_customer';
    if (mode === 'B2B') return p.key.startsWith('b2b');
    return true;
  });

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800 px-3 py-1.5 sm:py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] shrink-0">
            ⚡ Test Accounts ({mode === 'B2B' ? 'Wholesale' : 'Retail'})
          </span>
          <span className="hidden sm:inline text-slate-400">
            Switch state to test {mode === 'B2B' ? 'B2B wholesale verification' : 'direct retail checkout'}:
          </span>
          <button
            onClick={resetAllData}
            title="Reset database to fresh default sample data"
            className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center overflow-x-auto scrollbar-none gap-1 sm:gap-1.5 pb-0.5 sm:pb-0 touch-pan-x">
          {filteredPersonas.map(p => {
            const isActive = currentRole === p.role;
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => switchPersona(p.key)}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={p.sub}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{p.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block shrink-0"></div>

          <button
            onClick={resetAllData}
            title="Reset database to fresh default sample data"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-[11px] shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
