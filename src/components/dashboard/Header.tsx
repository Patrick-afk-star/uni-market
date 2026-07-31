import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Search, Bell, MessageSquare, Plus, Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateClick: () => void;
  isVerified: boolean;
  onMenuClick?: () => void;
  unreadCount?: number;
  unreadNotificationCount?: number;
}

export function Header({ searchQuery, setSearchQuery, onCreateClick, isVerified, onMenuClick, unreadCount = 0, unreadNotificationCount = 0 }: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const searchRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const TABS = ['All', 'Electronics', 'Textbooks', 'Furniture', 'Stationery', 'Clothing', 'Bicycles'];

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border"
    >
      {/* Top Header Bar */}
      <div className="h-[64px] md:h-[72px] flex items-center justify-between px-3 md:px-7 gap-2 md:gap-4">
        {/* Mobile Menu Button + Brand Logo Inline */}
        <div className="flex items-center gap-2 shrink-0 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 cursor-pointer w-9 h-9 rounded-xl hover:bg-[#bb740a]/10"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </Button>
          <img
            src="/favicon.png"
            alt="UniMarket Logo"
            className="w-8 h-8 rounded-xl object-cover cursor-pointer"
            onClick={() => navigate('/dashboard/browse')}
          />
        </div>

        {/* Mobile Search Bar (Inline Next to Logo) */}
        <div className="flex-1 max-w-md relative sm:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search listings, textbooks, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 h-9 rounded-full bg-secondary text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-[#bb740a]/40"
          />
        </div>

        {/* Desktop Search Bar */}
        <div
          ref={searchRef}
          className={`relative w-full max-w-md transition-all duration-200 hidden sm:block ${
            isFocused ? 'glow-accent' : ''
          }`}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search listings, textbooks, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-11 pr-4 h-11 rounded-full bg-secondary border-0 transition-all duration-200 text-foreground placeholder:text-muted-foreground ${
                isFocused
                  ? 'ring-2 ring-[#bb740a]/30'
                  : 'shadow-xs hover:bg-secondary/80'
              }`}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Verification Status */}
          {!isVerified && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">Unverified</span>
            </div>
          )}

          {/* Messages */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer relative w-10 h-10 rounded-xl hover:bg-[#bb740a]/10 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-[#bb740a] text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-popover border border-border text-popover-foreground">
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-[#bb740a]/10 cursor-pointer" onClick={() => window.location.href='/dashboard/messages'}>
                  <span className="font-medium">{unreadCount > 0 ? 'New messages' : 'Go to Messages'}</span>
                  <span className="text-xs text-muted-foreground">{unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/notifications')}
            className="cursor-pointer relative w-9 h-9 md:w-10 md:h-10 rounded-xl hover:bg-[#bb740a]/10 transition-colors"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            {unreadNotificationCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-[#bb740a] text-white">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </Badge>
            )}
          </Button>

          {/* Create Button */}
          <Button
            onClick={onCreateClick}
            className="h-9 md:h-10 cursor-pointer px-3 md:px-4 rounded-xl bg-[#bb740a] hover:bg-[#bb740a]/90 text-white font-medium text-xs md:text-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>
      </div>

      {/* Top Navigation Tabs (Horizontal Scroll - Alibaba Style on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-3 py-2 border-t border-border/50 text-xs sm:hidden">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-medium transition-all ${
              activeTab === tab
                ? 'bg-[#bb740a] text-white font-semibold shadow-xs'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
}
