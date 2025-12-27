import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboardIcon, TagIcon, ShieldCheckIcon, UserIcon, HeartIcon, LogOutIcon, XIcon, SparklesIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { useSavedStore } from '../stores/savedStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const { verificationStatus } = useAppStore();
  const { savedItems } = useSavedStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboardIcon, label: 'Home', emoji: '🏠', badge: null },
    { to: '/discounts', icon: TagIcon, label: 'All Offers', emoji: '🎁', badge: '50+' },
    { to: '/saved', icon: HeartIcon, label: 'Saved', emoji: '❤️', badge: savedItems.length > 0 ? savedItems.length.toString() : null },
    { to: '/verification', icon: ShieldCheckIcon, label: 'Verification', emoji: '✅', badge: verificationStatus === 'pending' ? '!' : null },
    { to: '/account', icon: UserIcon, label: 'Profile', emoji: '👤', badge: null },
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
          w-72 h-full bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 border-r border-blue-200 dark:border-blue-900
          transition-transform duration-300 ease-in-out
          flex flex-col shadow-xl
        `}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <SparklesIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Student Deals
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Your savings hub 💰</span>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-transparent text-foreground hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <XIcon className="w-6 h-6" strokeWidth={2} />
            </Button>
          )}
        </div>

        {/* User Info Card */}
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-blue-600 shadow-md">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'ST'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Student'}</p>
                <p className="text-xs text-blue-100 truncate">{user?.university || 'University'}</p>
              </div>
            </div>
            {verificationStatus === 'verified' ? (
              <Badge className="w-full justify-center bg-white/20 text-white border-white/30 backdrop-blur-sm">
                ✅ Verified Student
              </Badge>
            ) : (
              <Badge className="w-full justify-center bg-yellow-400/20 text-yellow-100 border-yellow-300/30 backdrop-blur-sm">
                ⏳ Pending Verification
              </Badge>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto" aria-label="Main menu">
          <ul className="space-y-2" role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={isMobile ? onClose : undefined}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:scale-105'
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
          <Separator className="mb-4" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer group"
          >
            <LogOutIcon className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

