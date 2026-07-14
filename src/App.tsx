import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import GuestRoute from '@/components/auth/GuestRoute';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Public Pages
import HomePage from '@/pages/HomePage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';

// Dashboard Pages
import ListingDetailPage from '@/pages/ListingDetailPage';
import SellerProfile from '@/pages/SellerProfile';

// Auth Pages
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import GoogleCallbackPage from '@/pages/auth/GoogleCallbackPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import OnboardingPage from '@/pages/auth/OnboardingPage';

// Dashboard Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import BrowsePage from '@/pages/dashboard/BrowsePage';
import SavedPage from '@/pages/dashboard/SavedPage';
import ListingsPage from '@/pages/dashboard/ListingsPage';
import MessagesPage from '@/pages/dashboard/MessagesPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import OrdersPage from '@/pages/dashboard/OrdersPage';
import CreatePage from '@/pages/dashboard/CreatePage';
import PayoutsPage from '@/pages/dashboard/PayoutsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest-only Routes */}
          <Route element={<GuestRoute />}>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms-of-service" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPage />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/password-reset/:uid/:token" element={<ResetPasswordPage />} />
              <Route path="/:uid/:token" element={<ResetPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/browse" element={<BrowsePage />} />
              <Route path="/dashboard/saved" element={<SavedPage />} />
              <Route path="/dashboard/listings" element={<ListingsPage />} />
              <Route path="/dashboard/messages" element={<MessagesPage />} />
              <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
              <Route path="/dashboard/orders" element={<OrdersPage />} />
              <Route path="/dashboard/create" element={<CreatePage />} />
              <Route path="/dashboard/edit/:id" element={<CreatePage />} />
              <Route path="/dashboard/payouts" element={<PayoutsPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
              <Route path="/dashboard/listing/:id" element={<ListingDetailPage />} />
              <Route path="/dashboard/seller/:id" element={<SellerProfile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
