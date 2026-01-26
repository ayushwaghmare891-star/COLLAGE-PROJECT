import { Bell, X, AlertCircle, Gift, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

interface Notification {
  id: string;
  type: 'new_discount' | 'expiring' | 'verification' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
}

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onDismiss,
  onAction,
}: NotificationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_discount':
        return <Gift className="w-5 h-5 text-purple-600" />;
      case 'expiring':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'verification':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'announcement':
        return <Bell className="w-5 h-5 text-pink-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_discount':
        return 'bg-purple-50 border-purple-200';
      case 'expiring':
        return 'bg-orange-50 border-orange-200';
      case 'verification':
        return 'bg-blue-50 border-blue-200';
      case 'announcement':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No notifications at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-900 font-medium">
            You have <span className="font-bold">{unreadCount}</span> unread notification
            {unreadCount !== 1 ? 's' : ''}
          </span>
          <Button
            onClick={() => notifications.forEach((n) => onMarkAsRead?.(n.id))}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white"
          >
            Mark All Read
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-xl border-l-4 p-4 cursor-pointer transition-all ${getNotificationColor(
            notification.type
          )} ${notification.read ? 'opacity-70' : 'border-l-4'}`}
          onClick={() => {
            onMarkAsRead?.(notification.id);
            setExpandedId(expandedId === notification.id ? null : notification.id);
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">{getNotificationIcon(notification.type)}</div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900">{notification.title}</h3>
                  {!notification.read && (
                    <span className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></span>
                  )}
                </div>

                <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>

                {/* Expanded Content */}
                {expandedId === notification.id && notification.actionUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.(notification.id);
                      }}
                      className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Take Action
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.(notification.id);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
