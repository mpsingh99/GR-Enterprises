import React from 'react';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import { useApp } from '../../context/AppContext';
import { Star, ShoppingCart, Eye, Lock, UserPlus } from 'lucide-react';

interface D2CProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const D2CProductCard: React.FC<D2CProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart, currentUser, openAuthModal } = useApp();
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  const isSignedUp = currentUser !== null && currentUser.role !== 'guest';
  const discountPercent = Math.round(((product.mrp - product.retailPrice) / product.mrp) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedUp) {
      openAuthModal('signup');
      return;
    }
    addToCart(product, 1, selectedVariant);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top image wrapper */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isSignedUp ? (
            discountPercent > 0 && (
              <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {discountPercent}% OFF
              </span>
            )
          ) : (
            <span className="bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs">
              <Lock className="w-2.5 h-2.5" /> Price Locked
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>

        {/* Quick view icon overlay */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-emerald-600" /> Quick View
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating}</span>
            <span className="text-[11px] text-slate-400">({product.reviewsCount} reviews)</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Variants selector if available */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`text-[10px] px-2 py-1 rounded border transition ${
                      selectedVariant?.id === variant.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart button */}
        {!isSignedUp ? (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block text-xs leading-none">Price Locked</span>
                <span className="text-[10px] text-slate-400">Sign up to view</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openAuthModal('signup');
              }}
              className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-700" />
              <span>Sign Up</span>
            </button>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-slate-900">
                  {formatCurrency(product.retailPrice + (selectedVariant?.additionalPrice || 0))}
                </span>
                {product.mrp > product.retailPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(product.mrp)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block">Incl. of all taxes</span>
            </div>

            <button
              onClick={handleAddToCart}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
              aria-label={`Add ${product.title} to cart`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add to Cart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
