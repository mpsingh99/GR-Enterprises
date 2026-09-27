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
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800 px-3 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full text-[11px]">
            ⚡ Test Accounts ({mode === 'B2B' ? 'B2B Wholesale' : 'Retail'})
          </span>
          <span className="hidden sm:inline text-slate-400">
            Switch state to test {mode === 'B2B' ? 'B2B wholesale verification' : 'direct retail checkout'}:
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {filteredPersonas.map(p => {
            const isActive = currentRole === p.role;
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => switchPersona(p.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={p.sub}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block"></div>

          <button
            onClick={resetAllData}
            title="Reset database to fresh default sample data"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
