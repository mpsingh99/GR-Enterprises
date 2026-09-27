import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import {
  X,
  Layers,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Building2
} from 'lucide-react';

interface QuickOrderRow {
  rowId: string;
  productId: string;
  quantity: number;
}

interface B2BQuickOrderPadProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const B2BQuickOrderPad: React.FC<B2BQuickOrderPadProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { products, currentUser, addToCart, getB2BUnitPrice, showToast, setIsCartDrawerOpen } = useApp();

  if (!isOpen) return null;

  const isApproved = currentUser?.role === 'b2b_approved';

  const [rows, setRows] = useState<QuickOrderRow[]>([
    { rowId: 'row-1', productId: products[0]?.id || '', quantity: products[0]?.moq || 5 },
    { rowId: 'row-2', productId: products[3]?.id || '', quantity: products[3]?.moq || 10 },
    { rowId: 'row-3', productId: products[1]?.id || '', quantity: products[1]?.moq || 6 }
  ]);

  const handleAddRow = () => {
    const unusedProduct = products.find(p => !rows.some(r => r.productId === p.id)) || products[0];
    setRows(prev => [
      ...prev,
      {
        rowId: `row-${Date.now()}`,
        productId: unusedProduct.id,
        quantity: unusedProduct.moq
      }
    ]);
  };

  const handleRemoveRow = (rowId: string) => {
    setRows(prev => prev.filter(r => r.rowId !== rowId));
  };

  const handleProductChange = (rowId: string, productId: string) => {
    const prod = products.find(p => p.id === productId);
    setRows(prev => prev.map(r => {
      if (r.rowId === rowId) {
        return {
          ...r,
          productId,
          quantity: prod ? prod.moq : 1
        };
      }
      return r;
    }));
  };

  const handleQuantityChange = (rowId: string, quantity: number) => {
    setRows(prev => prev.map(r => r.rowId === rowId ? { ...r, quantity } : r));
  };

  // Calculate totals
  let totalItemsCount = 0;
  let totalOrderAmount = 0;
  let hasErrors = false;

  const rowDetails = rows.map(r => {
    const prod = products.find(p => p.id === r.productId);
    if (!prod) return null;

    const unitPrice = getB2BUnitPrice(prod, r.quantity);
    const lineTotal = unitPrice * r.quantity;
    const isMoqMet = r.quantity >= prod.moq;
    const isCasePackMet = prod.casePackSize <= 1 || r.quantity % prod.casePackSize === 0;

    if (!isMoqMet || !isCasePackMet) {
      hasErrors = true;
    }

    totalItemsCount += r.quantity;
    totalOrderAmount += lineTotal;

    return {
      ...r,
      product: prod,
      unitPrice,
      lineTotal,
      isMoqMet,
      isCasePackMet
    };
  }).filter(Boolean);

  const handleAddAllToCart = () => {
    if (!isApproved) {
      onOpenRegister();
      return;
    }

    if (hasErrors) {
      showToast('Validation Error', 'Please adjust quantities to meet MOQ and case pack rules on all rows.', 'error');
      return;
    }

    let addedCount = 0;
    rowDetails.forEach(item => {
      if (item && item.product) {
        addToCart(item.product, item.quantity);
        addedCount++;
      }
    });

    showToast('Batch Added to Cart', `Added ${addedCount} wholesale lines to your cart!`, 'success');
    onClose();
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">B2B Quick Order Pad</h2>
              <p className="text-xs text-blue-200">
                Rapid SKU-based bulk procurement for purchasing managers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          
          {!isApproved && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Wholesale quick order is unlocked for verified corporate accounts.</span>
              </div>
              <button
                onClick={onOpenRegister}
                className="bg-amber-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Apply for B2B Account
              </button>
            </div>
          )}

          {/* Matrix Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Product / SKU</th>
                  <th className="py-3 px-3">MOQ & Case Pack</th>
                  <th className="py-3 px-3 w-36">Quantity</th>
                  <th className="py-3 px-3">Wholesale Rate</th>
                  <th className="py-3 px-3 text-right">Line Total</th>
                  <th className="py-3 px-3 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rowDetails.map(item => {
                  if (!item) return null;
                  const { product } = item;
                  return (
                    <tr key={item.rowId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(item.rowId, e.target.value)}
                          className="w-full text-xs font-medium p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.sku} — {p.title}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-slate-600 font-medium block">
                          MOQ: <strong>{product.moq} {product.unit}s</strong>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Pack of {product.casePackSize} units
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <input
                            type="number"
                            min={product.moq}
                            step={product.casePackSize}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.rowId, parseInt(e.target.value, 10) || 0)}
                            className={`w-full text-xs font-bold p-2 border rounded-lg ${
                              !item.isMoqMet || !item.isCasePackMet
                                ? 'border-rose-400 bg-rose-50 text-rose-950'
                                : 'border-slate-300 bg-white'
                            }`}
                          />
                          {!item.isMoqMet && (
                            <span className="text-[10px] text-rose-600 font-semibold block">
                              Min {product.moq} units
                            </span>
                          )}
                          {!item.isCasePackMet && (
                            <span className="text-[10px] text-amber-700 font-semibold block">
                              Step of {product.casePackSize}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isApproved ? (
                          <>
                            <span className="font-extrabold text-blue-950 text-xs">
                              {formatCurrency(item.unitPrice)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/{product.unit}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">🔒 Locked</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {isApproved ? (
                          <span className="font-extrabold text-slate-900 text-xs">
                            {formatCurrency(item.lineTotal)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">🔒 Locked</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleRemoveRow(item.rowId)}
                          disabled={rows.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-20 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Add SKU Row</span>
            </button>

            <div className="text-right">
              <span className="text-xs text-slate-500 mr-2">
                Total for {totalItemsCount} units:
              </span>
              {isApproved ? (
                <span className="text-base font-extrabold text-slate-950">
                  {formatCurrency(totalOrderAmount)}
                </span>
              ) : (
                <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  🔒 Locked (B2B Registration Required)
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleAddAllToCart}
            disabled={rows.length === 0}
            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 transition"
          >
            {isApproved ? (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add Entire Batch to Wholesale Cart</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                <span>Register Business to View Prices & Order</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
