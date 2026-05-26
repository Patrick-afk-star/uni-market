import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Mail, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [showResendInput, setShowResendInput] = useState(false);

  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!token || verificationAttempted.current) return;
    verificationAttempted.current = true;

    const verifyEmail = async () => {
      try {
        const response = await fetch(getApiUrl("/api/v1/auth/register/verify-email"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: token }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || 
            errorData.non_field_errors?.[0] || 
            "The verification link is invalid or has expired."
          );
        }

        setStatus("success");
        toast.success("Email verified successfully! You can now log in.");
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Verification failed.");
        toast.error(error instanceof Error ? error.message : "Verification failed.");
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/register/resend-email/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.email?.[0] || 
          "Failed to resend verification email."
        );
      }

      toast.success("Verification email resent! Please check your inbox.");
      setShowResendInput(false);
      setResendEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend verification email."
      );
    } finally {
      setIsResending(false);
    }
  };

  // 1. Verifying State
  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e] bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">
        <div className="w-full max-w-sm bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 px-6 py-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#d8a24a]/10 text-[#d8a24a]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#121412] dark:text-[#f4f2ee] mb-2">
            Verifying your email
          </h2>
          <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6] leading-relaxed">
            Please hold on while we process your request and activate your account.
          </p>
        </div>
      </div>
    );
  }

  // 2. Success State
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e] bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">
        <div className="w-full max-w-sm bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 px-6 py-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#2aa67f]/10 text-[#2aa67f] flex items-center justify-center shadow-[0_8px_20px_rgba(42,166,127,0.15)] animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#121412] dark:text-[#f4f2ee] mb-2">
            Email Verified!
          </h2>
          <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6] leading-relaxed mb-8">
            Your email has been verified successfully. Your account is now active and ready to use.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] focus:ring-offset-2 dark:focus:ring-offset-[#151816] flex items-center justify-center gap-2"
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e] bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">
        <div className="w-full max-w-sm bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 px-6 py-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shadow-[0_8px_20px_rgba(239,68,68,0.15)]">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#121412] dark:text-[#f4f2ee] mb-2">
            Verification Failed
          </h2>
          <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6] leading-relaxed mb-8">
            {errorMessage || "The verification link is invalid or has expired."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setStatus("idle");
                setShowResendInput(true);
              }}
              className="w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] focus:ring-offset-2 dark:focus:ring-offset-[#151816]"
            >
              Resend Verification Link
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="w-full bg-transparent hover:bg-gray-50 dark:hover:bg-[#1a1d1b] border border-[rgba(18,20,18,0.12)] dark:border-white/10 text-[#121412] dark:text-[#f4f2ee] rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Idle / Check Email State
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e] bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">
      <div className="w-full max-w-sm bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 px-5 py-8 text-center">
        {/* Verification Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#d8a24a]/10 text-[#d8a24a] flex items-center justify-center shadow-[0_8px_20px_rgba(216,162,74,0.15)] animate-pulse">
            <Mail className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#121412] dark:text-[#f4f2ee]">
          Verify your email
        </h2>
        <p className="text-xs text-[#5f5b52] dark:text-[#b7b1a6] mt-1.5 leading-relaxed">
          We've sent a verification link to your email address. Please click on the link in the email to activate your account.
        </p>

        {!showResendInput ? (
          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d8a24a]"
            >
              Continue to Login
            </button>
            <button
              onClick={() => setShowResendInput(true)}
              className="text-xs text-[#d8a24a] dark:text-[#e4b363] font-medium hover:underline focus:outline-none"
            >
              Didn't receive the email? Resend link
            </button>
          </div>
        ) : (
          <form onSubmit={handleResend} className="mt-8 text-left space-y-3">
            <div className="space-y-1">
              <label htmlFor="resend-email" className="text-xs font-semibold text-[#121412] dark:text-[#f4f2ee]">
                Email Address
              </label>
              <input
                id="resend-email"
                type="email"
                placeholder="Enter your registered email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] focus:outline-none focus:ring-2 focus:ring-[#d8a24a]"
                required
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isResending}
                className="flex-1 bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full py-2 text-xs font-semibold hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : "Send Link"}
              </button>
              <button
                type="button"
                onClick={() => setShowResendInput(false)}
                className="flex-1 bg-transparent border border-[rgba(18,20,18,0.12)] dark:border-white/10 text-[#121412] dark:text-[#f4f2ee] rounded-full py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#1a1d1b] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-[rgba(18,20,18,0.08)] dark:border-white/5">
          <Link
            to="/signup"
            className="text-xs text-[#5f5b52] dark:text-[#b7b1a6] hover:text-[#121412] dark:hover:text-[#f4f2ee] transition-colors"
          >
            ← Back to registration
          </Link>
        </div>
      </div>
    </div>
  );
}
