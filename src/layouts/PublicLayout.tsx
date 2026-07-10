import Navbar from "@/components/layout/NavBar";
import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="font-sans min-h-screen flex flex-col bg-[#0b0c0b] text-[#f4f2ee]">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      
      {/* Footer structure */}
      <footer className="border-t border-white/[0.06] bg-[#090a09] py-8 px-6 text-center text-xs text-[#b7b1a6]/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-foreground">UniMarket Rwanda</span>
            <span className="text-[10px] bg-[#bb740a]/10 text-[#bb740a] px-2 py-0.5 rounded-full font-medium">For Students, By Students</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[#b7b1a6]/80">
            <Link to="/terms" className="hover:text-foreground transition-colors font-medium hover:underline">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors font-medium hover:underline">Privacy Policy</Link>
            <a href="mailto:support.unimarketrwanda@gmail.com" className="hover:text-foreground transition-colors font-medium hover:underline">Support</a>
          </div>
          <p>© {new Date().getFullYear()} UniMarket Rwanda. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
