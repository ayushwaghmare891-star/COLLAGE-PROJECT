import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import FlippingCardDemo from './pages/FlippingCardDemo'
import { StudentSignupPage } from './components/student/student-signup'
import { StudentDashboardPage } from './components/student/student-dashboard-page'
import { StudentDiscountPage } from './components/student/discount-page'
import { StudentCategoriesPage } from './components/student/categories-page'
import { StudentCouponsPage } from './components/student/coupons-page'
import { SavedOffersPage } from './components/student/saved-offers-page'
import { NotificationsPage } from './components/student/notifications-page'
import { ProfilePage } from './components/student/profile-page'
import { HelpSupportPage } from './components/student/help-support-page'
import { DocumentUploadPage } from './components/student/document-upload-page'
import { VerificationStatusPage } from './components/student/verification-status-page'
import { AdminAppShell } from './components/admin/AdminAppShell'
import { AdminDirectLogin } from './components/admin-direct-login'
import { UnifiedLoginPage } from './components/unified-login-page'
import { VendorSignupPage } from './components/vendor/vendor-signup'
import { VendorLoginPage } from './components/vendor/vendor-login'
import { VendorDashboard } from './components/vendor/vendor-dashboard'
import { VendorProductDetail } from './components/vendor/vendor-product-detail'
import { VendorProductsPage } from './components/vendor/vendor-products-page'
import { VendorStudentDiscountsPage } from './components/vendor/vendor-student-discounts-page'
import { VendorStudentDiscountVerificationPage } from './components/vendor/vendor-student-discount-verification-page'
import { VendorStudentOrderPage } from './components/vendor/vendor-student-order-page'
import { VendorAnalyticsAndReportsPage } from './components/vendor/vendor-analytics-and-reports-page'
import { VendorNotificationsPage } from './components/vendor/vendor-notifications-page'
import { VendorProfileSettingsPage } from './components/vendor/vendor-profile-settings-page'
export default function App() {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname])

  const isDashboard = location.pathname.includes('/student/dashboard') || location.pathname.includes('/student/discount') || location.pathname.includes('/student/categories') || location.pathname.includes('/student/coupons') || location.pathname.includes('/student/save-offers') || location.pathname.includes('/student/notifications') || location.pathname.includes('/student/profile') || location.pathname.includes('/student/help-support') || location.pathname.includes('/admin/') || location.pathname.includes('/vendor/dashboard') || location.pathname.includes('/vendor/products') || location.pathname.includes('/vendor/studentdiscounts') || location.pathname.includes('/vendor/studentdiscountverification') || location.pathname.includes('/vendor/studentorder') || location.pathname.includes('/vendor/analyticsandreports') || location.pathname.includes('/vendor/notifications') || location.pathname.includes('/vendor/profilesettings')

  return (
    <div className={`min-h-screen ${isDashboard ? 'bg-gray-50' : 'bg-black'} overflow-hidden`}>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <Routes>
          <Route path="/" element={<FlippingCardDemo />} />
          <Route path="/student/signup" element={<StudentSignupPage />} />
          <Route path="/student/login" element={<UnifiedLoginPage />} />
          <Route path="/student/verification" element={<VerificationStatusPage />} />
          <Route path="/student/documents" element={<DocumentUploadPage />} />
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/discount" element={<StudentDiscountPage />} />
          <Route path="/student/categories" element={<StudentCategoriesPage />} />
          <Route path="/student/coupons" element={<StudentCouponsPage />} />
          <Route path="/student/save-offers" element={<SavedOffersPage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/help-support" element={<HelpSupportPage />} />
          <Route path="/vendor/signup" element={<VendorSignupPage />} />
          <Route path="/vendor/login" element={<VendorLoginPage />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorProductsPage />} />
          <Route path="/vendor/studentdiscounts" element={<VendorStudentDiscountsPage />} />
          <Route path="/vendor/studentdiscountverification" element={<VendorStudentDiscountVerificationPage />} />
          <Route path="/vendor/studentorder" element={<VendorStudentOrderPage />} />
          <Route path="/vendor/analyticsandreports" element={<VendorAnalyticsAndReportsPage />} />
          <Route path="/vendor/notifications" element={<VendorNotificationsPage />} />
          <Route path="/vendor/profilesettings" element={<VendorProfileSettingsPage />} />
          <Route path="/vendor/product" element={<VendorProductDetail />} />
          <Route path="/studentdashboard" element={<StudentDashboardPage />} />
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/login" element={<UnifiedLoginPage />} />
          <Route path="/admin/login" element={<AdminDirectLogin />} />
          <Route path="/admin/*" element={<AdminAppShell />} />
        </Routes>
      </div>
    </div>
  )
}
