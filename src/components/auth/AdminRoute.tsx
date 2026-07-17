import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * AdminRoute – renders children only when the authenticated user has the
 * "admin" role inside their `roles` array.  Falls back to /dashboard for
 * logged-in non-admins and to /login for unauthenticated visitors.
 */
export default function AdminRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isAdmin =
    user?.roles?.includes("admin") || user?.is_staff === true;

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
