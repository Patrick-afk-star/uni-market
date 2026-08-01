"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redirect to the page the user was trying to reach, or fall back to /dashboard
  const queryParams = new URLSearchParams(location.search);
  const nextParam = queryParams.get("next");
  const from = nextParam || ((location.state as { from?: Location })?.from?.pathname ?? "/dashboard/browse");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-[#fafafa] dark:bg-[#0d0f0e] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">

      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 dark:bg-[#151816] dark:border-white/10 dark:text-[#b7b1a6] dark:hover:bg-[#1a1d1b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B47614]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-transparent dark:bg-[#151816] rounded-2xl dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] dark:border dark:border-white/10 px-2 py-4 sm:px-4">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/favicon.png"
              alt="UniMarket logo"
              className="w-12 h-12 rounded-full object-cover dark:shadow-[0_8px_20px_rgba(15,107,79,0.25)]"
            />
          </div>

          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-[#f4f2ee]">
            Welcome back
          </h2>
          <p className="text-center text-gray-500 dark:text-[#b7b1a6] text-sm mt-1 mb-6">
            Enter your email to sign in to your account
          </p>

          {/* Segmented Control */}
          {/* <div className="flex p-1 bg-gray-100 rounded-lg mb-6 dark:bg-[#1a1d1b]">
            <button className="flex-1 py-1.5 text-sm font-semibold bg-white rounded-md shadow-sm text-gray-900 dark:bg-[#121412] dark:text-white dark:border dark:border-white/5">
              Password
            </button>
            <button className="flex-1 py-1.5 text-sm font-medium text-gray-500 dark:text-[#b7b1a6] hover:text-gray-700 dark:hover:text-gray-300">
              Magic Link
            </button>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-[#f4f2ee] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B47614] dark:border-white/10 dark:bg-[#121412] dark:text-[#f4f2ee] dark:focus:ring-[#e4b363] transition-shadow"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-[#f4f2ee]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-gray-500 hover:text-[#B47614] dark:text-[#b7b1a6] dark:hover:text-[#e4b363] focus:outline-none focus:ring-2 focus:ring-[#B47614] rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B47614] dark:border-white/10 dark:bg-[#121412] dark:text-[#f4f2ee] dark:focus:ring-[#e4b363] transition-shadow"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#b7b1a6] dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#B47614] dark:bg-[#e4b363] text-white dark:text-[#121412] rounded-lg px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-[#9A6511] dark:hover:bg-[#d8a24a] hover:cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#B47614] focus:ring-offset-2 dark:focus:ring-offset-[#151816] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#fafafa] dark:bg-[#151816] text-gray-400 dark:text-[#b7b1a6] font-medium tracking-wider">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-[#121412] border-none dark:border dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-700 dark:text-[#f4f2ee] font-bold hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-[#1a1d1b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B47614] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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
            Google
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-[#b7b1a6] mt-8 mb-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#B47614] dark:text-[#e4b363] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#B47614] rounded"
            >
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 dark:text-[#b7b1a6]/70">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="underline hover:text-gray-600 dark:hover:text-[#f4f2ee]"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline hover:text-gray-600 dark:hover:text-[#f4f2ee]"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

