import { useState } from 'react';
import { Menu, X, LayoutDashboard, Ticket, Heart, Bell, HelpCircle, LogOut, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  onLogout: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ onLogout, activeSection = 'dashboard', onSectionChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-discounts', label: 'All Discounts', icon: ShoppingBag },
    { id: 'my-coupons', label: 'My Coupons', icon: Ticket },
    { id: 'saved-offers', label: 'Saved Offers', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const handleNavigation = (sectionId: string) => {
    onSectionChange?.(sectionId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          variant="outline"
          size="icon"
          className="bg-white border-purple-200 hover:bg-purple-50"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static inset-y-0 left-0 w-64 h-screen lg:h-auto bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white shadow-xl transition-transform duration-300 z-40 overflow-y-auto flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-purple-700 mt-12 lg:mt-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            StudiSave
          </h1>
          <p className="text-purple-200 text-sm mt-1">Student Discounts Hub</p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-purple-100 hover:bg-purple-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-purple-700">
          <Button
            onClick={onLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
