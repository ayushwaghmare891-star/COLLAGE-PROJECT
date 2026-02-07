import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useToast } from './use-toast';

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'offer' | 'announcement' | 'general';
  createdAt: string;
  isRead: boolean;
}

interface UseRealtimeNotificationsOptions {
  userId?: string;
  userType?: 'student' | 'admin' | 'vendor';
  onNotification?: (notification: Notification) => void;
  enabled?: boolean;
}

/**
 * Custom hook for real-time notifications using Socket.IO
 * Handles connection, listening for notifications, and emitting events
 */
export const useRealtimeNotifications = ({
  userId,
  userType = 'student',
  onNotification,
  enabled = true,
}: UseRealtimeNotificationsOptions) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    if (!enabled || !userId) return;

    try {
      // Get socket server URL
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

      // Create socket connection
      const newSocket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = newSocket;

      /**
       * Connection established
       */
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);

        // Join user-specific notification room
        if (userType === 'student') {
          newSocket.emit('student:join', userId);
        } else if (userType === 'admin') {
          newSocket.emit('admin:notification:join', userId);
        } else if (userType === 'vendor') {
          newSocket.emit('vendor:notification:join', userId);
        }

        // Request unread count on connection
        newSocket.emit('notification:request-unread-count', userId);
      });

      /**
       * Handle new notification
       */
      newSocket.on('newNotification', (notification: Notification) => {
        console.log('📬 New notification received:', notification);

        // Add to notifications list
        setNotifications((prev) => [notification, ...prev]);

        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });

        // Call custom callback if provided
        if (onNotification) {
          onNotification(notification);
        }
      });

      /**
       * Handle notification marked as read
       */
      newSocket.on('notificationRead', (data: { notificationId: string; isRead: boolean }) => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === data.notificationId ? { ...notif, isRead: data.isRead } : notif
          )
        );
      });

      /**
       * Handle all notifications marked as read
       */
      newSocket.on('allNotificationsRead', () => {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      });

      /**
       * Handle unread count update
       */
      newSocket.on('notification:unread-count', (data: { unreadCount: number }) => {
        setUnreadCount(data.unreadCount);
      });

      /**
       * Handle connection status
       */
      newSocket.on('connection:status', (data: { connected: boolean; message: string }) => {
        console.log('Connection status:', data.message);
      });

      /**
       * Handle errors
       */
      newSocket.on('error:broadcast', (data: { message: string }) => {
        console.error('Socket error:', data.message);
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
          duration: 3000,
        });
      });

      /**
       * Handle disconnection
       */
      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      /**
       * Handle connection errors
       */
      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId, userType, enabled, onNotification, toast]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    (notificationId: string) => {
      if (socket) {
        socket.emit('notification:mark-read', {
          notificationId,
          userId,
        });
      }
    },
    [socket, userId]
  );

  /**
   * Request unread count
   */
  const requestUnreadCount = useCallback(() => {
    if (socket && userId) {
      socket.emit('notification:request-unread-count', userId);
    }
  }, [socket, userId]);

  /**
   * Broadcast notification to specific user type
   */
  const broadcastNotification = useCallback(
    (
      title: string,
      message: string,
      type: 'event' | 'offer' | 'announcement' | 'general',
      targetId?: string
    ) => {
      if (socket) {
        const eventName =
          userType === 'admin'
            ? 'broadcast:admin-notification'
            : userType === 'vendor'
              ? 'broadcast:vendor-notification'
              : 'broadcast:student-notification';

        socket.emit(eventName, {
          title,
          message,
          type,
          [`${userType}Id`]: targetId,
        });
      }
    },
    [socket, userType]
  );

  /**
   * Add notification to local state (useful for optimistic updates)
   */
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Get count of unread notifications
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notif) => !notif.isRead).length;
  }, [notifications]);

  return {
    socket,
    connected,
    notifications,
    unreadCount,
    markAsRead,
    requestUnreadCount,
    broadcastNotification,
    addNotification,
    clearNotifications,
    getUnreadNotifications,
  };
};

export default useRealtimeNotifications;
