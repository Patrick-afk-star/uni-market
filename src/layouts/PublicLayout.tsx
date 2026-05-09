import Navbar from "@/components/layout/NavBar";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="font-sans">
      <Navbar />
      <Outlet />
    </div>
  );
}
