import React from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/gstValidation';
import { useApp } from '../../context/AppContext';
import { X, Printer, Building2, CheckCircle2 } from 'lucide-react';

interface B2BInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const B2BInvoiceModal: React.FC<B2BInvoiceModalProps> = ({ order, onClose }) => {
  const { storeSettings } = useApp();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Seller is in Uttar Pradesh (State Code 09)
  const SELLER = {
    name: storeSettings.legalEntityName || 'GR Enterprises Private Limited',
    address: `${storeSettings.street}, ${storeSettings.city} - ${storeSettings.postalCode}, ${storeSettings.state}, India`,
    gstin: storeSettings.gstin || '09AABCG1234F1Z8',
    pan: storeSettings.panNumber || 'AABCG1234F',
    state: storeSettings.state || 'Uttar Pradesh',
    stateCode: storeSettings.stateCode || '09',
    cin: storeSettings.cin || 'U72200UP2026PTC109922'
  };

  // If buyer is outside Uttar Pradesh, it is interstate (IGST)
  const isInterstate = order.shippingAddress.state.toLowerCase() !== 'uttar pradesh';

  const formatAmountWords = (num: number): string => {
    return `${Math.round(num).toLocaleString('en-IN')} Rupees Only`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 max-h-[95vh] flex flex-col">
        
        {/* Top toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-950 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              GR Enterprises — Official Tax Invoice ({order.invoiceNumber})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Container */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-10 bg-white text-slate-900 printable-invoice text-xs">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  ORIGINAL FOR RECIPIENT
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">TAX INVOICE</h1>
                <p className="text-[11px] text-slate-500 font-medium">Issued under Section 31 of CGST Act, 2017</p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-blue-900 tracking-tight">GR Enterprises</span>
                <p className="text-[10px] text-slate-500">Meerut Hub • CIN: {SELLER.cin}</p>
              </div>
            </div>
          </div>

          {/* Meta Information Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Invoice Number</span>
              <span className="font-mono font-bold text-slate-900">{order.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Invoice Date</span>
              <span className="font-semibold text-slate-900">{order.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Order Reference</span>
              <span className="font-mono text-slate-900">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Mode</span>
              <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Seller and Buyer Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            
            {/* Supplier / Seller (GR Enterprises, Meerut) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-700 block tracking-wider">
                Supplier Details (Seller)
              </span>
              <p className="font-bold text-slate-900 text-xs">{SELLER.name}</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">{SELLER.address}</p>
              <div className="pt-2 text-[11px] space-y-0.5 border-t border-slate-200">
                <p><strong>GSTIN:</strong> <span className="font-mono font-bold text-blue-900">{SELLER.gstin}</span></p>
                <p><strong>PAN:</strong> <span className="font-mono">{SELLER.pan}</span></p>
                <p><strong>State & Code:</strong> {SELLER.state} (Code: {SELLER.stateCode})</p>
              </div>
            </div>

            {/* Recipient / Buyer */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                Billed To (Recipient)
              </span>
              <p className="font-bold text-slate-900 text-xs">
                {order.businessDetails?.businessName || order.customerName}
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {order.billingAddress.street}, {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.postalCode}, {order.billingAddress.country}
              </p>
              <div className="pt-2 text-[11px] space-y-0.5 border-t border-slate-200">
                {order.businessDetails?.gstin ? (
                  <p className="text-blue-900 font-bold">
                    <strong>Buyer GSTIN:</strong> <span className="font-mono">{order.businessDetails.gstin}</span>
                  </p>
                ) : (
                  <p className="text-slate-500">Unregistered Consumer (B2C Retail)</p>
                )}
                <p><strong>Contact:</strong> {order.customerEmail} • {order.customerPhone}</p>
                <p><strong>Place of Supply:</strong> {order.shippingAddress.state}</p>
              </div>
            </div>

          </div>

          {/* Itemized Goods Table */}
          <div className="border border-slate-300 rounded-xl overflow-x-auto mb-6">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Description of Goods</th>
                  <th className="py-2.5 px-3">HSN/SAC</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value</th>
                  {isInterstate ? (
                    <th className="py-2.5 px-3 text-right">IGST (18%)</th>
                  ) : (
                    <>
                      <th className="py-2.5 px-3 text-right">CGST (9%)</th>
                      <th className="py-2.5 px-3 text-right">SGST (9%)</th>
                    </>
                  )}
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, index) => {
                  const lineTax = item.taxAmount;
                  const cgstLine = isInterstate ? 0 : lineTax / 2;
                  const sgstLine = isInterstate ? 0 : lineTax / 2;
                  const igstLine = isInterstate ? lineTax : 0;
                  const lineTotalWithTax = item.totalPrice + lineTax;

                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block">{item.productTitle}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          SKU: {item.sku} {item.variantName ? `(${item.variantName})` : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{item.hsnCode}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity} {item.unit}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{formatCurrency(item.totalPrice)}</td>
                      
                      {isInterstate ? (
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatCurrency(igstLine)}</td>
                      ) : (
                        <>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatCurrency(cgstLine)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatCurrency(sgstLine)}</td>
                        </>
                      )}

                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(lineTotalWithTax)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Grand Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mb-8">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Amount in Words</span>
              <p className="font-bold text-slate-800 italic">{formatAmountWords(order.totalAmount)}</p>
              
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p>Tax is payable on reverse charge basis: <strong>NO</strong></p>
                <p>Goods dispatched from: <strong>Meerut Logistics Fulfillment Center (UP)</strong></p>
                <p>Certified that the particulars given above are true and correct.</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
              <div className="flex justify-between text-slate-600">
                <span>Total Taxable Value</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal - order.discountAmount)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Commercial Discount</span>
                  <span className="font-semibold">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              {isInterstate ? (
                <div className="flex justify-between text-slate-600">
                  <span>IGST (18% Integrated Tax)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(order.taxBreakdown?.igst || order.taxAmount)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9% Central Tax)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(order.taxBreakdown?.cgst || order.taxAmount / 2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9% State Tax)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(order.taxBreakdown?.sgst || order.taxAmount / 2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping & Freight</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                <span>Invoice Total</span>
                <span className="text-blue-900">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-slate-300 flex justify-between items-end">
            <div className="text-[10px] text-slate-400 space-y-1">
              <p>This is a computer generated tax invoice issued by GR Enterprises.</p>
              <p>Place of Origin: Meerut, Uttar Pradesh. Subject to Meerut jurisdiction.</p>
            </div>

            <div className="text-right">
              <div className="w-44 border-b border-slate-400 pb-1 mb-1">
                <span className="text-[9px] font-mono text-slate-400 block">Digitally Signed By</span>
                <span className="font-bold text-xs text-slate-900">GR Enterprises Pvt Ltd</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Authorised Signatory (Meerut Desk)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
