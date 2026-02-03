'use client'

import { useState, useEffect } from 'react'
import { Trash2, Archive, Calendar } from 'lucide-react'
import { useRealtimeVendor } from '../../hooks/useRealtimeVendor'
import { useToast } from '../../hooks/use-toast'
import { getHeaders, API_BASE_URL } from '../../lib/api'

interface Notification {
  id: string
  type: 'order' | 'verification' | 'discount' | 'alert' | 'system' | 'success' | 'error' | 'info' | 'pending' | 'warning'
  title: string
  message: string
  timestamp: string | Date
  icon?: string
  read: boolean
  actionUrl?: string
}

export function VendorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState('all')
  const { toast } = useToast()

  // Real-time vendor hook
  const { isConnected, requestNotificationsUpdate } = useRealtimeVendor(
    undefined,
    undefined,
    undefined,
    undefined,
    // onNotificationsUpdated
    (notifs) => {
      console.log('Notifications updated via real-time:', notifs)
      setNotifications(notifs)
    },
    undefined,
    undefined,
    // onNotificationReceived
    (notification) => {
      console.log('New notification received:', notification)
      setNotifications(prev => [notification as Notification, ...prev])
      
      // Toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type as any
      })
    }
  )

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Request real-time update
  useEffect(() => {
    if (isConnected) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          requestNotificationsUpdate(user.id)
        } catch (error) {
          console.error('Failed to get vendor ID:', error)
        }
      }
    }
  }, [isConnected, requestNotificationsUpdate])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/notifications`, {
        headers: getHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch notifications')

      const data = await response.json()
      if (data.success && data.data.notifications) {
        setNotifications(data.data.notifications)
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      // Set default empty state instead of showing error
      setNotifications([])
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 border-blue-200'
      case 'verification':
        return 'bg-green-50 border-green-200'
      case 'discount':
        return 'bg-purple-50 border-purple-200'
      case 'alert':
        return 'bg-yellow-50 border-yellow-200'
      case 'system':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with orders, verifications, and alerts {isConnected && <span className="text-green-600">● Live</span>}</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg font-medium transition text-sm"
            >
              Mark All as Read
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition text-sm"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
          <p className="text-gray-600 text-sm font-medium">Total Notifications</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition">
          <p className="text-gray-600 text-sm font-medium">Unread</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{unreadCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition">
          <p className="text-gray-600 text-sm font-medium">Orders</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {notifications.filter(n => n.type === 'order').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition">
          <p className="text-gray-600 text-sm font-medium">Verifications</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {notifications.filter(n => n.type === 'verification').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'unread', 'order', 'verification', 'discount', 'alert'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >
            {f === 'all' ? 'All' : getTypeLabel(f)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-xl p-4 sm:p-6 hover:shadow-md transition cursor-pointer ${getTypeColor(
                notification.type
              )} ${!notification.read ? 'border-l-4' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">{notification.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-bold text-gray-900 ${!notification.read ? 'text-lg' : ''}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                    {typeof notification.timestamp === 'string'
                      ? notification.timestamp
                      : notification.timestamp instanceof Date
                      ? notification.timestamp.toLocaleString()
                      : ''}
                    </p>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                      {getTypeLabel(notification.type)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition"
                      title="Mark as read"
                    >
                      <Archive size={16} className="text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
        <div className="space-y-3">
          {[
            { label: 'New Orders', enabled: true },
            { label: 'Student Verifications', enabled: true },
            { label: 'Low Stock Alerts', enabled: true },
            { label: 'Discount Usage Milestones', enabled: true },
            { label: 'System Updates', enabled: false },
          ].map((pref, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label className="text-gray-700 font-medium">{pref.label}</label>
              <input
                type="checkbox"
                defaultChecked={pref.enabled}
                className="w-5 h-5 cursor-pointer accent-blue-600"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
