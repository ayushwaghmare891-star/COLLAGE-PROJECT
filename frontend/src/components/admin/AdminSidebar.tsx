import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboardIcon, UsersIcon, BuildingIcon, TagIcon, ShieldCheckIcon, TrendingUpIcon, SettingsIcon, LogOutIcon, XIcon, ShieldIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useAuthStore } from '../../stores/authStore';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function AdminSidebar({ isOpen, onClose, isMobile }: AdminSidebarProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboardIcon, label: 'Dashboard', emoji: '🏠', badge: null },
    { to: '/admin/students', icon: UsersIcon, label: 'Students', emoji: '🎓', badge: '1.2K' },
    { to: '/admin/vendors', icon: BuildingIcon, label: 'Vendors', emoji: '🏪', badge: '89' },
    { to: '/admin/offers', icon: TagIcon, label: 'Offers', emoji: '💸', badge: '342' },
    { to: '/admin/verifications', icon: ShieldCheckIcon, label: 'Verifications', emoji: '✅', badge: '23' },
    { to: '/admin/analytics', icon: TrendingUpIcon, label: 'Analytics', emoji: '📈', badge: null },
  ];

  if (!isOpen && !isMobile) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          ${isMobile ? 'fixed' : 'relative'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'z-50' : 'z-10'}
          w-72 h-full bg-gradient-to-b from-gray-900 to-indigo-950 border-r border-indigo-900
          transition-transform duration-300 ease-in-out
          flex flex-col shadow-2xl
        `}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <ShieldIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent block">
                Admin Portal
              </span>
              <span className="text-xs text-gray-400">Control Hub 🛡️</span>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-transparent text-white hover:bg-indigo-900"
            >
              <XIcon className="w-6 h-6" strokeWidth={2} />
            </Button>
          )}
        </div>

        {/* Admin Info Card */}
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-4 shadow-lg border border-indigo-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-md">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Administrator</p>
                <p className="text-xs text-indigo-200 truncate">admin@studentdeals.com</p>
              </div>
            </div>
            <Badge className="w-full justify-center bg-white/20 text-white border-white/30 backdrop-blur-sm">
              🛡️ Super Admin
            </Badge>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={isMobile ? onClose : undefined}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105' 
                      : 'text-gray-300 hover:bg-indigo-900 hover:text-white hover:scale-105'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 py-6">
          <Separator className="mb-4 bg-indigo-800" />
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate('/admin/settings')}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-300 hover:bg-indigo-900 hover:text-white transition-all cursor-pointer group"
              >
                <span className="text-xl">⚙️</span>
                <span className="font-medium">Settings</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-900/20 transition-all cursor-pointer group"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Log out</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
