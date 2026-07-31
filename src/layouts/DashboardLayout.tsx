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
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    if (user && accessToken) {
      const fetchUnreadCounts = async () => {
        try {
          const conversations = await listConversations(accessToken, false);
          const count = conversations.reduce((acc, conv) => acc + conv.unread_count, 0);
          setUnreadCount(count);
        } catch (err) {
          console.error('Failed to fetch unread messages count:', err);
        }

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUnreadNotificationCount(data.result || 0);
          }
        } catch (err) {
          console.error('Failed to fetch unread notifications count:', err);
        }
      };

      fetchUnreadCounts();
      
      const interval = setInterval(fetchUnreadCounts, 60000); // 1 minute interval

      return () => clearInterval(interval);
    }
  }, [user, accessToken]);

  // Calculate Completion Percentage
  // Tracks exactly 7 core profile fields. bio, email, and has_completed_profile
  // are intentionally excluded — they have zero impact on completion state.
  const calculateCompletion = () => {
    if (!user) return 100; // default hidden if not logged in
    const profile = (user as any)?.profile_details || {};
    const studentProfile = (user as any)?.student_profile || {};

    // Exactly 7 tracked fields (bio is explicitly excluded):
    // 1. avatar_url  2. first_name  3. last_name  4. phone_number
    // 5. province    6. district    7. campus
    const isNonEmptyString = (val: unknown): boolean =>
      typeof val === 'string' && val.trim() !== '';

    const fields = [
      isNonEmptyString(user.avatar_url),
      isNonEmptyString(user.first_name),
      isNonEmptyString(user.last_name),
      isNonEmptyString(user.phone_number),
      isNonEmptyString(profile.province),
      isNonEmptyString(profile.district),
      isNonEmptyString(studentProfile.campus),
    ];

    const completedFieldsCount = fields.filter(Boolean).length;
    const score = Math.round((completedFieldsCount / fields.length) * 100);

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
  const isHomePage = pathname === '/' || pathname === '/dashboard/browse' || pathname === '/dashboard';


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
      <div className="md:ml-[260px] flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Header - Render ONLY on Home / Browse */}
        {isHomePage && (
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateClick={handleCreateClick}
            isVerified={isVerified}
            onMenuClick={() => setIsSidebarOpen(true)}
            unreadCount={unreadCount}
            unreadNotificationCount={unreadNotificationCount}
          />
        )}

        {/* Profile Completion Banner — visible only on home/browse/settings routes */}
        {completionPercentage < 100 && !hideBanner && isHomePage && (
          <div className="bg-amber-600/10 border-b border-amber-600/20 px-4 py-2.5 flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={() => navigate('/dashboard/settings', { state: { editMode: true, highlightRequired: true } })}
            >
              <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center shrink-0">
                <span className="text-amber-500 font-bold text-[10px]">{completionPercentage}%</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate">Complete your seller profile</h4>
                <p className="text-[10px] text-muted-foreground">{completionPercentage}% complete — tap to finish</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/dashboard/settings', { state: { editMode: true, highlightRequired: true } })}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-500 transition-colors shadow-sm"
              >
                Finish
              </button>
              <button
                onClick={() => setHideBanner(true)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin pb-24 md:pb-0">
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

      {/* Mobile Bottom Navigation — Premium glass effect */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F17]/90 backdrop-blur-xl border-t border-white/[0.07] pb-safe shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { id: 'home', label: 'Home', icon: Search, path: '/dashboard/browse' },
            { id: 'create', label: 'Sell', icon: Plus, path: '/dashboard/create' },
            { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
            { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/settings' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.id === 'home' && pathname.includes('/browse'));

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 gap-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  {isActive && (
                    <span className="absolute inset-0 -m-1.5 rounded-xl bg-amber-500/10" />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 bg-amber-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] tracking-tight font-medium ${isActive ? 'text-amber-400' : ''}`}>{item.label}</span>
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
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            color: 'var(--popover-foreground)',
          },
        }}
      />
    </div>
  );
}
