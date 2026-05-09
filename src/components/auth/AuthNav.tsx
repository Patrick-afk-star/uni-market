"use client";

import { Link, useLocation } from "react-router-dom";

export default function AuthNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="flex justify-center space-x-8 mb-8 bg-red-500">
      <Link
        to="/login"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/login"
            ? "text-primary border-b-2 border-primary pb-1"
            : "text-muted-foreground"
        }`}
      >
        Login
      </Link>
      <Link
        to="/signup"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/signup"
            ? "text-primary border-b-2 border-primary pb-1"
            : "text-muted-foreground"
        }`}
      >
        Sign Up
      </Link>
    </nav>
  );
}
