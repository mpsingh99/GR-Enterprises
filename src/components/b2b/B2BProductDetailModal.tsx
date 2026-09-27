import React, { useState } from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  Package,
  Layers,
  Lock,
  CheckCircle2,
  AlertTriangle,
  MessageSquareQuote,
  ShieldCheck,
  Truck,
  FileText
} from 'lucide-react';

interface B2BProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenQuote: (product: Product) => void;
  onOpenRegister: () => void;
}

export const B2BProductDetailModal: React.FC<B2BProductDetailModalProps> = ({
  product,
  onClose,
  onOpenQuote,
  onOpenRegister
}) => {
  const { currentUser, addToCart, getB2BUnitPrice } = useApp();

  if (!product) return null;

  const isApproved = currentUser?.role === 'b2b_approved';
  const [quantity, setQuantity] = useState<number>(product.moq);
  const [selectedImage, setSelectedImage] = useState<string>(product.image);

  const unitPrice = getB2BUnitPrice(product, quantity);
  const subtotal = unitPrice * quantity;
  const retailComparison = product.retailPrice * quantity;
  const totalSavings = retailComparison - subtotal;

  const handleStep = (increment: boolean) => {
    const step = product.casePackSize > 1 ? product.casePackSize : 1;
    if (increment) {
      setQuantity(prev => prev + step);
    } else {
      setQuantity(prev => Math.max(product.moq, prev - step));
    }
  };

  const handleManualQuantity = (val: string) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setQuantity(parsed);
    } else if (val === '') {
      setQuantity(0);
    }
  };

  const isMoqMet = quantity >= product.moq;
  const isCasePackMet = product.casePackSize <= 1 || quantity % product.casePackSize === 0;

  const handleAddToCart = () => {
    if (!isApproved) {
      onOpenRegister();
      return;
    }
    const success = addToCart(product, quantity);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Top Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">
                B2B Wholesale Procurement Spec Sheet
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">{product.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image & Logistics Specs (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                        selectedImage === img ? 'border-blue-600' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Compliance & Logistics box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>GST & Commercial Logistics Information</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] block">HSN Code</span>
                    <span className="font-mono font-bold text-slate-800">{product.hsnCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Applicable GST Rate</span>
                    <span className="font-bold text-slate-800">{product.taxRatePercent}% GST (Eligible for ITC)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Minimum Order (MOQ)</span>
                    <span className="font-bold text-slate-800">{product.moq} {product.unit}s</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Case Pack Packing</span>
                    <span className="font-bold text-slate-800">{product.casePackSize} units per shipper box</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing Tiers & Quantity Calculator (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-blue-700 uppercase tracking-wider">{product.category}</span>
                  <span className="font-mono">Master SKU: {product.sku}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{product.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Wholesale Pricing Tiers Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Wholesale Volume Discount Tiers</span>
                  </h4>
                  {!isApproved && (
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Locked • Pending Business Verification
                    </span>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Order Quantity Tier</th>
                        <th className="py-2.5 px-3">Wholesale Unit Rate</th>
                        <th className="py-2.5 px-3">Savings vs Retail</th>
                        <th className="py-2.5 px-3 text-right">Applicability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {product.priceTiers.map((tier, idx) => {
                        const isTierActive = quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity);
                        return (
                          <tr
                            key={idx}
                            className={`transition ${isTierActive && isApproved ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'}`}
                          >
                            <td className="py-3 px-3">
                              <span className="font-medium text-slate-900">
                                {tier.minQuantity} {tier.maxQuantity ? `to ${tier.maxQuantity}` : '+'} {product.unit}s
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {isApproved ? (
                                <span className="font-extrabold text-blue-950 text-sm">
                                  {formatCurrency(tier.pricePerUnit)}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">🔒 Locked</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {isApproved ? (
                                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {tier.savingsPercentage}% OFF
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">🔒 Locked</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isApproved ? (
                                isTierActive ? (
                                  <span className="text-blue-700 font-bold text-[11px] flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected Tier
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Eligible</span>
                                )
                              ) : (
                                <span className="text-slate-400 text-[11px]">Sign in to unlock</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Volume Quantity Stepper & Calculator */}
              {isApproved ? (
                <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                        Procurement Quantity ({product.unit}s):
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Must meet MOQ ({product.moq}) & Case Pack multiple of {product.casePackSize}.
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                        <button
                          onClick={() => handleStep(false)}
                          disabled={quantity <= product.moq}
                          className="px-3 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-30 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleManualQuantity(e.target.value)}
                          className="w-20 py-2 text-center text-sm font-bold text-slate-900 border-x border-slate-200 focus:outline-none"
                        />
                        <button
                          onClick={() => handleStep(true)}
                          className="px-3 py-2 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Validation warnings */}
                  {!isMoqMet && (
                    <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Order quantity is below MOQ ({product.moq} {product.unit}s required).
                    </p>
                  )}

                  {!isCasePackMet && (
                    <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Must be a multiple of case pack ({product.casePackSize} units per carton).
                    </p>
                  )}

                  {/* Calculated Price Breakdown */}
                  <div className="pt-3 border-t border-blue-200/70 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 block">Applied Unit Price</span>
                      <span className="text-sm font-extrabold text-blue-950">{formatCurrency(unitPrice)}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 block">Your Bulk Savings</span>
                      <span className="text-sm font-extrabold text-emerald-600">+{formatCurrency(totalSavings)}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 block">Subtotal (Excl. Tax)</span>
                      <span className="text-sm font-extrabold text-slate-950">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={!isMoqMet || !isCasePackMet}
                      className="py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition"
                    >
                      <Package className="w-4 h-4" />
                      <span>Add {quantity} Units to Wholesale Cart</span>
                    </button>

                    {product.isRfqEligible && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenQuote(product);
                        }}
                        className="py-3 px-4 rounded-xl border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                      >
                        <MessageSquareQuote className="w-4 h-4 text-blue-700" />
                        <span>Request Custom Quote (RFQ)</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Unapproved state call to action */
                <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Wholesale Ordering is Restricted</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    To access wholesale tiered rates, minimum order quantities, and custom quote submissions, register your company with a valid GSTIN.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRegister();
                    }}
                    className="py-2.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow"
                  >
                    Apply for B2B Wholesale Account
                  </button>
                </div>
              )}

              {/* Technical Specifications */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Specifications</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <div
                      key={key}
                      className={`flex justify-between p-2.5 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                    >
                      <span className="text-slate-500 font-medium">{key}</span>
                      <span className="text-slate-900 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
