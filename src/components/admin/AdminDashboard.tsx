import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, B2BApplicationDetails, Order, Quote, B2BStatus, OrderStatus, QuoteStatus, UserRole, StoreSettings } from '../../types';
import { formatCurrency, validateGSTIN } from '../../utils/gstValidation';
import {
  X,
  ShieldCheck,
  Building2,
  Package,
  FileText,
  MessageSquareQuote,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit,
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Settings,
  MapPin,
  Save,
  Truck,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onViewInvoice }) => {
  const {
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    b2bApplications,
    updateB2BApplicationByAdmin,
    orders,
    updateOrderStatus,
    quotes,
    updateQuoteStatus,
    users,
    updateUserRole,
    storeSettings,
    updateStoreSettings,
    showToast,
    resetAllData,
    dbStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'products' | 'orders' | 'quotes' | 'customers' | 'settings'>('overview');

  // Filter states
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'needs_more_info' | 'approved' | 'rejected'>('all');
  const [orderFilter, setOrderFilter] = useState<'all' | 'D2C' | 'B2B'>('all');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  // Modals inside admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [requestInfoModalApp, setRequestInfoModalApp] = useState<B2BApplicationDetails | null>(null);
  const [requestInfoNote, setRequestInfoNote] = useState('');
  
  // Quote response modal
  const [respondingQuote, setRespondingQuote] = useState<Quote | null>(null);
  const [counterPrice, setCounterPrice] = useState<string>('');
  const [adminQuoteNote, setAdminQuoteNote] = useState<string>('');

  // New product form state
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdHsn, setNewProdHsn] = useState('85285200');
  const [newProdCategory, setNewProdCategory] = useState<'Electronics' | 'Office & Workspaces' | 'Packaging & Shipping' | 'Commercial Supplies'>('Electronics');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80');
  const [newProdRetailPrice, setNewProdRetailPrice] = useState<number>(9999);
  const [newProdMrp, setNewProdMrp] = useState<number>(14999);
  const [newProdWholesalePrice, setNewProdWholesalePrice] = useState<number>(7500);
  const [newProdStock, setNewProdStock] = useState<number>(100);
  const [newProdMoq, setNewProdMoq] = useState<number>(5);
  const [newProdCasePack, setNewProdCasePack] = useState<number>(2);
  const [newProdTaxRate, setNewProdTaxRate] = useState<number>(18);
  const [newProdUnit, setNewProdUnit] = useState('unit');

  // Store Settings Form State (GR Enterprises Meerut)
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...storeSettings });

  if (!isOpen) return null;

  // Filtered applications
  const filteredApps = b2bApplications.filter(app => {
    if (appFilter === 'all') return true;
    return app.status === appFilter;
  });

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true;
    return order.mode === orderFilter;
  });

  // Filtered products
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchProduct.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.category.toLowerCase().includes(searchProduct.toLowerCase())
  );

  // Filtered customers
  const filteredCustomers = users.filter(u => 
    u.name.toLowerCase().includes(searchCustomer.toLowerCase()) || 
    u.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    u.role.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const d2cOrdersCount = orders.filter(o => o.mode === 'D2C').length;
  const b2bOrdersCount = orders.filter(o => o.mode === 'B2B').length;
  const pendingAppsCount = b2bApplications.filter(a => a.status === 'pending').length;
  const pendingQuotesCount = quotes.filter(q => q.status === 'Submitted' || q.status === 'Under Review').length;
  const lowStockProducts = products.filter(p => p.stock < 25);

  const handleApproveApp = (appId: string) => {
    updateB2BApplicationByAdmin(
      appId,
      'approved',
      'Verified GSTIN against UP GST portal & MCA records. Sanctioned Net 30 payment terms from Meerut central hub.',
      500000,
      'Net 30'
    );
  };

  const handleRejectApp = (appId: string) => {
    updateB2BApplicationByAdmin(appId, 'rejected', 'Application rejected due to invalid GST registration.');
  };

  const handleSendRequestInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestInfoModalApp) return;
    if (!requestInfoNote.trim()) {
      showToast('Note Required', 'Please explain what additional details are needed.', 'warning');
      return;
    }
    updateB2BApplicationByAdmin(requestInfoModalApp.id, 'needs_more_info', requestInfoNote);
    setRequestInfoModalApp(null);
    setRequestInfoNote('');
  };

  const handleSendQuoteResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingQuote) return;
    const price = parseFloat(counterPrice);
    if (isNaN(price) || price <= 0) {
      showToast('Invalid Price', 'Please enter a valid counter quote price.', 'error');
      return;
    }
    updateQuoteStatus(
      respondingQuote.id,
      'Quoted',
      price,
      adminQuoteNote || 'Special commercial volume price offered from GR Enterprises Meerut center.'
    );
    setRespondingQuote(null);
    setCounterPrice('');
    setAdminQuoteNote('');
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdSku) {
      showToast('Validation Error', 'Product title and SKU are required.', 'error');
      return;
    }

    addProduct({
      sku: newProdSku.toUpperCase(),
      hsnCode: newProdHsn,
      title: newProdTitle,
      description: newProdDesc || 'Industrial commercial grade supply item from GR Enterprises Meerut hub.',
      category: newProdCategory,
      image: newProdImage,
      images: [newProdImage],
      retailPrice: newProdRetailPrice,
      mrp: newProdMrp,
      wholesalePrice: newProdWholesalePrice,
      priceTiers: [
        { minQuantity: newProdMoq, maxQuantity: newProdMoq * 3, pricePerUnit: Math.round(newProdWholesalePrice * 0.95), savingsPercentage: 25 },
        { minQuantity: newProdMoq * 3 + 1, maxQuantity: newProdMoq * 10, pricePerUnit: Math.round(newProdWholesalePrice * 0.88), savingsPercentage: 35 },
        { minQuantity: newProdMoq * 10 + 1, pricePerUnit: Math.round(newProdWholesalePrice * 0.80), savingsPercentage: 45 }
      ],
      moq: newProdMoq,
      casePackSize: newProdCasePack,
      stock: newProdStock,
      unit: newProdUnit,
      rating: 4.8,
      reviewsCount: 1,
      isRfqEligible: true,
      features: ['Factory Direct from GR Enterprises Meerut', 'Commercial Warranty', 'GST Input Credit Compliant'],
      specifications: { 'Origin': 'Meerut, UP', 'Dispatch': '24-48 Hours' },
      taxRatePercent: newProdTaxRate
    });

    setIsAddingProduct(false);
    // Reset form
    setNewProdTitle('');
    setNewProdSku('');
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(tempSettings);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-7xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-4 max-h-[96vh] flex flex-col">
        
        {/* Admin Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  GR Enterprises • Unified Master Admin Panel
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Meerut Headquarters
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                  dbStatus?.connected 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' 
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{dbStatus?.connected ? 'MongoDB Live' : 'Database Ready'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1 All-in-One Command Center: B2B KYC verification, catalog inventory, wholesale tiers, orders, RFQs & store settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetAllData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Reset all mock data to initial seeds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-100 px-4 sm:px-6 flex overflow-x-auto gap-1 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'applications'
                ? 'border-blue-600 text-blue-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>B2B KYC Applications</span>
            {pendingAppsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-950 font-bold">
                {pendingAppsCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-blue-600 text-blue-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Products & Wholesale Tiers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Orders & Dispatch</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'border-blue-600 text-blue-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-purple-600" />
            <span>RFQ Quotes</span>
            {pendingQuotesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-900 font-bold">
                {pendingQuotesCount} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'customers'
                ? 'border-blue-600 text-blue-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Customers & Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-900 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Meerut Store Settings</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-blue-300 text-[11px] sm:text-xs font-semibold">
                    <span>Gross Revenue</span>
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  </div>
                  <div className="text-base sm:text-2xl font-black truncate">{formatCurrency(totalRevenue)}</div>
                  <p className="text-[10px] sm:text-[11px] text-blue-200 line-clamp-1">D2C & B2B orders</p>
                </div>

                <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                    <span>Total Orders</span>
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div className="text-base sm:text-2xl font-black text-slate-900">{orders.length}</div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
                    {d2cOrdersCount} Retail • {b2bOrdersCount} B2B
                  </p>
                </div>

                <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                    <span>B2B KYC Apps</span>
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                  </div>
                  <div className="text-base sm:text-2xl font-black text-amber-600">{pendingAppsCount}</div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">GSTIN review</p>
                </div>

                <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                    <span>SKU Inventory</span>
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 shrink-0" />
                  </div>
                  <div className="text-base sm:text-2xl font-black text-slate-900">{products.length}</div>
                  <p className="text-[10px] sm:text-[11px] text-rose-600 font-medium line-clamp-1">
                    {lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock` : 'Healthy stock'}
                  </p>
                </div>
              </div>

              {/* Quick Actions Strip */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">GR Enterprises Fast Operations</h3>
                  <p className="text-xs text-slate-500">Quickly jump to key management tasks:</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="px-3 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Review B2B Apps ({pendingAppsCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setIsAddingProduct(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className="px-3 py-1.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition flex items-center gap-1.5"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>Respond to RFQs ({pendingQuotesCount})</span>
                  </button>
                </div>
              </div>

              {/* Business Location Info Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Registered Meerut Facility Details</span>
                  </h4>
                  <p className="font-bold text-slate-900">{storeSettings.legalEntityName}</p>
                  <p className="text-slate-600">{storeSettings.street}, {storeSettings.city} - {storeSettings.postalCode}, {storeSettings.state}</p>
                  <p className="mt-1 text-slate-700">GSTIN: <strong className="font-mono text-blue-900">{storeSettings.gstin}</strong> (State Code: {storeSettings.stateCode})</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Dispatch & Tax Jurisdiction</span>
                  </h4>
                  <p className="text-slate-600">All dispatches originate from <strong>Meerut Logistics Hub</strong>.</p>
                  <p className="text-slate-600 mt-1">Intrastate supplies to UP: <strong>CGST 9% + SGST 9%</strong>.</p>
                  <p className="text-slate-600">Interstate supplies outside UP: <strong>IGST 18%</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: B2B APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                  {(['all', 'pending', 'needs_more_info', 'approved', 'rejected'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setAppFilter(f)}
                      className={`px-3 py-1 rounded-lg capitalize font-semibold transition ${
                        appFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <span className="text-slate-500">
                  Found <strong>{filteredApps.length}</strong> applications
                </span>
              </div>

              <div className="space-y-4">
                {filteredApps.map(app => {
                  const gstCheck = validateGSTIN(app.gstin);
                  return (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{app.businessName}</h3>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              app.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-900'
                                : app.status === 'pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : app.status === 'needs_more_info'
                                    ? 'bg-rose-100 text-rose-900'
                                    : 'bg-slate-200 text-slate-700'
                            }`}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {app.businessType} • Applied on {app.appliedDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {app.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveApp(app.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve (Net 30)</span>
                            </button>
                          )}

                          {app.status !== 'needs_more_info' && (
                            <button
                              onClick={() => {
                                setRequestInfoModalApp(app);
                                setRequestInfoNote(app.adminNotes || '');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold transition flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Request Info</span>
                            </button>
                          )}

                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleRejectApp(app.id)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs transition"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">GSTIN / Verification</span>
                          <span className="font-mono font-bold text-blue-900 block">{app.gstin}</span>
                          <span className={`text-[10px] font-semibold ${gstCheck.isValid ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {gstCheck.isValid ? `✓ Format Valid (${gstCheck.stateName})` : '✕ Invalid GSTIN structure'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Person</span>
                          <span className="font-semibold text-slate-800 block">{app.contactName}</span>
                          <span className="text-slate-500 text-[11px] block">{app.contactEmail} • {app.contactPhone}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Attached Document</span>
                          <span className="text-slate-700 font-mono text-[11px] flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            {app.resaleCertFileName || 'No document attached'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          <strong>Registered Shop Address:</strong> {app.shopAddress.street}, {app.shopAddress.city}, {app.shopAddress.state} - {app.shopAddress.postalCode}
                        </p>
                        {app.adminNotes && (
                          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 font-medium">
                            <strong>Compliance Note:</strong> "{app.adminNotes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS & INVENTORY & WHOLESALE TIERS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search SKU, title, category..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product to Catalog</span>
                </button>
              </div>

              {/* Product Table */}
              <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item / SKU</th>
                      <th className="py-2.5 px-3">Stock Units</th>
                      <th className="py-2.5 px-3">Retail Price</th>
                      <th className="py-2.5 px-3">Wholesale Base</th>
                      <th className="py-2.5 px-3">MOQ & Pack</th>
                      <th className="py-2.5 px-3">Top Bulk Tier</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map(p => {
                      const tier3 = p.priceTiers[p.priceTiers.length - 1];
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                              <div>
                                <span className="font-semibold text-slate-900 block truncate max-w-xs">{p.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} • HSN: {p.hsnCode} ({p.taxRatePercent}% GST)</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateProduct({ ...p, stock: Math.max(0, p.stock - 5) })}
                                className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold flex items-center justify-center text-slate-700"
                                title="Reduce stock by 5"
                              >
                                -
                              </button>
                              <span className={`font-bold px-1 ${p.stock < 20 ? 'text-rose-600' : 'text-slate-800'}`}>
                                {p.stock}
                              </span>
                              <button
                                onClick={() => updateProduct({ ...p, stock: p.stock + 10 })}
                                className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold flex items-center justify-center text-slate-700"
                                title="Add 10 units"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-bold text-emerald-700">
                            {formatCurrency(p.retailPrice)}
                          </td>

                          <td className="py-3 px-3 font-extrabold text-blue-950">
                            {formatCurrency(p.wholesalePrice)}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-700 block">MOQ: {p.moq} {p.unit}s</span>
                            <span className="text-[10px] text-slate-400">Pack of {p.casePackSize}</span>
                          </td>

                          <td className="py-3 px-3">
                            {tier3 ? (
                              <div>
                                <span className="font-bold text-slate-900">{formatCurrency(tier3.pricePerUnit)}</span>
                                <span className="text-[10px] text-emerald-700 block">({tier3.minQuantity}+ units)</span>
                              </div>
                            ) : '—'}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3 text-blue-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-1 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & DISPATCH */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['all', 'D2C', 'B2B'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setOrderFilter(tab)}
                      className={`px-3 py-1 rounded-md font-semibold transition ${
                        orderFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      {tab === 'all' ? 'All Orders' : `${tab} Orders`}
                    </button>
                  ))}
                </div>

                <span className="text-slate-500">Showing {filteredOrders.length} orders</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Customer / Legal Entity</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {order.orderNumber}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">
                            {order.businessDetails?.businessName || order.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {order.businessDetails?.gstin ? `GST: ${order.businessDetails.gstin}` : order.customerEmail}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.mode === 'B2B' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {order.mode}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600">{order.date}</td>

                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="text-xs p-1 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onViewInvoice(order)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                          >
                            Tax Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: RFQ QUOTES */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              <div className="space-y-4">
                {quotes.map(quote => (
                  <div
                    key={quote.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{quote.quoteNumber}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            quote.status === 'Quoted' || quote.status === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-purple-100 text-purple-900'
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {quote.businessName} • Requested on {quote.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {quote.status !== 'Accepted' && (
                          <button
                            onClick={() => {
                              setRespondingQuote(quote);
                              setCounterPrice(quote.offeredPricePerUnit ? quote.offeredPricePerUnit.toString() : '');
                              setAdminQuoteNote(quote.adminResponseNote || '');
                            }}
                            className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                          >
                            Counter / Set Quote Price
                          </button>
                        )}

                        <select
                          value={quote.status}
                          onChange={(e) => updateQuoteStatus(quote.id, e.target.value as QuoteStatus)}
                          className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Item</span>
                        <span className="font-semibold text-slate-900 block">{quote.productTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {quote.sku}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Volume Requested</span>
                        <span className="font-bold text-slate-900 text-sm">{quote.requestedQuantity} units</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Client Target Price</span>
                        <span className="font-bold text-slate-800">
                          {quote.targetPricePerUnit ? formatCurrency(quote.targetPricePerUnit) : 'Not specified'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">GR Offered Rate</span>
                        <span className="font-extrabold text-blue-900 text-sm">
                          {quote.offeredPricePerUnit ? formatCurrency(quote.offeredPricePerUnit) : 'Pending Offer'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p><strong>Client Notes:</strong> "{quote.notes}"</p>
                      {quote.adminResponseNote && (
                        <p className="text-blue-900 font-medium"><strong>GR Staff Response:</strong> "{quote.adminResponseNote}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS & ROLES */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search customer name, email, role..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <span className="text-xs text-slate-500">Total Users: {users.length}</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Customer Name</th>
                      <th className="py-2.5 px-3">Email & Contact</th>
                      <th className="py-2.5 px-3">Business / GST Profile</th>
                      <th className="py-2.5 px-3">Current Role</th>
                      <th className="py-2.5 px-3 text-right">Modify Permission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold">
                                {user.name[0]}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 block">{user.name}</span>
                                {user.authProvider === 'google' && (
                                  <span className="inline-flex items-center gap-1 text-[9px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
                                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    Google
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">ID: {user.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 block">{user.email}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium block">
                            {user.phone ? `📞 ${user.phone}` : 'No phone registered'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {user.businessProfile ? (
                            <div>
                              <span className="font-semibold text-blue-900 block">{user.businessProfile.businessName}</span>
                              <span className="text-[10px] font-mono text-slate-500">GSTIN: {user.businessProfile.gstin}</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-700 font-medium block">Retail Customer</span>
                              {user.savedAddresses?.[0] ? (
                                <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                                  📍 {user.savedAddresses[0].street}, {user.savedAddresses[0].city} ({user.savedAddresses[0].postalCode})
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">No saved address</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-900'
                              : user.role === 'b2b_approved'
                                ? 'bg-emerald-100 text-emerald-900'
                                : user.role === 'b2b_pending'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-slate-200 text-slate-700'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                            className="text-xs p-1 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            <option value="d2c_customer">Retail Customer</option>
                            <option value="b2b_pending">B2B Pending</option>
                            <option value="b2b_needs_info">B2B Needs Info</option>
                            <option value="b2b_approved">B2B Approved</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: MEERUT STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">GR Enterprises Meerut Facility Configuration</h4>
                  <p className="mt-0.5 text-blue-900">
                    Changes here immediately update all storefront banners, legal footers, and official GST tax invoices generated for orders.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Store / Brand Name</label>
                    <input
                      type="text"
                      value={tempSettings.companyName}
                      onChange={(e) => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Legal Entity Name</label>
                    <input
                      type="text"
                      value={tempSettings.legalEntityName}
                      onChange={(e) => setTempSettings({ ...tempSettings, legalEntityName: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-bold bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Registered Street Address</label>
                    <input
                      type="text"
                      value={tempSettings.street}
                      onChange={(e) => setTempSettings({ ...tempSettings, street: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={tempSettings.city}
                      onChange={(e) => setTempSettings({ ...tempSettings, city: e.target.value })}
                      className="w-full p-2.5 border rounded-xl font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State & State Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempSettings.state}
                        onChange={(e) => setTempSettings({ ...tempSettings, state: e.target.value })}
                        className="flex-1 p-2.5 border rounded-xl font-bold bg-white"
                      />
                      <input
                        type="text"
                        value={tempSettings.stateCode}
                        onChange={(e) => setTempSettings({ ...tempSettings, stateCode: e.target.value })}
                        className="w-16 p-2.5 border rounded-xl font-mono text-center bg-white font-bold"
                        title="State Code (09 for UP)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Postal PIN Code</label>
                    <input
                      type="text"
                      value={tempSettings.postalCode}
                      onChange={(e) => setTempSettings({ ...tempSettings, postalCode: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Supplier GSTIN (15 chars)</label>
                    <input
                      type="text"
                      value={tempSettings.gstin}
                      onChange={(e) => setTempSettings({ ...tempSettings, gstin: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 border rounded-xl font-mono font-bold text-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Support Phone</label>
                    <input
                      type="text"
                      value={tempSettings.phone}
                      onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Support Email</label>
                    <input
                      type="email"
                      value={tempSettings.email}
                      onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Free Delivery Threshold (₹)</label>
                    <input
                      type="number"
                      value={tempSettings.freeShippingThreshold}
                      onChange={(e) => setTempSettings({ ...tempSettings, freeShippingThreshold: parseInt(e.target.value, 10) || 1000 })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Default GST Tax %</label>
                    <input
                      type="number"
                      value={tempSettings.defaultGstPercent}
                      onChange={(e) => setTempSettings({ ...tempSettings, defaultGstPercent: parseInt(e.target.value, 10) || 18 })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Meerut Hub Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* MODAL: Edit Product Pricing & Inventory */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Edit Rules & Tiers: {editingProduct.title}
                </h3>
                <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Retail Price (D2C) ₹</label>
                  <input
                    type="number"
                    value={editingProduct.retailPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Wholesale Base (B2B) ₹</label>
                  <input
                    type="number"
                    value={editingProduct.wholesalePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-lg font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Minimum Order Qty (MOQ)</label>
                  <input
                    type="number"
                    value={editingProduct.moq}
                    onChange={(e) => setEditingProduct({ ...editingProduct, moq: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Case Pack Size</label>
                  <input
                    type="number"
                    value={editingProduct.casePackSize}
                    onChange={(e) => setEditingProduct({ ...editingProduct, casePackSize: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Applicable GST Rate %</label>
                  <input
                    type="number"
                    value={editingProduct.taxRatePercent}
                    onChange={(e) => setEditingProduct({ ...editingProduct, taxRatePercent: parseInt(e.target.value, 10) || 18 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Wholesale Tiers */}
              <div>
                <span className="block text-[11px] font-bold text-slate-800 uppercase mb-2">Wholesale Tier Breakdown</span>
                <div className="space-y-2">
                  {editingProduct.priceTiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border">
                      <span className="font-semibold text-slate-700 w-28">Tier {idx + 1} ({tier.minQuantity}+):</span>
                      <input
                        type="number"
                        value={tier.pricePerUnit}
                        onChange={(e) => {
                          const updatedTiers = [...editingProduct.priceTiers];
                          updatedTiers[idx].pricePerUnit = parseFloat(e.target.value) || 0;
                          setEditingProduct({ ...editingProduct, priceTiers: updatedTiers });
                        }}
                        className="w-28 p-1 border rounded bg-white text-xs font-bold"
                      />
                      <span className="text-[11px] text-slate-500">₹/unit ({tier.savingsPercentage}% off)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateProduct(editingProduct);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2 bg-blue-900 text-white rounded-xl font-bold shadow"
                >
                  Save Rules
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Add New Product */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Add New Product to GR Enterprises Catalog
                </h3>
                <button onClick={() => setIsAddingProduct(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewProduct} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={newProdTitle}
                      onChange={(e) => setNewProdTitle(e.target.value)}
                      placeholder="e.g. GR Pro Wireless Barcode Scanner"
                      className="w-full p-2 border rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Master SKU *</label>
                    <input
                      type="text"
                      required
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                      placeholder="e.g. GRE-SCN-WL1"
                      className="w-full p-2 border rounded-lg uppercase font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">HSN Code</label>
                    <input
                      type="text"
                      value={newProdHsn}
                      onChange={(e) => setNewProdHsn(e.target.value)}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as any)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Office & Workspaces">Office & Workspaces</option>
                      <option value="Packaging & Shipping">Packaging & Shipping</option>
                      <option value="Commercial Supplies">Commercial Supplies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Unit of Measure</label>
                    <input
                      type="text"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      placeholder="e.g. unit / box / pack"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Retail Price (D2C) ₹</label>
                    <input
                      type="number"
                      value={newProdRetailPrice}
                      onChange={(e) => setNewProdRetailPrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Wholesale Base (B2B) ₹</label>
                    <input
                      type="number"
                      value={newProdWholesalePrice}
                      onChange={(e) => setNewProdWholesalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded-lg font-bold text-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Minimum Order Qty (MOQ)</label>
                    <input
                      type="number"
                      value={newProdMoq}
                      onChange={(e) => setNewProdMoq(parseInt(e.target.value, 10) || 1)}
                      className="w-full p-2 border rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Case Pack Size</label>
                    <input
                      type="number"
                      value={newProdCasePack}
                      onChange={(e) => setNewProdCasePack(parseInt(e.target.value, 10) || 1)}
                      className="w-full p-2 border rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Initial Stock Quantity</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">GST Tax Rate %</label>
                    <input
                      type="number"
                      value={newProdTaxRate}
                      onChange={(e) => setNewProdTaxRate(parseInt(e.target.value, 10) || 18)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="px-4 py-2 border rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-900 text-white rounded-xl font-bold shadow"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Request More Info prompt */}
        {requestInfoModalApp && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Request Additional Information from {requestInfoModalApp.businessName}</span>
              </h3>
              <p className="text-slate-500">
                Specify what documents or address verification details the applicant must provide. Their account will move to <strong>Needs More Information</strong> status.
              </p>

              <textarea
                rows={4}
                value={requestInfoNote}
                onChange={(e) => setRequestInfoNote(e.target.value)}
                placeholder="e.g. Please upload an authorized copy of GST Certificate REG-06 showing principal place of business matching your registered shop address."
                className="w-full p-3 border border-slate-300 rounded-xl"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRequestInfoModalApp(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequestInfo}
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow"
                >
                  Send Request to Applicant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Counter Offer Quote */}
        {respondingQuote && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-blue-600" />
                <span>Formulate Quote Offer for {respondingQuote.quoteNumber}</span>
              </h3>
              <p className="text-slate-500">
                Product: <strong>{respondingQuote.productTitle}</strong> (Qty: {respondingQuote.requestedQuantity} units)
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Offered Price Per Unit (₹) *
                </label>
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder="e.g. 620"
                  className="w-full p-2.5 border rounded-xl font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Response & Delivery Note (Meerut Hub)
                </label>
                <textarea
                  rows={3}
                  value={adminQuoteNote}
                  onChange={(e) => setAdminQuoteNote(e.target.value)}
                  placeholder="Include freight terms, delivery timeline from Meerut corridor..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRespondingQuote(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuoteResponse}
                  className="px-5 py-2 bg-blue-900 text-white font-bold rounded-xl shadow"
                >
                  Submit Quote Offer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
