'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { useRealtimeVendor } from '../../hooks/useRealtimeVendor'
import { useToast } from '../../hooks/use-toast'
import { getHeaders, API_BASE_URL } from '../../lib/api'

interface Overview {
  totalOffers: number
  activeOffers: number
  totalRedemptions: number
  totalDiscount: number
}

interface Order {
  id: string
  studentName?: string
  product?: string
  title?: string
  discount: number
  discountValue?: number
  total?: string
  status: string
  date?: string
  redemptions?: number
  category?: string
  createdAt?: string
}

interface Verification {
  id: string
  studentName: string
  email: string
  university?: string
  documentType: string
  submittedAt: string
  status: string
  documentUrl?: string
  rejectionReason?: string
}

export function VendorDashboardOverview() {
  const [dateRange, setDateRange] = useState('month')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<Verification[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingVerifications, setLoadingVerifications] = useState(false)
  const { toast } = useToast()

  // Real-time vendor hook
  const { isConnected, requestAnalyticsUpdate, requestOrdersUpdate, requestVerificationsUpdate } = useRealtimeVendor(
    undefined,
    // onOrdersUpdated
    (ordersData) => {
      console.log('Orders updated via real-time:', ordersData.orders?.length)
      if (ordersData.orders && Array.isArray(ordersData.orders)) {
        const formattedOrders = ordersData.orders.slice(0, 4).map((order: any) => ({
          id: order.id || order._id,
          title: order.title,
          status: order.status || (order.isActive ? 'active' : 'inactive'),
          discount: order.discountValue || order.discount || 0,
          category: order.category,
          redemptions: order.redemptions || order.currentRedemptions || 0,
          createdAt: order.createdAt
        }))
        setRecentOrders(formattedOrders)
      }
    },
    undefined,
    undefined,
    undefined,
    // onOverviewUpdated
    (overviewData) => {
      console.log('Overview updated via real-time:', overviewData)
      setOverview(overviewData)
    },
    undefined,
    undefined,
    undefined,
    // onVerificationsUpdated
    (verificationsData) => {
      console.log('Verifications updated via real-time:', verificationsData.verifications?.length)
      if (verificationsData.verifications && Array.isArray(verificationsData.verifications)) {
        setPendingVerifications(verificationsData.verifications)
      }
    }
  )

  // Fetch overview on component mount
  useEffect(() => {
    fetchOverview()
    fetchRecentOrders()
    fetchPendingVerifications()
  }, [])

  // Request real-time updates
  useEffect(() => {
    if (isConnected) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          requestAnalyticsUpdate(user.id)
          requestOrdersUpdate(user.id)
          requestVerificationsUpdate(user.id)
        } catch (error) {
          console.error('Failed to get vendor ID:', error)
        }
      }
    }
  }, [isConnected, requestAnalyticsUpdate, requestOrdersUpdate, requestVerificationsUpdate])

  const fetchOverview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/dashboard/overview`, {
        headers: getHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch overview')

      const data = await response.json()
      if (data.success && data.data) {
        setOverview(data.data)
      }
    } catch (error: any) {
      console.error('Error fetching overview:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load overview',
        variant: 'destructive',
      })
    }
  }

  const fetchRecentOrders = async () => {
    setLoadingOrders(true)
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/orders?page=1&limit=4`, {
        headers: getHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch orders')

      const data = await response.json()
      if (data.success && data.data && Array.isArray(data.data.orders)) {
        const formattedOrders = data.data.orders.map((order: any) => ({
          id: order.id || order._id,
          title: order.title,
          product: order.title,
          studentName: `Order ${order.id?.slice(-3)}`,
          discount: `${order.discount}%`,
          total: `₹${(order.originalPrice || 0) * (1 - order.discount / 100) || 'N/A'}`,
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString(),
        }))
        setRecentOrders(formattedOrders)
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      // Silently fail, don't show toast for orders
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchPendingVerifications = async () => {
    setLoadingVerifications(true)
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/pending-verifications?page=1&limit=5`, {
        headers: getHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch verifications')

      const data = await response.json()
      if (data.success && data.data && Array.isArray(data.data.verifications)) {
        setPendingVerifications(data.data.verifications)
      }
    } catch (error: any) {
      console.error('Error fetching verifications:', error)
      // Silently fail, don't show toast for verifications
    } finally {
      setLoadingVerifications(false)
    }
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${((overview?.totalDiscount || 0) / 100000).toFixed(1)}L`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      title: 'Total Orders',
      value: String(overview?.totalRedemptions || 0),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Active Offers',
      value: String(overview?.activeOffers || 0),
      change: '-2%',
      trend: 'down',
      icon: Eye,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Total Offers',
      value: String(overview?.totalOffers || 0),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
    },
  ]

  // Use state variable for recent orders (already being fetched)
  // Remove hardcoded array

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header with Date Range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">Here's your vendor dashboard overview {isConnected && <span className="text-green-600">● Live</span>}</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg transition-all ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-6 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-3 flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp size={14} className="text-green-600" />
                    ) : (
                      <TrendingDown size={14} className="text-red-600" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    <span>from last month</span>
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className={stat.iconColor} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm">
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No orders yet. Create an offer to get started!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Discount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-blue-600">{order.id}</td>
                      <td className="py-3 px-4 text-gray-700">{order.studentName}</td>
                      <td className="py-3 px-4 text-gray-700">{order.product}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{order.discount}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{order.total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Pending Verifications</h2>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
              {pendingVerifications.length}
            </span>
          </div>

          <div className="space-y-4">
            {pendingVerifications.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">No pending verifications</p>
              </div>
            ) : (
              pendingVerifications.map((verification) => (
                <div
                  key={verification.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{verification.studentName}</p>
                      <p className="text-xs text-gray-600 mt-1">{verification.university}</p>
                      <p className="text-xs text-gray-500 mt-1">{verification.documentType}</p>
                      <p className="text-xs text-gray-500 mt-2">{verification.submittedAt}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-xs">
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="w-full mt-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition">
            View All Requests
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-lg transition-all">
          <h3 className="font-semibold text-sm opacity-90">Average Order Value</h3>
          <p className="text-3xl font-bold mt-3">₹8,450</p>
          <p className="text-sm opacity-75 mt-2">Across all transactions</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-lg transition-all">
          <h3 className="font-semibold text-sm opacity-90">Discounts Given</h3>
          <p className="text-3xl font-bold mt-3">₹8,920</p>
          <p className="text-sm opacity-75 mt-2">Total student discounts</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition-all">
          <h3 className="font-semibold text-sm opacity-90">Verification Rate</h3>
          <p className="text-3xl font-bold mt-3">94.2%</p>
          <p className="text-sm opacity-75 mt-2">Students verified</p>
        </div>
      </div>
    </main>
  )
}
