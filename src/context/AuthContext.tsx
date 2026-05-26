

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, LoginResponse, RefreshResponse } from "@/types";
import { getApiUrl } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  accessToken: string | null;
  /** Decoded user info from the login response. */
  user: AuthUser | null;
  /**
   * True while the context is performing the initial silent refresh on mount.
   * Use this to avoid a flash of the login page for already-authenticated users.
   */
  isInitializing: boolean;
  /** True once initializing is done AND we have a valid access token. */
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  /** POST /api/v1/auth/login — stores access token in state. */
  login: (email: string, password: string) => Promise<LoginResponse>;
  /** POST /api/auth/google — exchanges an OAuth code for tokens. */
  loginWithGoogle: (code: string) => Promise<LoginResponse>;
  /** POST /api/v1/auth/logout — clears tokens. */
  logout: () => Promise<void>;
  /** POST /api/v1/auth/password/reset — requests password reset link. */
  resetPassword: (email: string) => Promise<void>;
  /** POST /api/v1/auth/password/reset/confirm — resets password with uid and token. */
  resetPasswordConfirm: (
    uid: string,
    token: string,
    new_password1: string,
    new_password2: string
  ) => Promise<void>;
  /** Raw setter for edge-cases (e.g. OAuth callbacks that already have a token). */
  setAccessToken: (token: string | null) => void;
  /** POST /api/v1/profiles/complete — completes user onboarding. */
  completeProfile: (universityId: string) => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Guard against running the refresh call twice in StrictMode
  const refreshAttempted = useRef(false);

  // ── Silent refresh on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (refreshAttempted.current) return;
    refreshAttempted.current = true;

    const silentRefresh = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/auth/token/refresh"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {

          return;
        }

        const data: RefreshResponse = await res.json();
        setAccessToken(data.access_token);

        // Fetch user profile standard endpoint to fully restore the session details
        try {
          const resUser = await fetch(getApiUrl("/api/v1/auth/user/"), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access_token}`,
            },
          });
          if (resUser.ok) {
            const userData = await resUser.json();
            setUser(userData);
          }
        } catch (err) {
          console.warn("Silent refresh: failed to retrieve user profile details.", err);
        }
      } catch {
        // Network error or server down – treat as logged out
      } finally {
        setIsInitializing(false);
      }
    };

    silentRefresh();
  }, []);

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const res = await fetch(getApiUrl("/api/v1/auth/login"), {
        method: "POST",
        credentials: "include", // lets the server set the refresh cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        // Prevent email enumeration
        if (res.status === 400 || res.status === 401) {
          throw new Error("Invalid email or password. Please try again.");
        }

        const message =
          err?.non_field_errors?.[0] ??
          err?.detail ??
          err?.email?.[0] ??
          "Login failed. Please check your credentials.";
        throw new Error(message);
      }

      const data: LoginResponse = await res.json();

      setAccessToken(data.access);
      setUser(data.user);

      return data;
    },
    []
  );

  // ── loginWithGoogle ──────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(
    async (code: string): Promise<LoginResponse> => {
      const res = await fetch(getApiUrl("/api/v1/auth/google"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: "", code, id_token: "" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Google Login Error:", err);
        const message =
          err?.non_field_errors?.[0] ??
          err?.detail ??
          "Google authentication failed.";
        throw new Error(message);
      }

      const data: LoginResponse = await res.json();
      // console logging the response from the server
      console.log("Google Login Success:", data);

      setAccessToken(data.access);
      setUser(data.user);
      return data;
    },
    []
  );

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Best-effort: tell the server to invalidate the refresh token cookie.
      // If the endpoint does not exist the catch silently swallows the error.
      await fetch(getApiUrl("/api/v1/auth/logout"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // ── resetPassword ────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    const res = await fetch(getApiUrl("/api/v1/auth/password/reset"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message =
        err?.non_field_errors?.[0] ??
        err?.detail ??
        err?.email?.[0] ??
        "Failed to request password reset. Please try again.";
      throw new Error(`[${res.status}] ${message}`);
    }
  }, []);

  // ── resetPasswordConfirm ─────────────────────────────────────────────────
  const resetPasswordConfirm = useCallback(
    async (
      uid: string,
      token: string,
      new_password1: string,
      new_password2: string
    ): Promise<void> => {
      const res = await fetch(getApiUrl("/api/v1/auth/password/reset/confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password1, new_password2 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          err?.non_field_errors?.[0] ??
          err?.detail ??
          err?.new_password1?.[0] ??
          err?.new_password2?.[0] ??
          "Failed to reset your password. The link might be expired or invalid.";
        throw new Error(message);
      }
    },
    []
  );

  // ── completeProfile ──────────────────────────────────────────────────────
  const completeProfile = useCallback(
    async (universityId: string): Promise<void> => {
      if (!accessToken) throw new Error("No access token found");
      const res = await fetch(getApiUrl("/api/v1/profiles/complete"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          account_type: "student",
          university_id: universityId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err?.detail ?? "Failed to complete onboarding.";
        throw new Error(message);
      }

      // Update local state
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          has_completed_profile: true,
        };
      });
    },
    [accessToken]
  );

  // ── value ────────────────────────────────────────────────────────────────
  const value: AuthContextValue = {
    accessToken,
    user,
    isInitializing,
    isAuthenticated: !isInitializing && accessToken !== null,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    resetPasswordConfirm,
    setAccessToken,
    completeProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuth – must be used inside <AuthProvider>.
 *
 * @example
 * const { isAuthenticated, login, logout, accessToken, user } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
