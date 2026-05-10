"use client";

import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { VerificationModal } from '@/components/dashboard/VerificationModal';
import { useVerification } from '@/hooks/useVerification';
import type { ViewMode, SellSubView, BuySubView } from '@/types';
import { Toaster } from '@/components/dashboard/ui/sonner';
import { toast } from 'sonner';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'sell' | 'message' | null>(null);

  const {
    verification,
    submitVerification,
    isVerified,
    isPending,
    isUnverified,
  } = useVerification();

  // Determine current view mode and sub-view from pathname
  const getViewMode = (): ViewMode => {
    if (pathname.includes('/create') || pathname.includes('/listings') || 
        pathname.includes('/analytics') || pathname.includes('/payouts')) {
      return 'sell';
    }
    return 'buy';
  };

  const getSellSubView = (): SellSubView => {
    if (pathname.includes('/create')) return 'create';
    if (pathname.includes('/listings')) return 'listings';
    if (pathname.includes('/analytics')) return 'analytics';
    if (pathname.includes('/payouts')) return 'payouts';
    return 'create';
  };

  const getBuySubView = (): BuySubView => {
    if (pathname.includes('/browse')) return 'browse';
    if (pathname.includes('/saved')) return 'saved';
    if (pathname.includes('/messages')) return 'messages';
    if (pathname.includes('/orders')) return 'orders';
    return 'browse';
  };

  const viewMode = getViewMode();
  const sellSubView = getSellSubView();
  const buySubView = getBuySubView();

  const handleModeChange = (mode: ViewMode) => {
    if (mode === 'sell' && !isVerified) {
      setPendingAction('sell');
      setShowVerification(true);
      return;
    }
    navigate(mode === 'sell' ? '/dashboard/create' : '/dashboard/browse');
    setIsSidebarOpen(false);
  };

  const handleSellSubViewChange = (view: SellSubView) => {
    const routes: Record<SellSubView, string> = {
      create: '/dashboard/create',
      listings: '/dashboard/listings',
      analytics: '/dashboard/analytics',
      payouts: '/dashboard/payouts',
    };
    navigate(routes[view]);
    setIsSidebarOpen(false);
  };

  const handleBuySubViewChange = (view: BuySubView) => {
    const routes: Record<BuySubView, string> = {
      browse: '/dashboard/browse',
      saved: '/dashboard/saved',
      messages: '/dashboard/messages',
      orders: '/dashboard/orders',
    };
    navigate(routes[view]);
    setIsSidebarOpen(false);
  };

  const handleCreateClick = () => {
    if (!isVerified) {
      setPendingAction('sell');
      setShowVerification(true);
      return;
    }
    navigate('/dashboard/create');
  };

  const handleVerificationSubmit = (idImage: string) => {
    submitVerification(idImage);
    toast.success('Verification submitted!', {
      description: 'We\'ll review your ID and notify you soon.',
    });
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
    setPendingAction(null);
  };
  console.log(isVerified)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        viewMode={viewMode}
        setViewMode={handleModeChange}
        sellSubView={sellSubView}
        setSellSubView={handleSellSubViewChange}
        buySubView={buySubView}
        setBuySubView={handleBuySubViewChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="md:ml-[260px] min-h-screen flex flex-col transition-all duration-300">
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onCreateClick={handleCreateClick}
          isVerified={isVerified}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto scrollbar-thin">
          {isUnverified && viewMode === 'sell' ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Verification Required
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                To start selling on UniMarket and ensure a safe community, please verify your student status first.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPendingAction('sell');
                    setShowVerification(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
                >
                  Verify Now
                </button>
                <button
                  onClick={() => navigate('/dashboard/browse')}
                  className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-all duration-200"
                >
                  Browse Instead
                </button>
              </div>
            </div>
          ) : isPending && viewMode === 'sell' ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-yellow-400 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Verification in Progress
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                We&apos;re reviewing your ID. This usually takes just a few minutes. You&apos;ll be able to sell once approved.
              </p>
              <button
                onClick={() => navigate('/dashboard/browse')}
                className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-all duration-200"
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerification}
        onClose={handleVerificationClose}
        status={verification.status}
        onSubmit={handleVerificationSubmit}
        actionType={pendingAction === 'sell' ? 'sell' : 'message'}
      />

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#F6F7FB',
          },
        }}
      />
    </div>
  );
}
