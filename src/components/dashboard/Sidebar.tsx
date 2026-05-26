import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Search, 
  Plus, 
  List, 
  BarChart3, 
  // Wallet, 
  Heart, 
  MessageSquare, 
  User,
  X,
  LogOut,
  Settings
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/data/user';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { ViewMode, SellSubView, BuySubView } from '@/types';

interface SidebarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sellSubView: SellSubView;
  setSellSubView: (view: SellSubView) => void;
  buySubView: BuySubView;
  setBuySubView: (view: BuySubView) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function Sidebar({ 
  viewMode, 
  setViewMode, 
  sellSubView, 
  setSellSubView,
  buySubView,
  setBuySubView,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const modeIndicatorRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [viewMode]);

  const handleModeChange = (mode: ViewMode) => {
    if (mode !== viewMode) {
      setViewMode(mode);
    }
  };

  const sellNavItems = [
    { id: 'create' as SellSubView, label: 'Create', icon: Plus },
    { id: 'listings' as SellSubView, label: 'My Listings', icon: List },
    { id: 'analytics' as SellSubView, label: 'Analytics', icon: BarChart3 },
  ];

  const buyNavItems = [
    { id: 'browse' as BuySubView, label: 'Browse', icon: Search },
    { id: 'saved' as BuySubView, label: 'Saved', icon: Heart },
    { id: 'messages' as BuySubView, label: 'Messages', icon: MessageSquare },
    { id: 'settings' as BuySubView, label: 'Settings', icon: Settings },
  ];

  const navItems = viewMode === 'sell' ? sellNavItems : buyNavItems;

  return (
    <aside 
      className={`fixed left-0 top-0 bottom-0 w-[260px] bg-background border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span
            className="w-12 h-12 rounded-2xl grid place-items-center shadow-[0_10px_24px_rgba(15,107,79,0.25)]"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(42,166,127,0.4), transparent 70%), #0f1411",
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 64 64" role="img" aria-label="UniMarket logo">
              <defs>
                <linearGradient id="umLeaf" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2aa67f" />
                  <stop offset="100%" stopColor="#d8a24a" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="30" fill="#0f1411" />
              <path
                d="M19 36c0-9 6-16 13-18 6-2 13 2 13 10 0 10-8 18-20 18-4 0-6-3-6-10Z"
                fill="url(#umLeaf)"
              />
              <path
                d="M26 40c6-3 12-9 14-16"
                stroke="#f4f2ee"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <h1 className="font-semibold text-[15px] text-foreground leading-tight">
              UniMarket
            </h1>
            <p className="text-xs text-muted-foreground">Student marketplace</p>
          </div>
        </div>
        {setIsOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-background/50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode Switch */}
      <div className="p-4">
        <div className="relative flex bg-[#bb740a]/10 rounded-xl p-1">
          <div
            ref={modeIndicatorRef}
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#bb740a] rounded-lg transition-all duration-250 ease-out"
            style={{
              left: viewMode === 'sell' ? '4px' : 'calc(50%)',
            }}
          />
          <button
            onClick={() => handleModeChange('sell')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              viewMode === 'sell' ? 'text-white' : 'text-muted-foreground hover:text-foreground rounded-xl'
            }`}
          >
            <Plus className="w-4 h-4" />
            Sell
          </button>
          <button
            onClick={() => handleModeChange('buy')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              viewMode === 'buy' ? 'text-white' : 'text-muted-foreground hover:text-foreground rounded-xl'
            }`}
          >
            <Search className="w-4 h-4" />
            Buy
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = viewMode === 'sell' 
            ? sellSubView === item.id 
            : buySubView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (viewMode === 'sell') {
                  setSellSubView(item.id as SellSubView);
                } else {
                  setBuySubView(item.id as BuySubView);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-[#1a1a1a] text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[#bb740a]/10'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-[#bb740a]' : ''
              }`} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#bb740a]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-white/[0.06] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-3 p-2.5 rounded-2xl bg-[#121212] border border-white/[0.03] min-w-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)]">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={currentUser.avatar} alt={user?.first_name || currentUser.name} />
            <AvatarFallback className="bg-[#bb740a]/20 text-[#bb740a]">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.first_name || currentUser.name}</p>
            <p className="text-[10px] text-[#959595] truncate">{user?.email || currentUser.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-[#121212] border border-white/[0.03] hover:border-red-500/20 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center shrink-0 w-11 h-11"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
