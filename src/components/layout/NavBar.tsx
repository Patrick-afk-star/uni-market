import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-[#f4f5f2]/90 backdrop-blur-lg border-b border-[rgba(18,20,18,0.12)] dark:bg-[#0d0f0e]/90 dark:border-white/10">
      <div className="max-w-290 w-[92vw] mx-auto">
        <div className="flex items-center justify-between gap-4 py-4.5">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/favicon.png"
              alt="UniMarket logo"
              className="w-12 h-12 shrink-0 rounded-2xl object-cover shadow-[0_10px_24px_rgba(15,107,79,0.25)]"
            />
            <div className="min-w-0">
              <div className="font-bold text-lg truncate">UniMarket Rwanda</div>
              <div className="text-xs text-[#5f5b52] dark:text-[#b7b1a6] truncate hidden sm:block">
                UniMarket Rwanda — for students, by students.
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-4" aria-label="Primary">
            <a
              href="#categories"
              className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] bg-transparent border-none cursor-pointer text-sm"
            >
              Categories
            </a>
            <a
              href="#featured"
              className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] bg-transparent border-none cursor-pointer text-sm"
            >
              Featured
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="cursor-pointer p-2 text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] transition-colors rounded-full focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <Link
              to="/login"
              className="flex items-center gap-2 bg-[#bb720c] text-white rounded-full px-5 py-2.5 font-semibold text-sm cursor-pointer transition-transform duration-200 "
            >
              Sign in <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Toggle & Theme */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-[#5f5b52] dark:text-[#b7b1a6] focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-[#5f5b52] dark:text-[#b7b1a6] focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden flex flex-col gap-4 pb-4 border-t border-[rgba(18,20,18,0.12)] dark:border-white/10 pt-4">
            <nav className="flex flex-col gap-3" aria-label="Mobile">
              <a href="#categories" onClick={() => setIsMenuOpen(false)} className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] text-sm">Categories</a>
              <a href="#featured" onClick={() => setIsMenuOpen(false)} className="text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] text-sm">Featured</a>
            </nav>
            <div className="flex flex-col gap-2.5 mt-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-[#bb720c] text-white rounded-full px-4.5 py-2.75 font-semibold text-sm transition-colors hover:brightness-110">
                Sign in <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
