import React, { useState } from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Building2,
  Package,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  Eye,
  MessageSquareQuote
} from 'lucide-react';

interface B2BProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onOpenQuote: (product: Product) => void;
  onOpenRegister: () => void;
}

export const B2BProductCard: React.FC<B2BProductCardProps> = ({
  product,
  onOpenDetail,
  onOpenQuote,
  onOpenRegister
}) => {
  const { currentUser, addToCart, getB2BUnitPrice } = useApp();

  const isApproved = currentUser?.role === 'b2b_approved';
  
  // Default quantity set to MOQ
  const [quantity, setQuantity] = useState<number>(product.moq);

  const bestTier = product.priceTiers[product.priceTiers.length - 1];
  const maxSavings = bestTier ? bestTier.savingsPercentage : 20;

  // Calculate current unit price based on selected quantity
  const currentUnitPrice = getB2BUnitPrice(product, quantity);
  const lineTotal = currentUnitPrice * quantity;

  const handleStepQuantity = (increment: boolean) => {
    const step = product.casePackSize > 1 ? product.casePackSize : 1;
    if (increment) {
      setQuantity(prev => prev + step);
    } else {
      setQuantity(prev => Math.max(product.moq, prev - step));
    }
  };

  const handleAddWholesaleToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isApproved) {
      onOpenRegister();
      return;
    }
    addToCart(product, quantity);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top Header Badge */}
      <div className="bg-slate-900 text-white px-3.5 py-1.5 flex items-center justify-between text-[11px] font-medium">
        <span className="font-mono text-slate-300">SKU: {product.sku}</span>
        <span className="text-slate-400">HSN: {product.hsnCode} (GST {product.taxRatePercent}%)</span>
      </div>

      {/* Product Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-300" />
            Up to {maxSavings}% Bulk Savings
          </span>

          <span className="bg-slate-800/90 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
            MOQ: {product.moq} {product.unit}s
          </span>
        </div>

        {/* Case Pack Tag */}
        {product.casePackSize > 1 && (
          <div className="absolute bottom-3 left-3 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Package className="w-3 h-3 text-blue-600" />
            Case Pack: {product.casePackSize} units
          </div>
        )}

        {/* Hover quick view */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" /> View Wholesale Matrix
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-blue-700 uppercase tracking-wider">{product.category}</span>
            <span>Stock: {product.stock} units</span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-blue-700 transition line-clamp-2 leading-snug mb-3">
            {product.title}
          </h3>

          {/* Pricing Box - Locked or Unlocked */}
          {isApproved ? (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl mb-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-blue-900 font-semibold block">Wholesale Rate:</span>
                  <span className="text-lg font-extrabold text-blue-950">
                    {formatCurrency(currentUnitPrice)}
                  </span>
                  <span className="text-[10px] text-slate-500"> /{product.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Retail MRP:</span>
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(product.retailPrice)}
                  </span>
                </div>
              </div>

              {/* Tiers quick preview */}
              <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[10px] text-blue-800">
                <span>Tier 1 ({product.priceTiers[0].minQuantity}+): {formatCurrency(product.priceTiers[0].pricePerUnit)}</span>
                <span>Tier 3 ({bestTier.minQuantity}+): <strong>{formatCurrency(bestTier.pricePerUnit)}</strong></span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl mb-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>Wholesale Rates Locked</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Wholesale tiered prices and MOQ volume rates are confidential until business registration.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-100 mt-auto space-y-2">
          {isApproved ? (
            <>
              {/* Stepper & Line Total */}
              <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => handleStepQuantity(false)}
                    disabled={quantity <= product.moq}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                    title={`Step by ${product.casePackSize}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-900 min-w-[34px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleStepQuantity(true)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 transition"
                    title={`Step by ${product.casePackSize}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {formatCurrency(lineTotal)}
                  </span>
                  <span className="text-[10px] text-slate-500">for {quantity} {product.unit}s</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleAddWholesaleToCart}
                  className="py-2 px-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Add Bulk</span>
                </button>

                {product.isRfqEligible && (
                  <button
                    onClick={() => onOpenQuote(product)}
                    className="py-2 px-2 rounded-xl border border-blue-300 bg-blue-50/50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold transition flex items-center justify-center gap-1"
                    title="Request customized pricing for massive volume orders"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5 text-blue-700" />
                    <span>Get Quote</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRegister();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Register Business to View Prices</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
