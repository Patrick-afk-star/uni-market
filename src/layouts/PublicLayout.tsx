import Navbar from "@/components/layout/NavBar";
import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="font-sans min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      
      {/* Footer structure */}
      <footer className="border-t border-border bg-secondary py-8 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-foreground">UniMarket Rwanda</span>
            <span className="text-[10px] bg-[#bb740a]/10 text-[#bb740a] px-2 py-0.5 rounded-full font-medium">For Students, By Students</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors font-medium hover:underline">Terms of Service</Link>
            <span className="text-border">·</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors font-medium hover:underline">Privacy Policy</Link>
            <span className="text-border">·</span>
            <a href="mailto:support.unimarketrwanda@gmail.com" className="hover:text-foreground transition-colors font-medium hover:underline">Support</a>
          </div>
          <p>© {new Date().getFullYear()} UniMarket Rwanda. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
