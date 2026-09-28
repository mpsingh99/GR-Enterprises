import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PersonaSwitcher } from './components/common/PersonaSwitcher';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { CartDrawer } from './components/common/CartDrawer';
import { CustomerAuthModal } from './components/common/CustomerAuthModal';
import { ExperienceGateModal } from './components/common/ExperienceGateModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';

// D2C Components
import { D2CHero } from './components/d2c/D2CHero';
import { D2CProductCard } from './components/d2c/D2CProductCard';
import { D2CProductDetailModal } from './components/d2c/D2CProductDetailModal';
import { D2CCheckoutModal } from './components/d2c/D2CCheckoutModal';
import { OrderSuccessModal } from './components/d2c/OrderSuccessModal';
import { OrderHistoryModal } from './components/d2c/OrderHistoryModal';

// B2B Components
import { B2BHero } from './components/b2b/B2BHero';
import { B2BProductCard } from './components/b2b/B2BProductCard';
import { B2BProductDetailModal } from './components/b2b/B2BProductDetailModal';
import { B2BRegistrationModal } from './components/b2b/B2BRegistrationModal';
import { B2BApplicationStatusModal } from './components/b2b/B2BApplicationStatusModal';
import { B2BQuickOrderPad } from './components/b2b/B2BQuickOrderPad';
import { B2BQuoteModal } from './components/b2b/B2BQuoteModal';
import { B2BQuotesListModal } from './components/b2b/B2BQuotesListModal';
import { B2BInvoiceModal } from './components/b2b/B2BInvoiceModal';

// Admin Component
import { AdminDashboard } from './components/admin/AdminDashboard';

import { Product, Order } from './types';
import { ShoppingBag, Building2, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

const MainStorefront: React.FC = () => {
  const {
    mode,
    setMode,
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeModal,
    setActiveModal,
    selectedProductId,
    setSelectedProductId,
    selectedInvoiceOrder,
    setSelectedInvoiceOrder,
    selectedQuoteProduct,
    setSelectedQuoteProduct,
    isAuthModalOpen,
    setIsAuthModalOpen,
    showToast
  } = useApp();

  // Local modal states
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isD2CCheckoutOpen, setIsD2CCheckoutOpen] = useState(false);
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
    setIsD2CCheckoutOpen(false);
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

      {/* 3. Hero Banner (Switches based on D2C vs B2B) */}
      <main className="flex-1">
        {mode === 'D2C' ? (
          <D2CHero />
        ) : (
          <B2BHero
            onOpenRegister={() => setActiveModal('b2b_register')}
            onOpenStatus={() => setActiveModal('b2b_status')}
            onOpenQuickOrder={() => setActiveModal('b2b_quick_order')}
          />
        )}

        {/* 4. Product Catalog Section */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Section Header & View Cues */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${mode === 'B2B' ? 'bg-blue-600' : 'bg-emerald-500'}`}></span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {mode === 'B2B' ? 'Wholesale Commercial Catalog' : 'Direct Retail Storefront'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'B2B'
                  ? 'Bulk pricing tiers, case packs, and corporate invoice eligible products'
                  : 'Fast doorstep delivery, consumer warranty, and flexible payment options'}
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
              {filteredProducts.map(product => {
                if (mode === 'D2C') {
                  return (
                    <D2CProductCard
                      key={product.id}
                      product={product}
                      onOpenDetail={handleOpenDetail}
                    />
                  );
                } else {
                  return (
                    <B2BProductCard
                      key={product.id}
                      product={product}
                      onOpenDetail={handleOpenDetail}
                      onOpenQuote={handleOpenQuote}
                      onOpenRegister={() => setActiveModal('b2b_register')}
                    />
                  );
                }
              })}
            </div>
          )}

        </section>
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Fixed Mobile Bottom Navigation Bar */}
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
          if (mode === 'D2C') {
            setIsD2CCheckoutOpen(true);
          } else {
            // For B2B, checkout also uses D2C/B2B flow
            setIsD2CCheckoutOpen(true);
          }
        }}
      />

      {/* D2C Product Detail Modal */}
      {mode === 'D2C' && selectedProductForDetail && (
        <D2CProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
        />
      )}

      {/* B2B Product Detail Modal */}
      {mode === 'B2B' && selectedProductForDetail && (
        <B2BProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onOpenQuote={handleOpenQuote}
          onOpenRegister={() => setActiveModal('b2b_register')}
        />
      )}

      {/* Retail Checkout Modal */}
      <D2CCheckoutModal
        isOpen={isD2CCheckoutOpen}
        onClose={() => setIsD2CCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={latestConfirmedOrder}
        onClose={() => setLatestConfirmedOrder(null)}
        onViewInvoice={handleOpenInvoice}
      />

      {/* Customer Order History Modal */}
      <OrderHistoryModal
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

      {/* Website Retail Customer Sign-Up & Sign-In Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Opening Visit Experience Gate Modal (Retail vs B2B Choice) */}
      <ExperienceGateModal />

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
