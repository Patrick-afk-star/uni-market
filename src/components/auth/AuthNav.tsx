"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthNav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center space-x-8 mb-8 bg-red-500">
      <Link
        href="/login"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/login"
            ? "text-primary border-b-2 border-primary pb-1"
            : "text-muted-foreground"
        }`}
      >
        Login
      </Link>
      <Link
        href="/signup"
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
