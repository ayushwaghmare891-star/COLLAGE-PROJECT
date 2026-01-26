import { 
  LayoutDashboard, 
  Ticket, 
  Plus, 
  Users, 
  BarChart3, 
  Store, 
  CheckCircle2,
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface VendorSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function VendorSidebar({ activeSection, onSectionChange, isOpen, onToggle }: VendorSidebarProps) {
  const navigate = useNavigate()
  
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, route: '/vendor/dashboard' },
    { id: 'discounts', label: 'Discount Management', icon: Ticket, route: '/vendor/discount' },
    { id: 'create-discount', label: 'Create Discount', icon: Plus },
    { id: 'students', label: 'Students & Redemptions', icon: Users, route: '/vendor/students&Redemptions' },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3, route: '/vendor/analytics&insights' },
    { id: 'profile', label: 'Business Profile', icon: Store, route: '/vendor/businessprofile' },
    { id: 'verification', label: 'Verification Status', icon: CheckCircle2, route: '/vendor/verification-status' },
    { id: 'support', label: 'Support & Help Center', icon: HelpCircle, route: '/vendor/support&helpcenter' },
  ]

  const handleMenuClick = (item: any) => {
    onSectionChange(item.id)
    if (item.route) {
      navigate(item.route)
    }
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onToggle()
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative w-64 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Store className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">VendorHub</h1>
              <p className="text-xs text-gray-600">Discount Manager</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-all duration-200 text-red-600">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
