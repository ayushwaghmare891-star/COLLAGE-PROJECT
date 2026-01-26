import { TrendingUp, Eye, Zap, Clock, Heart } from 'lucide-react'

interface StatCard {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  gradient: string
}

export function DashboardOverview() {
  const stats: StatCard[] = [
    {
      title: 'Active Discounts',
      value: 12,
      subtitle: 'Currently running',
      icon: <Zap className="w-6 h-6" />,
      trend: { value: 15, isPositive: true },
      gradient: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Total Student Views',
      value: '2,451',
      subtitle: 'This month',
      icon: <Eye className="w-6 h-6" />,
      trend: { value: 24, isPositive: true },
      gradient: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Total Redemptions',
      value: '384',
      subtitle: 'All-time',
      icon: <Zap className="w-6 h-6" />,
      trend: { value: 8, isPositive: true },
      gradient: 'from-green-50 to-green-100'
    },
    {
      title: 'Pending Approval',
      value: 3,
      subtitle: 'Awaiting review',
      icon: <Clock className="w-6 h-6" />,
      trend: { value: 12, isPositive: false },
      gradient: 'from-orange-50 to-orange-100'
    },
    {
      title: 'Account Health',
      value: '95%',
      subtitle: 'Excellent',
      icon: <Heart className="w-6 h-6" />,
      trend: { value: 5, isPositive: true },
      gradient: 'from-red-50 to-red-100'
    },
  ]

  const getGradientClasses = (gradient: string) => {
    const gradients: Record<string, string> = {
      'from-blue-50 to-blue-100': 'from-blue-50 to-blue-100',
      'from-purple-50 to-purple-100': 'from-purple-50 to-purple-100',
      'from-green-50 to-green-100': 'from-green-50 to-green-100',
      'from-orange-50 to-orange-100': 'from-orange-50 to-orange-100',
      'from-red-50 to-red-100': 'from-red-50 to-red-100',
    }
    return gradients[gradient] || gradient
  }

  const getIconColor = (gradient: string) => {
    const colors: Record<string, string> = {
      'from-blue-50 to-blue-100': 'text-blue-600',
      'from-purple-50 to-purple-100': 'text-purple-600',
      'from-green-50 to-green-100': 'text-green-600',
      'from-orange-50 to-orange-100': 'text-orange-600',
      'from-red-50 to-red-100': 'text-red-600',
    }
    return colors[gradient] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your business performance at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${getGradientClasses(stat.gradient)} rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            {/* Icon */}
            <div className={`inline-flex p-3 rounded-lg mb-4 ${getIconColor(stat.gradient)} bg-white bg-opacity-60`}>
              {stat.icon}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-600">{stat.subtitle}</p>
                {stat.trend && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    <TrendingUp size={14} />
                    {stat.trend.value}%
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-left">
              + Create New Discount
            </button>
            <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-left">
              View All Discounts
            </button>
            <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-left">
              Download Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'New discount created', detail: '20% Off Campus Pizza', time: '2 hours ago', color: 'bg-green-100 text-green-700' },
              { action: 'Student redemption', detail: 'Electronics Store Coupon', time: '4 hours ago', color: 'bg-blue-100 text-blue-700' },
              { action: 'Discount expired', detail: 'Summer Sale - Now Inactive', time: '1 day ago', color: 'bg-orange-100 text-orange-700' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-600">{item.detail}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${item.color}`}>
                    {item.action}
                  </span>
                  <span className="text-xs text-gray-600">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
