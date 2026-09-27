import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
        let borderClass = 'border-blue-200 bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
          borderClass = 'border-emerald-200 bg-emerald-50/90 text-emerald-950';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
          borderClass = 'border-amber-200 bg-amber-50/90 text-amber-950';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
          borderClass = 'border-rose-200 bg-rose-50/90 text-rose-950';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto shadow-lg rounded-xl border p-4 transition-all duration-300 transform translate-y-0 backdrop-blur-sm flex items-start gap-3 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight mb-1">{toast.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
