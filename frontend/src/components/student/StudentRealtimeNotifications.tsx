import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useStudentNotifications } from '@/hooks/useStudentNotifications';

interface Notification {
  id: string;
  type: 'offer' | 'event' | 'offer-update' | 'event-update';
  title: string;
  vendorName: string;
  message: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  category?: string;
  image?: string;
  timestamp: Date;
  isRead: boolean;
}

export function StudentRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rtConnected, setRtConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use the student notifications hook
  useStudentNotifications(
    // onNewOffer
    (offer) => {
      const notification: Notification = {
        id: offer.offerId,
        type: 'offer',
        title: offer.title,
        vendorName: offer.vendorName,
        message: offer.message,
        discount: offer.discount,
        discountType: offer.discountType,
        category: offer.category,
        image: offer.image,
        timestamp: new Date(offer.timestamp),
        isRead: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    },
    // onOfferUpdated
    (update) => {
      const notification: Notification = {
        id: update.offerId || '',
        type: 'offer-update',
        title: update.title,
        vendorName: update.vendorName,
        message: update.message,
        timestamp: new Date(update.timestamp),
        isRead: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    },
    // onNewEvent
    (event) => {
      const notification: Notification = {
        id: event.eventId,
        type: 'event',
        title: event.title,
        vendorName: event.vendorName,
        message: event.message,
        category: event.category,
        image: event.image,
        timestamp: new Date(event.timestamp),
        isRead: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    },
    // onEventUpdated
    (update) => {
      const notification: Notification = {
        id: update.eventId || '',
        type: 'event-update',
        title: update.title,
        vendorName: update.vendorName,
        message: update.message,
        timestamp: new Date(update.timestamp),
        isRead: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    },
    // onConnectionStatusChange
    (connected) => {
      setRtConnected(connected);
    },
    // onError
    (error) => {
      console.error('Notification error:', error);
    }
  );

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      'offer': '🎉',
      'event': '🎪',
      'offer-update': '📢',
      'event-update': '📢',
    };
    return icons[type] || '📬';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'offer': 'bg-green-50 border-green-200',
      'event': 'bg-purple-50 border-purple-200',
      'offer-update': 'bg-blue-50 border-blue-200',
      'event-update': 'bg-blue-50 border-blue-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'offer': 'New Offer',
      'event': 'New Event',
      'offer-update': 'Offer Updated',
      'event-update': 'Event Updated',
    };
    return labels[type] || 'Notification';
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              {rtConnected ? '🔴' : '⚪'} Real-time Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {rtConnected && (
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            )}
            {!rtConnected && (
              <Badge className="bg-gray-100 text-gray-800">Disconnected</Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Receive instant updates when vendors add new offers and events
        </p>
      </CardHeader>

      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1">New offers and events will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${getNotificationColor(notif.type)} ${
                  !notif.isRead ? 'border-l-4' : ''
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(notif.type)}
                        </Badge>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900">
                        {notif.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      {notif.discount && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {notif.discount}
                            {notif.discountType === 'percentage' ? '%' : '₹'} OFF
                          </Badge>
                          {notif.category && (
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {notif.category}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {notif.image && (
                    <img
                      src={notif.image}
                      alt={notif.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                </div>
              </div>
            ))}

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="w-full mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
