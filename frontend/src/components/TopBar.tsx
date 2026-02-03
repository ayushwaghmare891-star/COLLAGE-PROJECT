import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, BellIcon, MenuIcon, UserIcon, LogOutIcon, SettingsIcon, HeartIcon, SparklesIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuthStore } from '../stores/authStore';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [notifications] = useState(3);

  const handleLogout = async () => {
    try {
      await logout();
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if there's an error
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="h-16 sm:h-20 border-b border-blue-200 dark:border-blue-900 bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 backdrop-blur-sm px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden bg-transparent text-foreground hover:bg-blue-100 dark:hover:bg-blue-900 h-10 w-10 sm:h-11 sm:w-11"
        >
          <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
            user?.role === 'admin'
              ? 'bg-gradient-to-br from-red-500 to-orange-600'
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="hidden xs:block sm:block">
            <h1 className={`text-sm sm:text-xl font-bold bg-clip-text text-transparent ${
              user?.role === 'admin'
                ? 'bg-gradient-to-r from-red-600 to-orange-600'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              {user?.role === 'admin' ? 'Admin Panel' : 'Student Deals'}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {user?.role === 'admin' ? 'Manage platform 🛡️' : 'Save More, Study Better 📚'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-transparent text-foreground hover:bg-blue-100 dark:hover:bg-blue-900 h-10 w-10 sm:h-11 sm:w-11"
        >
          <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs animate-pulse">
              {notifications}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`hidden sm:flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl transition-all ${
              user?.role === 'admin'
                ? 'hover:bg-red-100 dark:hover:bg-red-900'
                : 'hover:bg-blue-100 dark:hover:bg-blue-900'
            }`}>
              <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 border-2 shadow-lg flex-shrink-0 ${
                user?.role === 'vendor'
                  ? 'border-green-500'
                  : user?.role === 'admin'
                  ? 'border-red-500'
                  : 'border-blue-500'
              }`}>
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className={`bg-gradient-to-br text-white font-semibold ${
                  user?.role === 'admin'
                    ? 'from-red-500 to-orange-600'
                    : 'from-blue-500 to-purple-600'
                }`}>
                  {(user?.name?.split(' ').map(n => n[0]).join('') || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === 'admin'
                    ? 'Administrator'
                    : user?.university || 'Student'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-48 sm:w-56 bg-white dark:bg-gray-800 ${
            user?.role === 'admin'
              ? 'border-red-200 dark:border-red-900'
              : 'border-blue-200 dark:border-blue-900'
          }`}>
            <DropdownMenuLabel className="text-foreground">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/account')}
              className={`text-foreground cursor-pointer ${
                user?.role === 'admin'
                  ? 'hover:bg-red-50 dark:hover:bg-red-900'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900'
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" strokeWidth={2} />
              My Profile
            </DropdownMenuItem>
            {user?.role === 'student' && (
            <DropdownMenuItem 
              onClick={() => navigate('/discounts')}
              className="text-foreground cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              <HeartIcon className="w-4 h-4 mr-2" strokeWidth={2} />
              Saved Offers
            </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/account')}
              className={`text-foreground cursor-pointer ${
                user?.role === 'admin'
                  ? 'hover:bg-red-50 dark:hover:bg-red-900'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4 mr-2" strokeWidth={2} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOutIcon className="w-4 h-4 mr-2" strokeWidth={2} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
