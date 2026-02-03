'use client'

import { useState, useEffect } from 'react'
import { VendorSidebar } from './vendor-sidebar'
import { VendorTopBar } from './vendor-topbar'
import { VendorProducts } from './vendor-products'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'

export function VendorProductsPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const activeTab = 'products'

  const handleTabChange = (tab: string) => {
    if (tab === 'products') {
      navigate('/vendor/products')
    } else {
      navigate('/vendor/dashboard', { state: { activeTab: tab } })
    }
  }

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
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
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
          <VendorProducts />
        </main>
      </div>
    </div>
  )
}
