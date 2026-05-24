import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * GuestRoute ensures that authenticated users cannot access public pages
 * like the Home page, Sign In, Sign Up, and Forgot Password.
 * If logged in, they are redirected to their active dashboard or onboarding.
 */
export default function GuestRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    // Return empty state or loading during initial session silent-refresh
    return null;
  }

  if (isAuthenticated) {
    // If profile is incomplete, send them to onboarding; otherwise dashboard
    if (user && user.has_completed_profile === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
