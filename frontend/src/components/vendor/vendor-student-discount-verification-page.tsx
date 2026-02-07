'use client'

import { useState, useEffect } from 'react'
import { VendorSidebar } from './vendor-sidebar'
import { VendorTopBar } from './vendor-topbar'
import { StudentVerification } from './student-verification'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'

export function VendorStudentDiscountVerificationPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      navigate('/vendor/login')
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <VendorSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={false}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorTopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">
          <StudentVerification />
        </main>
      </div>
    </div>
  )
}
