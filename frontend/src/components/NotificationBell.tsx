import React, { useEffect, useState } from 'react';
import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeNotifications, Notification } from '@/hooks/useRealtimeNotifications';
import notificationAPI from '@/lib/notificationAPI';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  userId?: string;
  userType?: 'student' | 'admin' | 'vendor';
  className?: string;
}

/**
 * NotificationBell Component
 * Displays a bell icon with unread notification count
 * Shows notifications in a dropdown menu
 * Handles marking notifications as read and deleting them
 */
const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  userType = 'student',
  className,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Use the real-time notifications hook
  const { connected, unreadCount: socketUnreadCount, notifications: socketNotifications } = useRealtimeNotifications({
    userId,
    userType,
    enabled: !!userId,
  });

  /**
   * Load notifications from API when component mounts or dropdown opens
   */
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  /**
   * Sync socket notifications with local state
   */
  useEffect(() => {
    setNotifications(socketNotifications);
    setUnreadCount(socketUnreadCount);
  }, [socketNotifications, socketUnreadCount]);

  /**
   * Load notifications from API
   */
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationAPI.getNotifications({
        page: 1,
        limit: 20,
      });

      if (response.data.success) {
        setNotifications(
          response.data.notifications.map((notif: any) => ({
            id: notif._id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            createdAt: notif.createdAt,
            isRead: notif.isRead,
          }))
        );
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle marking notification as read
   */
  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await notificationAPI.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      toast({
        title: 'Success',
        description: 'Notification marked as read',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle deleting notification
   */
  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await notificationAPI.deleteNotification(notificationId);

      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      setUnreadCount((prev) => {
        const deleted = notifications.find((n) => n.id === notificationId);
        return deleted && !deleted.isRead ? Math.max(0, prev - 1) : prev;
      });

      toast({
        title: 'Success',
        description: 'Notification deleted',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle marking all as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();

      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);

      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  /**
   * Get badge color based on notification type
   */
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'offer':
        return 'bg-blue-100 text-blue-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      case 'announcement':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Format time ago
   */
  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const notificationDate = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="icon"
        className={cn('relative', className)}
        title={`${unreadCount} unread notifications`}
      >
        <Bell className="h-5 w-5" />

        {/* Unread notification badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        {connected && (
          <span className="absolute bottom-0 right-0 inline-block h-2 w-2 bg-green-600 rounded-full"></span>
        )}
      </Button>

      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
              disabled={isLoading}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Notifications list */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer',
                    !notification.isRead && 'bg-blue-50 dark:bg-blue-950'
                  )}
                  onClick={() => handleMarkAsRead(notification.id, new MouseEvent('click') as any)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {/* Notification type badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                            getNotificationTypeColor(notification.type)
                          )}
                        >
                          {notification.type}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-block h-2 w-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>

                      {/* Notification title and message */}
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {notification.message}
                      </p>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // Can add route to full notifications page here
                  window.location.href = '/notifications';
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
