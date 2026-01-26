import { useState } from 'react'
import { Plus, Edit2, Pause, Trash2, Eye, MoreVertical, X } from 'lucide-react'

interface Discount {
  id: string
  name: string
  type: 'percentage' | 'flat'
  value: number
  validity: {
    from: string
    to: string
  }
  status: 'active' | 'inactive' | 'pending'
  category: string
  redemptionCount: number
  viewCount: number
}

interface DiscountManagementProps {
  isCreateMode?: boolean
}

export function DiscountManagement({ isCreateMode = false }: DiscountManagementProps) {
  const [discounts] = useState<Discount[]>([
    {
      id: '1',
      name: '20% Off Electronics',
      type: 'percentage',
      value: 20,
      validity: { from: '2026-01-15', to: '2026-03-31' },
      status: 'active',
      category: 'Electronics',
      redemptionCount: 45,
      viewCount: 234,
    },
    {
      id: '2',
      name: 'Flat ₹500 Off Food',
      type: 'flat',
      value: 500,
      validity: { from: '2026-01-10', to: '2026-02-28' },
      status: 'active',
      category: 'Food & Beverage',
      redemptionCount: 78,
      viewCount: 412,
    },
    {
      id: '3',
      name: 'Buy 1 Get 1 Books',
      type: 'percentage',
      value: 50,
      validity: { from: '2026-02-01', to: '2026-03-15' },
      status: 'pending',
      category: 'Books',
      redemptionCount: 0,
      viewCount: 0,
    },
    {
      id: '4',
      name: '15% Off Apparel',
      type: 'percentage',
      value: 15,
      validity: { from: '2025-12-01', to: '2026-01-10' },
      status: 'inactive',
      category: 'Fashion',
      redemptionCount: 92,
      viewCount: 567,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(isCreateMode)
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'flat',
    value: '',
    category: '',
    fromDate: '',
    toDate: '',
    usageLimit: '',
    applicability: 'both' as 'online' | 'offline' | 'both',
    description: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateDiscount = () => {
    // Handle discount creation
    console.log('Creating discount:', formData)
    setIsModalOpen(false)
    setFormData({
      name: '',
      type: 'percentage',
      value: '',
      category: '',
      fromDate: '',
      toDate: '',
      usageLimit: '',
      applicability: 'both',
      description: '',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
          <p className="text-gray-600 mt-2">Create, manage, and monitor your student discounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Create New Discount
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Status</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Category</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="food">Food & Beverage</option>
              <option value="books">Books</option>
              <option value="fashion">Fashion</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Sort by</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="newest">Newest First</option>
              <option value="views">Most Views</option>
              <option value="redemptions">Most Redemptions</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Discount Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Type & Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Validity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Views / Redemptions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr key={discount.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{discount.name}</p>
                      <p className="text-xs text-gray-600">{discount.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                        {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                      </span>
                      <span className="text-xs text-gray-600">{discount.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-gray-900">{discount.validity.from}</div>
                    <div className="text-xs text-gray-600">to {discount.validity.to}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(discount.status)}`}>
                      {discount.status.charAt(0).toUpperCase() + discount.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Eye size={16} className="text-gray-500" />
                        {discount.viewCount}
                      </div>
                      <div className="flex items-center gap-1 text-gray-700">
                        <span className="text-blue-600 font-medium">{discount.redemptionCount}</span>
                        <span className="text-gray-600">redeemed</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-orange-50 text-orange-600 rounded transition-colors">
                        <Pause size={16} />
                      </button>
                      <div className="relative group">
                        <button className="p-2 hover:bg-gray-100 text-gray-600 rounded transition-colors">
                          <MoreVertical size={16} />
                        </button>
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Eye size={14} /> View Details
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Create New Discount</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Discount Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Title *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., 20% Off Electronics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your discount offer..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="e.g., 20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="food">Food & Beverage</option>
                  <option value="books">Books</option>
                  <option value="fashion">Fashion</option>
                  <option value="health">Health & Beauty</option>
                </select>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid From *</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid Till *</label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit (Optional)</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="e.g., 100 (leave empty for unlimited)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Applicability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applicability *</label>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applicability"
                      value="online"
                      checked={formData.applicability === 'online'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applicability"
                      value="offline"
                      checked={formData.applicability === 'offline'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Offline</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applicability"
                      value="both"
                      checked={formData.applicability === 'both'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Both</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDiscount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
