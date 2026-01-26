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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 border-b border-blue-200 dark:border-blue-900 bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden bg-transparent text-foreground hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          <MenuIcon className="w-6 h-6" strokeWidth={2} />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
            user?.role === 'vendor' 
              ? 'bg-gradient-to-br from-green-500 to-teal-600' 
              : user?.role === 'admin'
              ? 'bg-gradient-to-br from-red-500 to-orange-600'
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            <SparklesIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-xl font-bold bg-clip-text text-transparent ${
              user?.role === 'vendor'
                ? 'bg-gradient-to-r from-green-600 to-teal-600'
                : user?.role === 'admin'
                ? 'bg-gradient-to-r from-red-600 to-orange-600'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              {user?.role === 'vendor' ? 'Vendor Portal' : user?.role === 'admin' ? 'Admin Panel' : 'Student Deals'}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user?.role === 'vendor' ? 'Grow with students 🚀' : user?.role === 'admin' ? 'Manage platform 🛡️' : 'Save More, Study Better 📚'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-transparent text-foreground hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          <BellIcon className="w-6 h-6" strokeWidth={2} />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs animate-pulse">
              {notifications}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              user?.role === 'vendor'
                ? 'hover:bg-green-100 dark:hover:bg-green-900'
                : user?.role === 'admin'
                ? 'hover:bg-red-100 dark:hover:bg-red-900'
                : 'hover:bg-blue-100 dark:hover:bg-blue-900'
            }`}>
              <Avatar className={`w-10 h-10 border-2 shadow-lg ${
                user?.role === 'vendor'
                  ? 'border-green-500'
                  : user?.role === 'admin'
                  ? 'border-red-500'
                  : 'border-blue-500'
              }`}>
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className={`bg-gradient-to-br text-white font-semibold ${
                  user?.role === 'vendor'
                    ? 'from-green-500 to-teal-600'
                    : user?.role === 'admin'
                    ? 'from-red-500 to-orange-600'
                    : 'from-blue-500 to-purple-600'
                }`}>
                  {user?.role === 'vendor' 
                    ? (user?.companyName?.split(' ').map(n => n[0]).join('') || 'V').toUpperCase()
                    : (user?.name?.split(' ').map(n => n[0]).join('') || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-foreground">
                  {user?.role === 'vendor' 
                    ? user?.companyName || user?.name || 'Vendor'
                    : user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'vendor' 
                    ? user?.name || 'Owner' 
                    : user?.role === 'admin'
                    ? 'Administrator'
                    : user?.university || 'Student'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-56 bg-white dark:bg-gray-800 ${
            user?.role === 'vendor'
              ? 'border-green-200 dark:border-green-900'
              : user?.role === 'admin'
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
              onClick={() => navigate(user?.role === 'vendor' ? '/vendor/profile' : user?.role === 'admin' ? '/admin/dashboard' : '/account')}
              className={`text-foreground cursor-pointer ${
                user?.role === 'vendor'
                  ? 'hover:bg-green-50 dark:hover:bg-green-900'
                  : user?.role === 'admin'
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
              onClick={() => navigate(user?.role === 'vendor' ? '/vendor/settings' : user?.role === 'admin' ? '/admin/dashboard' : '/account')}
              className={`text-foreground cursor-pointer ${
                user?.role === 'vendor'
                  ? 'hover:bg-green-50 dark:hover:bg-green-900'
                  : user?.role === 'admin'
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
