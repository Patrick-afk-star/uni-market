"use client";

import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { VerificationModal } from '@/components/dashboard/VerificationModal';
import { useVerification } from '@/hooks/useVerification';
import type { ViewMode } from '@/types';
import { Toaster } from '@/components/dashboard/ui/sonner';
import { toast } from 'sonner';
import { Search, Plus, MessageSquare, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { listConversations } from '@/lib/messaging';
import { useEffect } from 'react';

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
  
  const { user, accessToken } = useAuth();
  const [hideBanner, setHideBanner] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && accessToken) {
      listConversations(accessToken, false)
        .then((conversations) => {
          const count = conversations.reduce((acc, conv) => acc + conv.unread_count, 0);
          setUnreadCount(count);
        })
        .catch(err => console.error('Failed to fetch unread count:', err));
      
      // We could also poll this every minute or so, but doing it on mount is a good start.
      const interval = setInterval(() => {
        listConversations(accessToken, false)
          .then((conversations) => {
            const count = conversations.reduce((acc, conv) => acc + conv.unread_count, 0);
            setUnreadCount(count);
          })
          .catch(() => {});
      }, 60000); // 1 minute interval

      return () => clearInterval(interval);
    }
  }, [user, accessToken]);

  // Calculate Completion Percentage
  const calculateCompletion = () => {
    if (!user) return 100; // default hidden if not logged in
    let score = 0;
    const profile = (user as any)?.profile_details || {};
    
    // Avatar Image (25%)
    if (user.avatar_url && user.avatar_url.trim() !== '') score += 25;
    
    // Phone Number (25%)
    if (user.phone_number && user.phone_number.trim() !== '') score += 25;
    
    // University affiliation (25%)
    if (user.has_completed_profile) score += 25;
    
    // Residence (Province & District) (25%)
    if (profile.province && profile.province.trim() !== '' && profile.district && profile.district.trim() !== '') score += 25;

    return Math.min(score, 100);
  };
  const completionPercentage = calculateCompletion();

  // Determine current view mode from pathname
  const getViewMode = (): ViewMode => {
    if (pathname.includes('/create') || pathname.includes('/listings') || 
        pathname.includes('/analytics') || pathname.includes('/payouts')) {
      return 'sell';
    }
    return 'buy';
  };

  const viewMode = getViewMode();

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
          className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        unreadCount={unreadCount}
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
          unreadCount={unreadCount}
        />

        {/* Profile Completion Banner */}
        {completionPercentage < 100 && !hideBanner && (
          <div className="bg-[#bb740a]/10 border-b border-[#bb740a]/20 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div 
              className="flex items-center gap-4 cursor-pointer" 
              onClick={() => navigate('/dashboard/settings', { state: { editMode: true, highlightRequired: true } })}
            >
              <div className="w-10 h-10 rounded-full bg-[#bb740a]/20 flex items-center justify-center shrink-0">
                <span className="text-[#bb740a] font-bold text-xs">{completionPercentage}%</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Complete your seller profile to build buyer trust!</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Your profile is currently {completionPercentage}% complete.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button 
                onClick={() => navigate('/dashboard/settings', { state: { editMode: true, highlightRequired: true } })}
                className="px-4 py-2 bg-[#bb740a] text-white rounded-lg text-xs font-semibold hover:bg-[#bb740a]/90 transition-colors whitespace-nowrap shadow-sm shadow-[#bb740a]/20"
              >
                Complete Profile
              </button>
              <button 
                onClick={() => setHideBanner(true)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto scrollbar-thin pb-[72px] md:pb-0">
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
            <Outlet context={{ searchQuery }} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-transparent pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around p-2">
          {[
            { id: 'explore', label: 'Explore', icon: Search, path: '/dashboard/browse' },
            { id: 'create', label: 'Create', icon: Plus, path: '/dashboard/create' },
            { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
            { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/settings' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname.includes(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-[#bb740a]' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#bb740a] rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

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
