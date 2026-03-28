import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Search, Bell, MessageSquare, Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateClick: () => void;
  isVerified: boolean;
}

export function Header({ searchQuery, setSearchQuery, onCreateClick, isVerified }: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

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
      className="sticky top-0 z-40 h-[72px] bg-background/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div className="h-full flex items-center justify-between px-7">
        {/* Search Bar */}
        <div
          ref={searchRef}
          className={`relative w-full max-w-md transition-all duration-200 ${
            isFocused ? 'glow-accent' : ''
          }`}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search listings, ISBNs, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-11 pr-4 h-11 rounded-full bg-[#121212] border transition-all duration-200 ${
                isFocused
                  ? 'border-[#22debc] ring-2 ring-[#22debc]/20'
                  : 'border-white/[0.06] hover:border-[#22debc]/30'
              }`}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Verification Status */}
          {!isVerified && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">Unverified</span>
            </div>
          )}

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer relative w-10 h-10 rounded-xl hover:bg-[#22debc]/10 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-[#22debc] text-black">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-[#121212] border border-[#121212]">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-[#22debc]/10">
                <span className="font-medium">New message from Sarah</span>
                <span className="text-xs text-muted-foreground">Is the laptop still available?</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-[#22debc]/10">
                <span className="font-medium">Price offer from David</span>
                <span className="text-xs text-muted-foreground">Would you take 20,000 for the textbook?</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer relative w-10 h-10 rounded-xl hover:bg-[#22debc]/10 transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#22debc]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-[#121212] border border-[#121212]">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-[#22debc]/10">
                <span className="font-medium">Listing viewed 50 times</span>
                <span className="text-xs text-muted-foreground">Your MacBook Pro is getting attention!</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 hover:bg-[#22debc]/10">
                <span className="font-medium">New follower</span>
                <span className="text-xs text-muted-foreground">Marie started following your listings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Button */}
          <Button
            onClick={onCreateClick}
            className="h-10 cursor-pointer px-4 rounded-xl bg-[#22debc] hover:bg-[#22debc]/90 text-black font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#22debc]/20"
          >
            <Plus className="h-4" />
            Create
          </Button>
        </div>
      </div>
    </header>
  );
}
