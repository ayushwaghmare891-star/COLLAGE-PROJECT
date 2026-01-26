import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { VendorSidebar } from './dashboard/sidebar'
import { VendorTopNav } from './dashboard/top-nav'
import { DashboardOverview } from './dashboard/dashboard-overview'
import { DiscountManagement } from './dashboard/discount-management'
import { StudentsRedemptions } from './dashboard/students-redemptions'
import { AnalyticsSection } from './dashboard/analytics-section'
import { BusinessProfile } from './dashboard/business-profile'
import { VerificationStatus } from './dashboard/verification-status'
import { SupportSection } from './dashboard/support-section'

export function VendorDashboard() {
  const location = useLocation()
  const [activeSection, setActiveSection] = useState('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    if (location.pathname === '/vendor/dashboard') {
      setActiveSection('overview')
    } else if (location.pathname === '/vendor/discount') {
      setActiveSection('discounts')
    } else if (location.pathname === '/vendor/students&Redemptions') {
      setActiveSection('students')
    } else if (location.pathname === '/vendor/analytics&insights') {
      setActiveSection('analytics')
    } else if (location.pathname === '/vendor/businessprofile') {
      setActiveSection('profile')
    } else if (location.pathname === '/vendor/verification-status') {
      setActiveSection('verification')
    } else if (location.pathname === '/vendor/support&helpcenter') {
      setActiveSection('support')
    }
  }, [location.pathname])

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />
      case 'discounts':
        return <DiscountManagement />
      case 'create-discount':
        return <DiscountManagement isCreateMode={true} />
      case 'students':
        return <StudentsRedemptions />
      case 'analytics':
        return <AnalyticsSection />
      case 'profile':
        return <BusinessProfile />
      case 'verification':
        return <VerificationStatus />
      case 'support':
        return <SupportSection />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <VendorSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <VendorTopNav 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}
