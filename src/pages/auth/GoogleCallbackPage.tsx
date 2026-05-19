import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * /auth/google/callback
 *
 * Google redirects here with ?code=… after the user consents.
 * We grab the code, send it to the backend via loginWithGoogle(),
 * and redirect to /dashboard on success.
 */
export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError(`Google denied access: ${oauthError}`);
      return;
    }

    if (!code) {
      setError("No authorization code received from Google.");
      return;
    }

    loginWithGoogle(code)
      .then(() => {
        navigate("/dashboard", { replace: true });
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [searchParams, loginWithGoogle, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e]">
        <div className="w-full max-w-sm bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#121412] dark:text-[#f4f2ee] mb-2">
            Authentication Failed
          </h2>
          <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6] mb-4">
            {error}
          </p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:cursor-pointer transition-all duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state while the code is being exchanged
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f2] dark:bg-[#0d0f0e]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#d8a24a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#5f5b52] dark:text-[#b7b1a6]">
          Signing you in with Google…
        </p>
      </div>
    </div>
  );
}
