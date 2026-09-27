import React from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import { CheckCircle2, FileText, ArrowRight, Package, Truck, Calendar } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, onViewInvoice }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Order Confirmed!</h2>
        <p className="text-xs text-slate-500 mb-6">
          Thank you for your order, <span className="font-semibold text-slate-800">{order.customerName}</span>. A confirmation email with invoice has been sent to <span className="font-semibold text-slate-800">{order.customerEmail}</span>.
        </p>

        {/* Order Card Info */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left space-y-3 mb-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Order Reference</span>
              <span className="text-xs font-mono font-bold text-slate-900">{order.orderNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Invoice No.</span>
              <span className="text-xs font-mono font-bold text-emerald-700">{order.invoiceNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Payment Method</span>
              <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Delivery Tracking</span>
              <span className="font-mono text-slate-800 font-medium">{order.trackingNumber || 'Tracking Generated'}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Paid (incl. GST)</span>
            <span className="font-extrabold text-base text-slate-900">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onViewInvoice(order)}
            className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>View Tax Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
