import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <div className="hidden lg:flex gap-2.5">
            <Link
              to="/login"
              className="bg-transparent text-[#5f5b52] dark:text-[#b7b1a6] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm cursor-pointer transition-transform duration-200 hover:-translate-y-px block"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-transparent text-[#5f5b52] dark:text-[#b7b1a6] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm cursor-pointer transition-transform duration-200 hover:-translate-y-px block"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center shrink-0">
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
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-transparent text-[#5f5b52] dark:text-[#b7b1a6] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4.5 py-2.75 font-semibold text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5">Sign in</Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] border border-transparent rounded-full px-4.5 py-2.75 font-semibold text-sm transition-colors hover:brightness-110">Sign up</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
