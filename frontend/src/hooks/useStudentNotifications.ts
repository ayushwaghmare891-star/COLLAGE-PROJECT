import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface OfferNotification {
  offerId: string;
  vendorId: string;
  vendorName: string;
  title: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  category: string;
  description?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  timestamp: Date;
  notificationType: 'offer';
  message: string;
}

interface EventNotification {
  eventId: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  timestamp: Date;
  notificationType: 'event';
  message: string;
}

interface UpdateNotification {
  offerId?: string;
  eventId?: string;
  vendorId: string;
  vendorName: string;
  title: string;
  isActive: boolean;
  timestamp: Date;
  notificationType: 'offer-update' | 'event-update';
  message: string;
}

export function useStudentNotifications(
  // Callbacks for different notification types
  onNewOffer?: (offer: OfferNotification) => void,
  onOfferUpdated?: (update: UpdateNotification) => void,
  onNewEvent?: (event: EventNotification) => void,
  onEventUpdated?: (update: UpdateNotification) => void,
  onConnectionStatusChange?: (connected: boolean) => void,
  onError?: (error: string) => void
) {
  const socketRef = useRef<Socket | null>(null);
  const reconnectCounterRef = useRef(0);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');

      if (!token) {
        console.warn('⚠️ No auth token found for student notifications');
        return;
      }

      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        query: {
          token,
          userId: studentId,
          role: 'student'
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      // Connection established
      socketRef.current.on('connect', () => {
        console.log('✅ Student connected to notifications socket');
        reconnectCounterRef.current = 0;
        if (studentId) {
          socketRef.current?.emit('student:subscribe-notifications', studentId);
        }
        onConnectionStatusChange?.(true);
      });

      // New offer notification
      socketRef.current.on('student:new-offer', (data: OfferNotification) => {
        console.log('🎉 New offer notification received:', data);
        onNewOffer?.(data);
      });

      // Offer updated notification
      socketRef.current.on('student:offer-updated', (data: UpdateNotification) => {
        console.log('📢 Offer updated notification received:', data);
        onOfferUpdated?.(data);
      });

      // New event notification
      socketRef.current.on('student:new-event', (data: EventNotification) => {
        console.log('🎪 New event notification received:', data);
        onNewEvent?.(data);
      });

      // Event updated notification
      socketRef.current.on('student:event-updated', (data: UpdateNotification) => {
        console.log('📢 Event updated notification received:', data);
        onEventUpdated?.(data);
      });

      // Subscription confirmation
      socketRef.current.on('student:subscribed', (data) => {
        console.log('📌 Subscription confirmed:', data);
      });

      // Error handling
      socketRef.current.on('error:broadcast', (data) => {
        console.error('❌ Broadcast error:', data);
        onError?.(data.message);
      });

      socketRef.current.on('error', (error) => {
        console.error('❌ Socket error:', error);
        onError?.(error);
      });

      // Disconnection
      socketRef.current.on('disconnect', (reason) => {
        console.warn('⚠️ Student notifications disconnected:', reason);
        onConnectionStatusChange?.(false);

        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          socketRef.current?.connect();
        } else if (reconnectCounterRef.current < 5) {
          reconnectCounterRef.current++;
          const delay = Math.pow(2, reconnectCounterRef.current) * 1000;
          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectCounterRef.current})`);
          setTimeout(() => {
            if (!socketRef.current?.connected) {
              connect();
            }
          }, delay);
        }
      });

      // Server ping response
      socketRef.current.on('server:ping', () => {
        console.log('📡 Server ping received');
      });

    } catch (error) {
      console.error('❌ Failed to initialize student notifications socket:', error);
      onError?.(`Socket initialization failed: ${error}`);
    }
  }, [onNewOffer, onOfferUpdated, onNewEvent, onEventUpdated, onConnectionStatusChange, onError]);

  const disconnect = useCallback(() => {
    const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
    if (studentId && socketRef.current) {
      socketRef.current.emit('student:unsubscribe-notifications', studentId);
    }
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected: socketRef.current?.connected ?? false,
    disconnect,
    socket: socketRef.current,
  };
}
