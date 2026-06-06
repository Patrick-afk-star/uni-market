import { useEffect, useRef } from "react";
import { gsap } from "gsap";
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@/data/user";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function Sidebar({
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    }
  }, []);

  const isStaff = user?.is_staff ?? false;

  const navItems = [
    { id: "browse", label: "Explore", icon: Search, path: "/dashboard/browse" },
    { id: "create", label: "Create", icon: Plus, path: "/dashboard/create" },
    { id: "listings", label: "My Listings", icon: List, path: "/dashboard/listings" },
    { id: "saved", label: "Saved", icon: Heart, path: "/dashboard/saved" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/dashboard/messages" },
    ...(isStaff ? [{ id: "analytics", label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" }] : []),
    { id: "profile", label: "Profile", icon: User, path: "/dashboard/settings" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-[260px] bg-background border-r border-white/[0.06] flex flex-col z-[60] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
    >
      {/* Logo */}
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="UniMarket logo"
            className="w-12 h-12 rounded-2xl object-cover shadow-[0_10px_24px_rgba(15,107,79,0.25)]"
          />
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

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (setIsOpen) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${isActive
                  ? "bg-[#1a1a1a] text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#bb740a]/10"
                }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-[#bb740a]" : ""
                  }`}
              />
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
            <AvatarImage
              src={currentUser.avatar}
              alt={user?.first_name || currentUser.name}
            />
            <AvatarFallback className="bg-[#bb740a]/20 text-[#bb740a]">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.first_name || currentUser.name}
            </p>
            <p className="text-[10px] text-[#959595] truncate">
              {user?.email || currentUser.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-[#121212] border border-white/[0.03] hover:border-red-500/20 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center shrink-0 w-11 h-11"
          title="Sign Out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
}
