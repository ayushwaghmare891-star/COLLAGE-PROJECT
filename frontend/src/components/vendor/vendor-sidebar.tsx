'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  User,
  Package,
  Percent,
  FileCheck,
  ShoppingCart,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  Menu,
  XIcon,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'

interface VendorSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function VendorSidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}: VendorSidebarProps) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/vendor/login')
  }

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & stats',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      description: 'Manage products',
    },
    {
      id: 'discounts',
      label: 'Discounts',
      icon: Percent,
      description: 'Set discounts',
    },
    {
      id: 'verification',
      label: 'Verification',
      icon: FileCheck,
      description: 'Verify students',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      description: 'View orders',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Reports & stats',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Messages',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Edit profile',
    },
  ]

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-sm">VendorHub</h1>
                <p className="text-xs text-gray-500">Vendor Portal</p>
              </div>
            )}
          </div>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                setShowMobileMenu(false)
                if (item.id === 'products') {
                  navigate('/vendor/products')
                } else if (item.id === 'discounts') {
                  navigate('/vendor/studentdiscounts')
                } else if (item.id === 'verification') {
                  navigate('/vendor/studentdiscountverification')
                } else if (item.id === 'orders') {
                  navigate('/vendor/studentorder')
                } else if (item.id === 'analytics') {
                  navigate('/vendor/analyticsandreports')
                } else if (item.id === 'notifications') {
                  navigate('/vendor/notifications')
                } else if (item.id === 'profile') {
                  navigate('/vendor/profilesettings')
                } else {
                  setActiveTab(item.id)
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && (
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-24'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden transform transition-transform duration-300 ${
          showMobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="font-bold text-lg">VendorHub</h1>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XIcon size={20} />
          </button>
        </div>
        <nav className="px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setShowMobileMenu(false)
                  if (item.id === 'products') {
                    navigate('/vendor/products')
                  } else if (item.id === 'discounts') {
                    navigate('/vendor/studentdiscounts')
                  } else if (item.id === 'verification') {
                    navigate('/vendor/studentdiscountverification')
                  } else if (item.id === 'orders') {
                    navigate('/vendor/studentorder')
                  } else if (item.id === 'analytics') {
                    navigate('/vendor/analyticsandreports')
                  } else if (item.id === 'notifications') {
                    navigate('/vendor/notifications')
                  } else if (item.id === 'profile') {
                    navigate('/vendor/profilesettings')
                  } else {
                    setActiveTab(item.id)
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
