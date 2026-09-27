import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/gstValidation';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Building2,
  Tag,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    cartSubtotal,
    cartCount,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    mode,
    currentUser,
    setActiveModal
  } = useApp();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  if (!isCartDrawerOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'SAVE10') {
      setAppliedPromo({ code: 'SAVE10', percent: 10 });
    } else if (code === 'CORP5' && mode === 'B2B') {
      setAppliedPromo({ code: 'CORP5', percent: 5 });
    } else if (code === 'FIRSTBUY') {
      setAppliedPromo({ code: 'FIRSTBUY', percent: 15 });
    } else {
      setPromoError('Invalid coupon code. Try SAVE10 or FIRSTBUY');
    }
  };

  const discountAmount = appliedPromo ? Math.round(cartSubtotal * (appliedPromo.percent / 100)) : 0;
  const taxableSubtotal = cartSubtotal - discountAmount;
  
  // Average GST estimated at 18%
  const estimatedTax = Math.round(taxableSubtotal * 0.18);
  const shippingFee = taxableSubtotal >= 1000 || taxableSubtotal === 0 ? 0 : 99;
  const finalTotal = taxableSubtotal + estimatedTax + shippingFee;

  const isB2BOrder = mode === 'B2B';
  const isB2BApproved = currentUser?.role === 'b2b_approved';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg text-white ${mode === 'B2B' ? 'bg-blue-900' : 'bg-emerald-600'}`}>
              {mode === 'B2B' ? <Building2 className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Your Shopping Cart ({cartCount})
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Browsing in <span className="font-semibold text-slate-700">{mode} {mode === 'B2B' ? 'Wholesale' : 'Retail'}</span> Mode
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-1">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mb-6">
                Explore our catalog to add items for direct retail delivery or bulk commercial supplies.
              </p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            <>
              {cart.map((item, idx) => {
                const step = (item.mode === 'B2B' && item.product.casePackSize > 1) 
                  ? item.product.casePackSize 
                  : 1;

                return (
                  <div
                    key={`${item.productId}-${item.selectedVariant?.id || 'default'}-${idx}`}
                    className="flex gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-50/80 transition"
                  >
                    {/* Item Image */}
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.productId, item.selectedVariant?.id)}
                            className="text-slate-400 hover:text-rose-600 transition p-0.5"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.selectedVariant && (
                          <p className="text-[10px] text-slate-500 font-medium">
                            Variant: {item.selectedVariant.name}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            item.mode === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.mode}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            HSN: {item.product.hsnCode}
                          </span>
                        </div>
                      </div>

                      {/* Stepper & Price */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.productId, Math.max(0, item.quantity - step), item.selectedVariant?.id)}
                            className="p-1 sm:p-1.5 text-slate-600 hover:bg-slate-100 transition"
                            title={`Decrement by ${step}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + step, item.selectedVariant?.id)}
                            className="p-1 sm:p-1.5 text-slate-600 hover:bg-slate-100 transition"
                            title={`Increment by ${step}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            @{formatCurrency(item.unitPrice)}/{item.product.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-slate-400 hover:text-rose-600 transition underline"
                >
                  Clear all items
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Coupon code (e.g. SAVE10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Apply
              </button>
            </form>

            {promoError && (
              <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
            )}

            {appliedPromo && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span>Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.percent}% OFF)</span>
                <button onClick={() => setAppliedPromo(null)} className="text-emerald-900 font-bold hover:underline">
                  Remove
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated GST (18% Avg)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(estimatedTax)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping & Freight</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-slate-950">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* B2B restriction warning if applicable */}
            {isB2BOrder && !isB2BApproved && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">B2B Account Verification Required</p>
                  <p className="text-[11px] text-amber-800">
                    Wholesale checkout is restricted to verified business accounts with valid GSTIN.
                  </p>
                </div>
              </div>
            )}

            {/* Checkout Action */}
            {isB2BOrder && !isB2BApproved ? (
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setActiveModal('b2b_register');
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20"
              >
                <Building2 className="w-4 h-4" />
                <span>Register Business to Checkout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  onProceedToCheckout();
                }}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  mode === 'B2B'
                    ? 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                <span>Proceed to {mode === 'B2B' ? 'Wholesale Business' : 'Retail'} Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Safe & Secure 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
