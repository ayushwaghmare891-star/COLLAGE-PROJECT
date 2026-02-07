'use client'

import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { VendorSidebar } from './vendor-sidebar'
import { VendorTopBar } from './vendor-topbar'
import { VendorDashboardOverview } from './vendor-dashboard-overview'
import { VendorProfile } from './vendor-profile'
import { VendorProducts } from './vendor-products'
import { VendorDiscounts } from './vendor-discounts'
import { StudentVerification } from './student-verification'
import { VendorOrders } from './vendor-orders'
import { VendorAnalytics } from './vendor-analytics'
import { VendorNotifications } from './vendor-notifications'
import { VendorCouponClaims } from './vendor-coupon-claims'

export function VendorAppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not authenticated or not vendor
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/vendor/login')
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <VendorTopBar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-12 lg:py-16">
            <Routes>
              <Route path="/dashboard" element={<VendorDashboardOverview />} />
              <Route path="/products" element={<VendorProducts />} />
              <Route path="/discounts" element={<VendorDiscounts />} />
              <Route path="/verification" element={<StudentVerification />} />
              <Route path="/orders" element={<VendorOrders />} />
              <Route path="/coupons" element={<VendorCouponClaims />} />
              <Route path="/analytics" element={<VendorAnalytics />} />
              <Route path="/notifications" element={<VendorNotifications />} />
              <Route path="/profile" element={<VendorProfile />} />
              <Route path="/" element={<VendorDashboardOverview />} />
            </Routes>
          </div>
        </main>
        <footer className="border-t border-gray-200 bg-white px-8 py-4 shadow-sm">
          <p className="text-center text-sm text-gray-600">
            © 2025 Student Deals Vendor Portal – All Rights Reserved
          </p>
        </footer>
      </div>
    </div>
  )
}
