import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Wrap any Route that requires authentication.
 *
 * While the auth context is performing the initial silent refresh we render
 * nothing so authenticated users never see a flash of the login page.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  console.log("[ProtectedRoute] State evaluation:", {
    isInitializing,
    isAuthenticated,
    user,
    pathname: location.pathname,
    hasCompletedProfile: user?.has_completed_profile
  });

  if (isInitializing || (isAuthenticated && !user)) {
    // Wait for the user profile to load to prevent bypassing the onboarding check
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if the user profile is incomplete
  const isProfileIncomplete = user && user.has_completed_profile === false;

  if (isProfileIncomplete && location.pathname !== "/onboarding") {
    console.log("[ProtectedRoute] Redirecting to /onboarding because profile is incomplete.");
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent accessing onboarding if the user has already completed it
  if (user && user.has_completed_profile === true && location.pathname === "/onboarding") {
    console.log("[ProtectedRoute] Redirecting to /dashboard because profile is already completed.");
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
