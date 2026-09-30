import React from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import { CheckCircle2, FileText, ArrowRight, Building2, Package, Truck, Calendar } from 'lucide-react';

interface B2BOrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const B2BOrderSuccessModal: React.FC<B2BOrderSuccessModalProps> = ({ order, onClose, onViewInvoice }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-1">Wholesale Purchase Order Booked!</h2>
        <p className="text-xs text-slate-500 mb-6">
          Thank you for your commercial order, <span className="font-semibold text-slate-800">{order.customerName}</span> ({order.businessDetails?.businessName || 'Business Partner'}). A confirmation and GST tax invoice have been dispatched to <span className="font-semibold text-slate-800">{order.customerEmail}</span>.
        </p>

        {/* Order Card Info */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left space-y-3 mb-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">PO Reference</span>
              <span className="text-xs font-mono font-bold text-slate-900">{order.orderNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">GST Tax Invoice</span>
              <span className="text-xs font-mono font-bold text-blue-700">{order.invoiceNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Payment Terms</span>
              <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Freight Dispatch</span>
              <span className="font-mono text-slate-800 font-medium">{order.trackingNumber || 'Pallet Manifest Generated'}</span>
            </div>
          </div>

          {order.businessDetails?.gstin && (
            <div className="text-[11px] bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-xl">
              <strong>Buyer GSTIN:</strong> <span className="font-mono">{order.businessDetails.gstin}</span> (Input Tax Credit Eligible)
            </div>
          )}

          <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Commercial Value (incl. GST)</span>
            <span className="font-extrabold text-base text-slate-900">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onViewInvoice(order)}
            className="py-3 px-4 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <FileText className="w-4 h-4 text-blue-700" />
            <span>Download Tax Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
          >
            <span>Back to Wholesale Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
