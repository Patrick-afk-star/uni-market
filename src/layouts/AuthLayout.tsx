import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="antialiased flex flex-col min-h-screen">
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
