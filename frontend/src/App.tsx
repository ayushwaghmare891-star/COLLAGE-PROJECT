import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { VendorAppShell } from './components/vendor/VendorAppShell';
import { AdminAppShell } from './components/admin/AdminAppShell';
import { DashboardView } from './components/views/DashboardView';
import { DiscountsView } from './components/views/DiscountsView';
import { SavedView } from './components/views/SavedView';
import { VerificationView } from './components/views/VerificationView';
import { MyAccountView } from './components/views/MyAccountView';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { VendorOffers } from './components/vendor/VendorOffers';
import { VendorAnalytics } from './components/vendor/VendorAnalytics';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { VendorProfile } from './components/vendor/VendorProfile';
import { AddOffer } from './components/vendor/AddOffer';
import { VendorSettings } from './components/vendor/VendorSettings';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminVendors } from './components/admin/AdminVendors';
import { LandingPage } from './components/LandingPage';


function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'vendor' ? '/vendor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <LoginForm />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to={user?.role === 'vendor' ? '/vendor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <SignupForm />} />
          
          <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'vendor' ? '/vendor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <LandingPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="student">
              <AppShell><DashboardView /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/discounts" element={
            <ProtectedRoute requiredRole="student">
              <AppShell><DiscountsView /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/saved" element={
            <ProtectedRoute requiredRole="student">
              <AppShell><SavedView /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/verification" element={
            <ProtectedRoute requiredRole={['student', 'admin']}>
              <AppShell><VerificationView /></AppShell>
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute requiredRole="student">
              <AppShell><MyAccountView /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/vendor/dashboard" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorAppShell><VendorDashboard /></VendorAppShell>
            </ProtectedRoute>
          } />
          <Route path="/vendor/offers" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorAppShell><VendorOffers /></VendorAppShell>
            </ProtectedRoute>
          } />
          <Route path="/vendor/analytics" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorAppShell><VendorAnalytics /></VendorAppShell>
            </ProtectedRoute>
          } />
          <Route path="/vendor/profile" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorAppShell><VendorProfile /></VendorAppShell>
            </ProtectedRoute>
          } />
          <Route path="/vendor/offers/new" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorAppShell><AddOffer /></VendorAppShell>
            </ProtectedRoute>
          } />
          <Route path="/vendor/settings" element={
            <ProtectedRoute requiredRole="vendor">
              <VendorAppShell><VendorSettings /></VendorAppShell>
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAppShell><AdminDashboard /></AdminAppShell>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAppShell><AdminSettings /></AdminAppShell>
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAppShell><AdminStudents /></AdminAppShell>
            </ProtectedRoute>
          } />
          <Route path="/admin/vendors" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAppShell><AdminVendors /></AdminAppShell>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </Router>
    );
}

export default App;

