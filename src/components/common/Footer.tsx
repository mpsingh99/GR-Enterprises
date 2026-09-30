import React from 'react';
import { Building2, ShieldCheck, FileText, MapPin, Phone, Mail, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveModal, storeSettings } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Value props banner - B2B Wholesale Focus */}
      <div className="border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">B2B Wholesale Portal</h4>
              <p className="text-xs text-slate-400">Tiered bulk discounts up to 45% & volume case packs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Corporate Credit Terms</h4>
              <p className="text-xs text-slate-400">Net-30 corporate invoicing terms for approved businesses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">GST Input Tax Credit</h4>
              <p className="text-xs text-slate-400">UP GSTIN 09, itemized HSN codes, CGST/SGST/IGST breakdown</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Meerut Logistics Hub</h4>
              <p className="text-xs text-slate-400">Audited KYC verification & fast North India pallet dispatch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base bg-gradient-to-br from-blue-600 to-indigo-900">
                GR
              </div>
              <span className="font-extrabold text-lg text-white">GR Enterprises</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Integrated commercial sourcing and industrial procurement partner headquartered in Meerut, supplying bulk office electronics, industrial packaging, and enterprise workspaces.
            </p>
            
            {/* Meerut Corporate Registration Details */}
            <div className="text-[11px] text-slate-400 border border-slate-800 bg-slate-950 p-3 rounded-xl space-y-1.5">
              <p className="text-white font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{storeSettings.street}, {storeSettings.city}</span>
              </p>
              <p className="pl-5 text-slate-400">{storeSettings.city} - {storeSettings.postalCode}, {storeSettings.state}, India</p>
              <div className="pt-1.5 border-t border-slate-800 text-[10px] space-y-0.5">
                <p><strong>GSTIN:</strong> <span className="font-mono text-blue-300">{storeSettings.gstin}</span> (State Code: 09 - UP)</p>
                <p><strong>CIN:</strong> {storeSettings.cin}</p>
                <p><strong>PAN:</strong> {storeSettings.panNumber}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Wholesale Procurement */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Wholesale Procurement</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#catalog" className="hover:text-white transition">Bulk Products & Volume Tiers</a></li>
              <li><button onClick={() => setActiveModal('b2b_register')} className="text-blue-400 hover:text-blue-300 font-semibold transition">Apply for Business Account (GSTIN)</button></li>
              <li><button onClick={() => setActiveModal('b2b_quick_order')} className="hover:text-white transition">Quick Order Bulk Matrix</button></li>
              <li><a href="#catalog" className="hover:text-white transition">Custom Bulk Quote (RFQ) Process</a></li>
              <li><a href="#compliance" className="hover:text-white transition">Net-30 Corporate Invoicing Terms</a></li>
            </ul>
          </div>

          {/* Column 3: Commercial Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Commercial Compliance</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#compliance" className="hover:text-white transition">GST E-Invoicing & E-Way Bill</a></li>
              <li><a href="#compliance" className="hover:text-white transition">Commercial Procurement Terms</a></li>
              <li><a href="#compliance" className="hover:text-white transition">B2B Vendor KYC Verification</a></li>
              <li><a href="#compliance" className="hover:text-white transition">Input Tax Credit (ITC) Documentation</a></li>
              <li><a href="#compliance" className="hover:text-white transition">North India Pallet Freight Logistics</a></li>
            </ul>
          </div>

          {/* Column 4: Commercial Desk (Meerut) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Commercial Desk (Meerut)
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{storeSettings.phone}</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{storeSettings.email}</span>
              </li>
              <li className="text-[11px] text-slate-400 pt-1">
                <strong>Dispatch Center:</strong> Sector 3 Industrial Area, Meerut, UP 250002
              </li>
              <li><span className="text-slate-500">Official Wholesale Supplier • UP 09</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 GR Enterprises Private Limited. All rights reserved. Meerut, Uttar Pradesh, India.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>PCI-DSS Compliant</span>
            <span>•</span>
            <span>GST Verified Supplier</span>
            <span>•</span>
            <span>256-bit SSL Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
