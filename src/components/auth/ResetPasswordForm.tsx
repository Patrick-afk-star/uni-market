"use client";

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordForm() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { resetPasswordConfirm } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uid || !token) {
      toast.error("Invalid reset link. Missing parameters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordConfirm(uid, token, password, confirmPassword);
      setIsSuccess(true);
      toast.success("Password reset successful!", {
        description: "You can now log in with your new password.",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password."
      );
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

          {!isSuccess ? (
            <>
              <h2 className="text-lg font-bold text-center text-[#121412] dark:text-[#f4f2ee]">
                Create new password
              </h2>
              <p className="text-center text-[#5f5b52] dark:text-[#b7b1a6] text-xs mt-1 px-4 leading-normal">
                Please enter a secure password with at least 8 characters.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                {/* Password field with icon */}
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] placeholder:text-[#5f5b52]/50 dark:placeholder:text-[#b7b1a6]/50 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-shadow"
                    required
                  />
                  <label htmlFor="password" className="sr-only">
                    New password
                  </label>
                </div>

                {/* Confirm Password field with icon */}
                <div className="relative mb-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5b52] dark:text-[#b7b1a6]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] placeholder:text-[#5f5b52]/50 dark:placeholder:text-[#b7b1a6]/50 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-shadow"
                    required
                  />
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm new password
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] focus:ring-offset-2 dark:focus:ring-offset-[#151816] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting password..." : "Reset password"}
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#121412] dark:text-[#f4f2ee]">
                Success!
              </h2>
              <p className="text-[#5f5b52] dark:text-[#b7b1a6] text-xs mt-2 px-2 leading-relaxed">
                Your password has been successfully reset. You can now use your new credentials to sign in.
              </p>
              
              <Link
                to="/login"
                className="mt-5 w-full inline-block bg-[#2aa67f] hover:bg-[#2aa67f]/90 text-white rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_rgba(42,166,127,0.25)] transition-all duration-200"
              >
                Sign in
              </Link>
            </div>
          )}

          {!isSuccess && (
            <>
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(18,20,18,0.12)] dark:border-white/10"></div>
                </div>
              </div>

              <p className="text-center text-xs text-[#5f5b52] dark:text-[#b7b1a6]">
                Go back to{" "}
                <Link
                  to="/login"
                  className="text-[#d8a24a] dark:text-[#e4b363] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#d8a24a] rounded"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
