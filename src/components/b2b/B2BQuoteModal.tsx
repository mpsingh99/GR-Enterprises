import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import {
  X,
  MessageSquareQuote,
  Building2,
  Calendar,
  Send,
  HelpCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface B2BQuoteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const B2BQuoteModal: React.FC<B2BQuoteModalProps> = ({ product, isOpen, onClose }) => {
  const { currentUser, submitRFQ, showToast } = useApp();

  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState<number>(product.moq * 5);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [requiredDate, setRequiredDate] = useState<string>('2026-10-30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Authentication Required', 'Please sign in to submit a Request for Quote.', 'warning');
      return;
    }

    submitRFQ({
      businessId: currentUser.id,
      businessName: currentUser.businessProfile?.businessName || currentUser.name,
      contactName: currentUser.name,
      contactEmail: currentUser.email,
      contactPhone: currentUser.phone || '+91 98000 00000',
      productId: product.id,
      productTitle: product.title,
      sku: product.sku,
      requestedQuantity: quantity,
      targetPricePerUnit: targetPrice ? parseFloat(targetPrice) : undefined,
      notes: notes || 'Standard corporate delivery with customized packaging.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">
                Enterprise Volume Quote (RFQ)
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">Request Custom Wholesale Quote</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Target Product */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <img
              src={product.image}
              alt={product.title}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-blue-700 font-bold uppercase">{product.category}</span>
              <h4 className="font-bold text-slate-900 truncate">{product.title}</h4>
              <p className="text-[11px] text-slate-500 font-mono">
                SKU: {product.sku} • Base Wholesale: {formatCurrency(product.wholesalePrice)}/{product.unit}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested Volume ({product.unit}s) *
              </label>
              <input
                type="number"
                required
                min={product.moq}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || product.moq)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Recommended for volumes exceeding 50+ units
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Price Per Unit (₹) (Optional)
              </label>
              <input
                type="number"
                placeholder={`e.g. ${Math.round(product.wholesalePrice * 0.85)}`}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Enter your target procurement budget
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Delivery Schedule / Date
            </label>
            <input
              type="date"
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Procurement Specifications & Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mention packaging needs, delivery location, palletizing preferences, or repeat supply schedule..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Submitter Details preview */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900">
            <span className="text-[10px] uppercase font-bold text-blue-700 block mb-1">
              Submitting Organization
            </span>
            <p className="font-bold text-xs">
              {currentUser?.businessProfile?.businessName || currentUser?.name || 'Registered Business'}
            </p>
            <p className="text-[11px] text-blue-800">
              GSTIN: {currentUser?.businessProfile?.gstin || 'GST on Record'} • {currentUser?.email}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold flex items-center gap-2 shadow transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit RFQ to Account Manager</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
