import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export default function AuthLayout() {
  return (
    <div className="antialiased flex flex-col min-h-screen">
      <main className="flex-1"><Outlet /></main>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
