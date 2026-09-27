import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import { useApp } from '../../context/AppContext';
import {
  X,
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers,
  Lock,
  UserPlus
} from 'lucide-react';

interface D2CProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const D2CProductDetailModal: React.FC<D2CProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, currentUser, openAuthModal } = useApp();

  if (!product) return null;

  const isSignedUp = currentUser !== null && currentUser.role !== 'guest';

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [quantity, setQuantity] = useState<number>(1);

  const currentPrice = product.retailPrice + (selectedVariant?.additionalPrice || 0);
  const discountPercent = Math.round(((product.mrp - currentPrice) / product.mrp) * 100);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity, selectedVariant);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Images */}
          <div className="p-6 bg-slate-50 border-r border-slate-100 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner mb-4">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-emerald-700 uppercase tracking-wider">{product.category}</span>
                <span>SKU: {selectedVariant?.sku || product.sku}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-3">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} customer reviews)</span>
              </div>

              {/* Price Block */}
              {!isSignedUp ? (
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 mb-5">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-sm mb-1.5">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Retail Price Locked</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed mb-3">
                    Retail price tags, discounts, and online ordering are exclusively unlocked for registered customers. Sign up with Google or your phone in 30 seconds to view prices and order.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      openAuthModal('signup');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sign Up in 30 Seconds to View Price</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {formatCurrency(currentPrice)}
                    </span>
                    {product.mrp > currentPrice && (
                      <>
                        <span className="text-sm text-slate-400 line-through">
                          {formatCurrency(product.mrp)}
                        </span>
                        <span className="bg-rose-100 text-rose-700 font-bold text-xs px-2 py-0.5 rounded-full">
                          {discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Inclusive of all taxes (GST {product.taxRatePercent}%) • Free Delivery from Meerut Hub
                  </p>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Option / Edition:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between ${
                          selectedVariant?.id === variant.id
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{variant.name}</span>
                        {variant.additionalPrice > 0 && (
                          <span className="text-[11px] text-slate-500">
                            +{formatCurrency(variant.additionalPrice)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-slate-900 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In stock ({product.stock} units available)
                  </span>
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Highlights</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Specifications */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specifications</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <div
                      key={key}
                      className={`flex justify-between p-2.5 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                    >
                      <span className="text-slate-500 font-medium">{key}</span>
                      <span className="text-slate-900 font-semibold text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions bottom */}
            <div>
              {!isSignedUp ? (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onClose();
                      openAuthModal('signin');
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      openAuthModal('signup');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up to View Price</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-sm flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-500 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Free 2-day delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>7-day easy returns</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Official warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
