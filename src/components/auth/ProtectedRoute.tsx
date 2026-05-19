import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Wrap any Route that requires authentication.
 *
 * While the auth context is performing the initial silent refresh we render
 * nothing so authenticated users never see a flash of the login page.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    // You can replace this with a full-screen spinner component if you prefer.
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
