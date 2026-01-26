import { useState } from 'react'
import { Bell, User, Settings, LogOut, ChevronDown, Menu } from 'lucide-react'

interface VendorTopNavProps {
  onMenuClick: () => void
}

export function VendorTopNav({ onMenuClick }: VendorTopNavProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notificationCount] = useState(3)

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="hidden lg:flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-600">Vendor</p>
            </div>
            <ChevronDown size={16} className={`text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-600">vendor@example.com</p>
              </div>
              
              <div className="p-2 space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <User size={16} />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <Settings size={16} />
                  Settings
                </button>
              </div>

              <div className="p-2 border-t border-gray-200">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
