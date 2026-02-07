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
import { VendorAppShell } from './components/vendor/VendorAppShell'
import { VendorProductDetail } from './components/vendor/vendor-product-detail'
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

  const isDashboard = location.pathname.includes('/student/dashboard') || location.pathname.includes('/student/discount') || location.pathname.includes('/student/categories') || location.pathname.includes('/student/coupons') || location.pathname.includes('/student/save-offers') || location.pathname.includes('/student/notifications') || location.pathname.includes('/student/profile') || location.pathname.includes('/student/help-support') || location.pathname.includes('/admin/') || location.pathname.includes('/vendor/')

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
          <Route path="/vendor/product" element={<VendorProductDetail />} />
          <Route path="/vendor/*" element={<VendorAppShell />} />
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
