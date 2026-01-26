import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, TagIcon, TrendingUpIcon, SettingsIcon, HelpCircleIcon, LogOutIcon, XIcon, UserIcon, StoreIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface VendorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function VendorSidebar({ isOpen, onClose, isMobile }: VendorSidebarProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { to: '/vendor/dashboard', icon: LayoutDashboardIcon, label: 'Dashboard', emoji: '📊' },
    { to: '/vendor/offers', icon: TagIcon, label: 'Manage Offers', emoji: '📦' },
    { to: '/vendor/coupons', icon: TagIcon, label: 'Coupon Redemptions', emoji: '🎟️' },
    { to: '/vendor/analytics', icon: TrendingUpIcon, label: 'Analytics', emoji: '📈' },
    { to: '/vendor/profile', icon: UserIcon, label: 'Profile', emoji: '👤' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const footerItems = [
    { icon: SettingsIcon, label: 'Settings', emoji: '⚙️', onClick: () => navigate('/vendor/settings') },
    { icon: HelpCircleIcon, label: 'Help', emoji: '❓', onClick: () => {} },
    { icon: LogOutIcon, label: 'Log out', emoji: '🚪', onClick: handleLogout },
  ];

  if (!isOpen && !isMobile) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          ${isMobile ? 'fixed' : 'relative'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'z-50' : 'z-10'}
          w-72 h-full bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-green-950 border-r border-green-200 dark:border-green-900
          transition-transform duration-300 ease-in-out
          flex flex-col shadow-xl
        `}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <StoreIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent block">
                Vendor Portal
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Grow with students 🚀</span>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-transparent text-foreground hover:bg-green-100 dark:hover:bg-green-900"
            >
              <XIcon className="w-6 h-6" strokeWidth={2} />
            </Button>
          )}
        </div>

        <div className="px-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-green-600 shadow-md">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Vendor'}</p>
                <p className="text-xs text-green-100 truncate">{user?.companyName || 'Company'}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={isMobile ? onClose : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900 hover:scale-105'
                    }`
                  }
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 py-6">
          <Separator className="mb-4" />
          <ul className="space-y-2">
            {footerItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={item.onClick}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900 transition-all cursor-pointer group"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}

