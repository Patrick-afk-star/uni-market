"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast.success("Request received", {
        description: "Please check your inbox for instructions.",
      });
    } catch (error) {
      // If the error message indicates a validation or existence error (often returned as 400),
      // we still transition to the success screen to prevent email enumeration.
      const errMsg = error instanceof Error ? error.message : "";
      if (errMsg.includes("400") || errMsg.toLowerCase().includes("not registered") || errMsg.toLowerCase().includes("invalid")) {
        setIsSubmitted(true);
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to send reset link."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e] bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 px-5 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#0f1411] flex items-center justify-center shadow-[0_8px_20px_rgba(15,107,79,0.25)]">
              <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="#0f1411" />
                <path
                  d="M19 36c0-9 6-16 13-18 6-2 13 2 13 10 0 10-8 18-20 18-4 0-6-3-6-10Z"
                  fill="url(#gradient)"
                />
                <path
                  d="M26 40c6-3 12-9 14-16"
                  stroke="#f4f2ee"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2aa67f" />
                    <stop offset="100%" stopColor="#d8a24a" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {!isSubmitted ? (
            <>
              <h2 className="text-lg font-bold text-center text-[#121412] dark:text-[#f4f2ee]">
                Reset your password
              </h2>
              <p className="text-center text-[#5f5b52] dark:text-[#b7b1a6] text-xs mt-1 px-4 leading-normal">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                {/* Email field with icon */}
                <div className="relative mb-3 mt-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5b52] dark:text-[#b7b1a6]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] placeholder:text-[#5f5b52]/50 dark:placeholder:text-[#b7b1a6]/50 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-shadow"
                    required
                  />
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] focus:ring-offset-2 dark:focus:ring-offset-[#151816] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending link..." : "Send reset link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-[#2aa67f]/10 dark:bg-[#2aa67f]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#2aa67f]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#121412] dark:text-[#f4f2ee]">
                Request Received
              </h2>
              <p className="text-[#5f5b52] dark:text-[#b7b1a6] text-xs mt-2 px-2 leading-relaxed">
                If an account exists with the email <strong className="text-[#121412] dark:text-[#f4f2ee]">{email}</strong>, you will receive a password reset link shortly. Please check your inbox and follow the instructions to create a new password.
              </p>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 text-xs text-[#d8a24a] dark:text-[#e4b363] hover:underline focus:outline-none"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(18,20,18,0.12)] dark:border-white/10"></div>
            </div>
          </div>

          <p className="text-center text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-[#d8a24a] dark:text-[#e4b363] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#d8a24a] rounded"
            >
              Back to Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
