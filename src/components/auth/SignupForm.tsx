"use client";

import { useState, SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please agree to the terms and privacy policy");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/auth/register/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          first_name: name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Signup failed");
      }

      toast.success("Account created! Please verify your email.");
      navigate("/auth/verify-email");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    if (!clientId) {
      toast.error("Google OAuth is not configured");
      return;
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    window.location.href = authUrl.toString();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e] bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 px-5 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img 
              src="/favicon.png" 
              alt="UniMarket logo" 
              className="w-9 h-9 rounded-xl object-cover shadow-[0_8px_20px_rgba(15,107,79,0.25)]" 
            />
          </div>

          <h2 className="text-lg font-bold text-center text-[#121412] dark:text-[#f4f2ee]">
            Create an account
          </h2>
          <p className="text-center text-[#5f5b52] dark:text-[#b7b1a6] text-xs mt-0.5">
            Join the student marketplace
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {/* Name field with icon */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5b52] dark:text-[#b7b1a6]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] placeholder:text-[#5f5b52]/50 dark:placeholder:text-[#b7b1a6]/50 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-shadow"
                required
              />
              <label htmlFor="name" className="sr-only">
                First name
              </label>
            </div>

            {/* Email field with icon */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5b52] dark:text-[#b7b1a6]">
                <svg
                  width="16"
                  height="16"
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
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] placeholder:text-[#5f5b52]/50 dark:placeholder:text-[#b7b1a6]/50 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-shadow"
                required
              />
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
            </div>

            {/* Password field with icon */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5b52] dark:text-[#b7b1a6]">
                <svg
                  width="16"
                  height="16"
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
                placeholder="Password"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] placeholder:text-[#5f5b52]/50 dark:placeholder:text-[#b7b1a6]/50 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-shadow"
                required
              />
              <label htmlFor="password" className="sr-only">
                Password
              </label>
            </div>

            {/* Confirm Password field with icon */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f5b52] dark:text-[#b7b1a6]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <line x1="17" y1="17" x2="7" y2="17" />
                </svg>
              </span>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] placeholder:text-[#5f5b52]/50 dark:placeholder:text-[#b7b1a6]/50 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-shadow"
                required
              />
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
            </div>

            <label className="flex items-start gap-2 text-xs text-[#5f5b52] dark:text-[#b7b1a6] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="cursor-pointer mt-0.5 rounded border-[rgba(18,20,18,0.12)] dark:border-white/10 text-[#d8a24a] dark:text-[#e4b363] focus:ring-[#d8a24a]"
                required
              />
              <span>
                By using this platform, you agree to the{" "}
                <Link
                  to="/terms"
                  className="text-[#d8a24a] dark:text-[#e4b363] underline font-semibold"
                >
                  UniMarket Rwanda Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-[#d8a24a] dark:text-[#e4b363] underline font-semibold"
                >
                  Privacy Policy
                </Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-2 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] focus:ring-offset-2 dark:focus:ring-offset-[#151816] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(18,20,18,0.12)] dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-[#151816] text-[#5f5b52] dark:text-[#b7b1a6]">
                or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#121412] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-full px-4 py-2 text-sm text-[#121412] dark:text-[#f4f2ee] font-medium hover:bg-gray-50 hover:cursor-pointer dark:hover:bg-[#1a1d1b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d8a24a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="hover:cursor-pointer text-center text-xs text-[#5f5b52] dark:text-[#b7b1a6] mt-3"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#d8a24a] dark:text-[#e4b363] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#d8a24a] rounded"
            >
              Log in
            </Link>
          </button>
        </div>

        <p className="text-center text-xs text-[#5f5b52] dark:text-[#b7b1a6] mt-2">
          By signing up, you agree to UniMarket{"'s "}
          <Link
            to="/terms"
            className="underline hover:text-[#121412] dark:hover:text-[#f4f2ee]"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="underline hover:text-[#121412] dark:hover:text-[#f4f2ee]"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
