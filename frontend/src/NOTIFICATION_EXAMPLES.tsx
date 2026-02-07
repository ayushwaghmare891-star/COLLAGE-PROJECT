/**
 * Real-Time Notification Feature - Frontend Usage Examples
 * This file demonstrates how to use the notification system in React components
 */

import React, { useEffect } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import notificationAPI from '@/lib/notificationAPI';
import { useToast } from '@/hooks/use-toast';

/**
 * EXAMPLE 1: Using NotificationBell in TopBar
 * Already integrated in TopBar.tsx
 */
// import NotificationBell from '@/components/NotificationBell';
// <NotificationBell userId={user?.id} userType="student" />

/**
 * EXAMPLE 2: Custom component with notification hook
 */
export const NotificationDashboard = ({ userId }) => {
  const { toast } = useToast();
  const {
    socket,
    connected,
    notifications,
    unreadCount,
    markAsRead,
    requestUnreadCount,
    broadcastNotification,
  } = useRealtimeNotifications({
    userId,
    userType: 'student',
    enabled: true,
    onNotification: (notification) => {
      console.log('New notification:', notification);
    },
  });

  return (
    <div className="p-4">
      <h1>Notifications</h1>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <p>Unread: {unreadCount}</p>

      <div className="mt-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="p-2 border rounded mb-2">
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            <button onClick={() => markAsRead(notif.id)}>Mark as Read</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * EXAMPLE 3: Create notification from admin panel
 */
export const CreateNotificationForm = ({ adminId }) => {
  const { toast } = useToast();

  const handleCreateNotification = async (formData) => {
    try {
      const response = await notificationAPI.createNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type, // 'event', 'offer', 'announcement', 'general'
        isGlobal: formData.isGlobal, // true to send to all students
        studentId: formData.studentId || null, // Specific student
        metadata: {
          icon: formData.icon,
          action_url: formData.actionUrl,
          tags: formData.tags?.split(',') || [],
        },
      });

      toast({
        title: 'Success',
        description: 'Notification created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create notification',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleCreateNotification({
        title: formData.get('title'),
        message: formData.get('message'),
        type: formData.get('type'),
        isGlobal: formData.get('isGlobal') === 'on',
        studentId: formData.get('studentId'),
        icon: formData.get('icon'),
        actionUrl: formData.get('actionUrl'),
        tags: formData.get('tags'),
      });
    }}>
      <input name="title" placeholder="Notification Title" required />
      <textarea name="message" placeholder="Message" required />
      <select name="type" required>
        <option value="general">General</option>
        <option value="offer">Offer</option>
        <option value="event">Event</option>
        <option value="announcement">Announcement</option>
      </select>
      <label>
        <input name="isGlobal" type="checkbox" />
        Send to all students
      </label>
      <input name="studentId" placeholder="Student ID (if not global)" />
      <input name="icon" placeholder="Icon name" />
      <input name="actionUrl" placeholder="Action URL" />
      <input name="tags" placeholder="Tags (comma separated)" />
      <button type="submit">Create Notification</button>
    </form>
  );
};

/**
 * EXAMPLE 4: Notification preferences component
 */
export const NotificationPreferences = ({ userId }) => {
  const [preferences, setPreferences] = React.useState({
    enableOfferNotifications: true,
    enableEventNotifications: true,
    enableAnnouncementNotifications: true,
    notificationSound: true,
    notificationBadge: true,
  });

  const handleSavePreferences = async () => {
    // Save to localStorage or backend API
    localStorage.setItem(
      `notification-preferences-${userId}`,
      JSON.stringify(preferences)
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2>Notification Preferences</h2>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={preferences.enableOfferNotifications}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              enableOfferNotifications: e.target.checked,
            })
          }
        />
        <span className="ml-2">Offer Notifications</span>
      </label>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={preferences.enableEventNotifications}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              enableEventNotifications: e.target.checked,
            })
          }
        />
        <span className="ml-2">Event Notifications</span>
      </label>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={preferences.enableAnnouncementNotifications}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              enableAnnouncementNotifications: e.target.checked,
            })
          }
        />
        <span className="ml-2">Announcement Notifications</span>
      </label>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={preferences.notificationSound}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              notificationSound: e.target.checked,
            })
          }
        />
        <span className="ml-2">Sound</span>
      </label>

      <button onClick={handleSavePreferences}>Save Preferences</button>
    </div>
  );
};

/**
 * EXAMPLE 5: Real-time notification counter
 */
export const NotificationCounter = ({ userId, userType = 'student' }) => {
  const { unreadCount, requestUnreadCount } = useRealtimeNotifications({
    userId,
    userType,
    enabled: !!userId,
  });

  return (
    <div className="relative inline-block">
      <button>View Notifications</button>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

/**
 * EXAMPLE 6: Listen to specific notification types
 */
export const OfferNotificationListener = ({ userId }) => {
  const { notifications } = useRealtimeNotifications({
    userId,
    userType: 'student',
  });

  // Filter only offer notifications
  const offerNotifications = notifications.filter((n) => n.type === 'offer');

  useEffect(() => {
    console.log('New offers:', offerNotifications);
  }, [offerNotifications]);

  return (
    <div>
      <h2>New Offers ({offerNotifications.length})</h2>
      <ul>
        {offerNotifications.map((offer) => (
          <li key={offer.id}>
            {offer.title}: {offer.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * EXAMPLE 7: Fetch and display all notifications
 */
export const AllNotificationsPage = ({ userId }) => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const { toast } = useToast();

  const loadNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({
        page: pageNum,
        limit: 20,
      });

      if (response.data.success) {
        setNotifications(
          response.data.notifications.map((n) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            createdAt: n.createdAt,
            isRead: n.isRead,
          }))
        );
        setTotalPages(response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="p-4">
      <h1>All Notifications</h1>

      <div className="space-y-2">
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="p-3 border rounded">
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
              <small>{new Date(notif.createdAt).toLocaleString()}</small>
              <span>{notif.isRead ? '✓ Read' : 'Unread'}</span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex gap-2 justify-center">
        <button
          disabled={page === 1}
          onClick={() => loadNotifications(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => loadNotifications(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

/**
 * EXAMPLE 8: Broadcast notification (Admin only)
 */
export const BroadcastNotificationForm = ({ adminId }) => {
  const { socket, broadcastNotification } = useRealtimeNotifications({
    userId: adminId,
    userType: 'admin',
  });
  const { toast } = useToast();

  const handleBroadcast = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    broadcastNotification(
      formData.get('title'),
      formData.get('message'),
      formData.get('type')
    );

    // Also save via API
    notificationAPI.createNotification({
      title: formData.get('title'),
      message: formData.get('message'),
      type: formData.get('type'),
      isGlobal: true,
    });

    toast({
      title: 'Success',
      description: 'Notification broadcasted',
    });

    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleBroadcast} className="space-y-4 p-4">
      <h2>Broadcast Notification</h2>

      <input
        name="title"
        placeholder="Title"
        required
        className="w-full p-2 border rounded"
      />

      <textarea
        name="message"
        placeholder="Message"
        required
        className="w-full p-2 border rounded"
      />

      <select name="type" className="w-full p-2 border rounded" required>
        <option value="general">General</option>
        <option value="offer">Offer</option>
        <option value="event">Event</option>
        <option value="announcement">Announcement</option>
      </select>

      <button
        type="submit"
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Broadcast Now
      </button>
    </form>
  );
};

/**
 * EXAMPLE 9: Vendor notification for new order
 */
export const VendorOrderNotificationListener = ({ vendorId }) => {
  const { notifications, markAsRead } = useRealtimeNotifications({
    userId: vendorId,
    userType: 'vendor',
    onNotification: (notification) => {
      // Play sound
      const audio = new Audio('/notification-sound.mp3');
      audio.play();
    },
  });

  const orderNotifications = notifications.filter((n) => n.type === 'offer');

  return (
    <div className="p-4">
      <h2>New Orders ({orderNotifications.filter((n) => !n.isRead).length})</h2>
      {orderNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-3 rounded mb-2 ${notif.isRead ? 'bg-gray-100' : 'bg-yellow-100'}`}
        >
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          {!notif.isRead && (
            <button
              onClick={() => markAsRead(notif.id)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
