"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {


  return (
    <div className="min-h-screen bg-[#f4f5f2] dark:bg-[#0d0f0e]">
      <nav className="bg-white dark:bg-[#151816] border-b border-[rgba(18,20,18,0.12)] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#121412] dark:text-[#f4f2ee]">
            UniMarket
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-[#15juniorab444@gmail.com1816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 p-8">
          <h2 className="text-2xl font-bold text-[#121412] dark:text-[#f4f2ee] mb-4">
            Welcome, Ben
          </h2>
          <p className="text-[#5f5b52] dark:text-[#b7b1a6] mb-4">
            Email: Kev
          </p>
        </div>
      </main>
    </div>
  );
}
