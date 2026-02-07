import { getHeaders, API_BASE_URL } from './api';

const NOTIFICATIONS_URL = `${API_BASE_URL}/notifications`;

// Notification API endpoints
export const notificationAPI = {
  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @returns {Promise}
   */
  createNotification: async (data: any) => {
    const response = await fetch(NOTIFICATIONS_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Get all notifications for the logged-in user
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise}
   */
  getNotifications: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${NOTIFICATIONS_URL}?${queryString}` : NOTIFICATIONS_URL;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Get unread notification count
   * @returns {Promise}
   */
  getUnreadCount: async () => {
    const response = await fetch(`${NOTIFICATIONS_URL}/unread-count`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Get a specific notification by ID
   * @param {String} id - Notification ID
   * @returns {Promise}
   */
  getNotificationById: async (id: string) => {
    const response = await fetch(`${NOTIFICATIONS_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Mark a notification as read
   * @param {String} id - Notification ID
   * @returns {Promise}
   */
  markAsRead: async (id: string) => {
    const response = await fetch(`${NOTIFICATIONS_URL}/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllAsRead: async () => {
    const response = await fetch(`${NOTIFICATIONS_URL}/mark-all/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return response.json();
  },

  /**
   * Delete a notification
   * @param {String} id - Notification ID
   * @returns {Promise}
   */
  deleteNotification: async (id: string) => {
    const response = await fetch(`${NOTIFICATIONS_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },
};

export default notificationAPI;
