'use client'

import { useState, useEffect } from 'react'
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
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'

export function VendorDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/vendor/login')
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated) {
    return null
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <VendorDashboardOverview />
      case 'profile':
        return <VendorProfile />
      case 'products':
        return <VendorProducts />
      case 'discounts':
        return <VendorDiscounts />
      case 'verification':
        return <StudentVerification />
      case 'orders':
        return <VendorOrders />
      case 'analytics':
        return <VendorAnalytics />
      case 'notifications':
        return <VendorNotifications />
      default:
        return <VendorDashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <VendorSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorTopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          currentTab={activeTab}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
