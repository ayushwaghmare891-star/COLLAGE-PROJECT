import { useState } from 'react'
import { Download, Filter, Search } from 'lucide-react'

interface StudentRedemption {
  id: string
  studentName: string
  email: string
  verificationType: 'college-id' | 'email'
  discount: string
  dateOfVisit: string
  redemptionDate: string | null
  status: 'redeemed' | 'pending' | 'viewed'
  usageCount: number
}

export function StudentsRedemptions() {
  const [redemptions] = useState<StudentRedemption[]>([
    {
      id: '1',
      studentName: 'Rahul Sharma',
      email: 'rahul@college.edu',
      verificationType: 'college-id',
      discount: '20% Off Electronics',
      dateOfVisit: '2026-01-15',
      redemptionDate: '2026-01-15',
      status: 'redeemed',
      usageCount: 1,
    },
    {
      id: '2',
      studentName: 'Priya Patel',
      email: 'priya@college.edu',
      verificationType: 'email',
      discount: 'Flat ₹500 Off Food',
      dateOfVisit: '2026-01-14',
      redemptionDate: '2026-01-14',
      status: 'redeemed',
      usageCount: 1,
    },
    {
      id: '3',
      studentName: 'Arjun Singh',
      email: 'arjun@college.edu',
      verificationType: 'college-id',
      discount: '15% Off Apparel',
      dateOfVisit: '2026-01-13',
      redemptionDate: null,
      status: 'pending',
      usageCount: 0,
    },
    {
      id: '4',
      studentName: 'Ananya Gupta',
      email: 'ananya@college.edu',
      verificationType: 'email',
      discount: 'Buy 1 Get 1 Books',
      dateOfVisit: '2026-01-12',
      redemptionDate: null,
      status: 'viewed',
      usageCount: 0,
    },
    {
      id: '5',
      studentName: 'Vikram Kumar',
      email: 'vikram@college.edu',
      verificationType: 'college-id',
      discount: '20% Off Electronics',
      dateOfVisit: '2026-01-11',
      redemptionDate: '2026-01-11',
      status: 'redeemed',
      usageCount: 2,
    },
  ])

  const [filters, setFilters] = useState({
    status: '',
    discountType: '',
    dateRange: 'all',
    searchTerm: '',
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      redeemed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-blue-100 text-blue-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getVerificationBadge = (type: string) => {
    const styles: Record<string, string> = {
      'college-id': 'bg-purple-100 text-purple-800',
      email: 'bg-cyan-100 text-cyan-800',
    }
    return styles[type] || 'bg-gray-100 text-gray-800'
  }

  const stats = [
    { label: 'Total Views', value: '2,451', color: 'text-blue-600' },
    { label: 'Total Redemptions', value: '384', color: 'text-green-600' },
    { label: 'Conversion Rate', value: '15.7%', color: 'text-purple-600' },
    { label: 'Avg. Usage per Student', value: '1.2x', color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students & Redemptions</h1>
          <p className="text-gray-600 mt-2">Track student interactions and redemption activities</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              <option value="redeemed">Redeemed</option>
              <option value="pending">Pending</option>
              <option value="viewed">Viewed</option>
            </select>
          </div>

          {/* Discount Filter */}
          <div>
            <select
              value={filters.discountType}
              onChange={(e) => setFilters({ ...filters, discountType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Discounts</option>
              <option value="20% Off Electronics">20% Off Electronics</option>
              <option value="Flat ₹500 Off Food">Flat ₹500 Off Food</option>
              <option value="15% Off Apparel">15% Off Apparel</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Redemptions Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Student Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Verification</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date of Visit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Usage Count</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((redemption) => (
                <tr key={redemption.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{redemption.studentName}</p>
                      <p className="text-xs text-gray-600">{redemption.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getVerificationBadge(redemption.verificationType)}`}>
                      {redemption.verificationType === 'college-id' ? 'College ID' : 'Email'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{redemption.discount}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="text-gray-900">{redemption.dateOfVisit}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(redemption.status)}`}>
                      {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{redemption.usageCount}</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(redemption.usageCount / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Showing 1 to 5 of 247 results</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Previous
          </button>
          <div className="flex gap-1">
            {[1, 2, 3, '...', 10].map((page, idx) => (
              <button
                key={idx}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  page === 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
