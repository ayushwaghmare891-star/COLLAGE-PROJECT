import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, BellIcon, MenuIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuthStore } from '../../stores/authStore';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [notifications] = useState(5);

  const handleLogout = async () => {
    try {
      await logout();
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
    <header className="h-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden bg-transparent text-gray-700 hover:bg-gray-100"
        >
          <MenuIcon className="w-6 h-6" strokeWidth={2} />
        </Button>
        
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-xs text-gray-600 hidden sm:block">Monitor & manage your platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search students..."
            className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative bg-transparent text-gray-700 hover:bg-gray-100"
        >
          <BellIcon className="w-6 h-6" strokeWidth={2} />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold">
              {notifications}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
              <Avatar className="w-10 h-10 border-2 border-gradient-to-r from-purple-600 to-pink-600">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold">
                  {logout.toString().charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">Admin</p>
                <p className="text-xs text-gray-600">Super Admin</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg">
            <DropdownMenuLabel className="text-gray-900">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-900">Administrator</p>
                <p className="text-xs text-gray-600">admin@studentdeals.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              onClick={() => navigate('/admin/settings')}
              className="text-gray-700 cursor-pointer hover:bg-gray-50"
            >
              <SettingsIcon className="w-4 h-4 mr-2" strokeWidth={2} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 cursor-pointer hover:bg-red-50"
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
