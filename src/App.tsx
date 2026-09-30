import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { CartDrawer } from './components/common/CartDrawer';
import { CustomerAuthModal } from './components/common/CustomerAuthModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';

// B2B Wholesale Components
import { B2BHero } from './components/b2b/B2BHero';
import { B2BProductCard } from './components/b2b/B2BProductCard';
import { B2BProductDetailModal } from './components/b2b/B2BProductDetailModal';
import { B2BCheckoutModal } from './components/b2b/B2BCheckoutModal';
import { B2BRegistrationModal } from './components/b2b/B2BRegistrationModal';
import { B2BApplicationStatusModal } from './components/b2b/B2BApplicationStatusModal';
import { B2BQuickOrderPad } from './components/b2b/B2BQuickOrderPad';
import { B2BQuoteModal } from './components/b2b/B2BQuoteModal';
import { B2BQuotesListModal } from './components/b2b/B2BQuotesListModal';
import { B2BInvoiceModal } from './components/b2b/B2BInvoiceModal';

// Order History & Success Modals (Commercial Wholesale Invoices & Orders)
import { B2BOrderSuccessModal } from './components/b2b/B2BOrderSuccessModal';
import { B2BOrderHistoryModal } from './components/b2b/B2BOrderHistoryModal';

// Admin Command Dashboard
import { AdminDashboard } from './components/admin/AdminDashboard';

import { Product, Order } from './types';
import { Building2, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

const MainStorefront: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeModal,
    setActiveModal,
    selectedInvoiceOrder,
    setSelectedInvoiceOrder,
    selectedQuoteProduct,
    setSelectedQuoteProduct,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  // Local modal states
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isB2BCheckoutOpen, setIsB2BCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isQuotesModalOpen, setIsQuotesModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [latestConfirmedOrder, setLatestConfirmedOrder] = useState<Order | null>(null);

  // Filter products by category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetail = (product: Product) => {
    setSelectedProductForDetail(product);
  };

  const handleOpenQuote = (product: Product) => {
    setSelectedQuoteProduct(product);
    setActiveModal('b2b_quote');
  };

  const handleOpenInvoice = (order: Order) => {
    setSelectedInvoiceOrder(order);
    setActiveModal('invoice_view');
  };

  const handleOrderSuccess = (order: Order) => {
    setIsB2BCheckoutOpen(false);
    setLatestConfirmedOrder(order);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
      {/* 1. Main Storefront Navbar */}
      <Navbar
        onOpenOrders={() => setIsOrderHistoryOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onOpenQuickOrder={() => setActiveModal('b2b_quick_order')}
        onOpenQuotes={() => setIsQuotesModalOpen(true)}
        onOpenB2BStatus={() => setActiveModal('b2b_status')}
      />

      {/* 2. B2B Wholesale Hero Banner */}
      <main className="flex-1">
        <B2BHero
          onOpenRegister={() => setActiveModal('b2b_register')}
          onOpenStatus={() => setActiveModal('b2b_status')}
          onOpenQuickOrder={() => setActiveModal('b2b_quick_order')}
        />

        {/* 3. Wholesale Product Catalog Section */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Section Header & View Cues */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Wholesale Commercial Catalog (Meerut Hub)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tiered volume pricing, MOQ, case packs, and GST Input Tax Credit (ITC) compliant commercial supplies
              </p>
            </div>

            {/* Active filters & results count */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {searchQuery && (
                <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-black font-bold">✕</button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-black font-bold">✕</button>
                </span>
              )}
              <span>Showing <strong>{filteredProducts.length}</strong> items</span>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                No catalog items match your search "{searchQuery}" or selected category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <B2BProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={handleOpenDetail}
                  onOpenQuote={handleOpenQuote}
                  onOpenRegister={() => setActiveModal('b2b_register')}
                />
              ))}
            </div>
          )}

        </section>
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Fixed Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenOrders={() => setIsOrderHistoryOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onFocusSearch={() => {
          const mobileInput = document.getElementById('mobile-search-input');
          if (mobileInput) {
            mobileInput.focus();
            mobileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />

      {/* Global Modals & Drawers */}
      
      {/* Flyout Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setIsB2BCheckoutOpen(true);
        }}
      />

      {/* B2B Product Detail Modal */}
      {selectedProductForDetail && (
        <B2BProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onOpenQuote={handleOpenQuote}
          onOpenRegister={() => setActiveModal('b2b_register')}
        />
      )}

      {/* Dedicated B2B Wholesale Checkout Modal */}
      <B2BCheckoutModal
        isOpen={isB2BCheckoutOpen}
        onClose={() => setIsB2BCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Wholesale Order Confirmation Modal */}
      <B2BOrderSuccessModal
        order={latestConfirmedOrder}
        onClose={() => setLatestConfirmedOrder(null)}
        onViewInvoice={handleOpenInvoice}
      />

      {/* Commercial Wholesale Order History & Tax Invoices Modal */}
      <B2BOrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onViewInvoice={handleOpenInvoice}
      />

      {/* B2B Registration Modal */}
      <B2BRegistrationModal
        isOpen={activeModal === 'b2b_register'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          setActiveModal('b2b_status');
        }}
      />

      {/* B2B Application Status Modal */}
      <B2BApplicationStatusModal
        isOpen={activeModal === 'b2b_status'}
        onClose={() => setActiveModal(null)}
      />

      {/* B2B Quick Order Pad */}
      <B2BQuickOrderPad
        isOpen={activeModal === 'b2b_quick_order'}
        onClose={() => setActiveModal(null)}
        onOpenRegister={() => setActiveModal('b2b_register')}
      />

      {/* B2B RFQ Quote Modal */}
      <B2BQuoteModal
        product={selectedQuoteProduct}
        isOpen={activeModal === 'b2b_quote'}
        onClose={() => {
          setActiveModal(null);
          setSelectedQuoteProduct(null);
        }}
      />

      {/* B2B RFQ User Quotes List Modal */}
      <B2BQuotesListModal
        isOpen={isQuotesModalOpen}
        onClose={() => setIsQuotesModalOpen(false)}
      />

      {/* Official Tax Invoice Viewer Modal */}
      <B2BInvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => {
          setSelectedInvoiceOrder(null);
          if (activeModal === 'invoice_view') setActiveModal(null);
        }}
      />

      {/* Staff Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onViewInvoice={handleOpenInvoice}
      />

      {/* Website Business Account Sign-Up & Sign-In Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Animated Toast System */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainStorefront />
    </AppProvider>
  );
}
