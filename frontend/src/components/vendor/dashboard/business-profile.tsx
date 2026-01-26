import { useState } from 'react'
import { Edit2, Save, X, Upload, AlertCircle } from 'lucide-react'

export function BusinessProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [businessData, setBusinessData] = useState({
    businessName: 'Tech Hub Electronics',
    category: 'Electronics Retail',
    description: 'Leading electronics retailer offering quality products and excellent customer service to students.',
    address: 'MG Road, Bangalore, Karnataka 560001',
    contactPhone: '+91 98765 43210',
    website: 'www.techhubelec.com',
    socialLinks: {
      instagram: '@techhubelec',
      facebook: 'techhubelec',
      twitter: '@techhubelec',
    },
  })

  const [formData, setFormData] = useState(businessData)
  const [profileCompleteness] = useState(92)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [socialKey]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = () => {
    setBusinessData(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(businessData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600 mt-2">Manage your business information and details</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Edit2 size={20} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Completeness */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Completeness</h2>
            <p className="text-sm text-gray-600">Keep your profile up-to-date to attract more students</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">{profileCompleteness}%</p>
            <p className="text-xs text-gray-600">Complete</p>
          </div>
        </div>
        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-green-200">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${profileCompleteness}%` }}
          />
        </div>
        {profileCompleteness < 100 && (
          <p className="text-xs text-gray-600 mt-3">Add business logo and social media links to complete your profile</p>
        )}
      </div>

      {/* Logo & Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              TH
            </div>
            {isEditing && (
              <button className="mt-4 flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium w-full justify-center">
                <Upload size={16} />
                Change Logo
              </button>
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Electronics Retail">Electronics Retail</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Books">Books</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{businessData.businessName}</h2>
                <p className="text-sm text-gray-600 mt-1">{businessData.category}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Description</h3>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your business..."
              />
            ) : (
              <p className="text-gray-700">{businessData.description}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Address *</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700">{businessData.address}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Contact Phone *</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700">{businessData.contactPhone}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <a href={`https://${businessData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {businessData.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
            <div className="space-y-4">
              {Object.entries(businessData.socialLinks).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-2 capitalize">{key}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={`social.${key}`}
                      value={formData.socialLinks[key as keyof typeof formData.socialLinks]}
                      onChange={handleInputChange}
                      placeholder={`@${key}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-700">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Discounts</span>
                <span className="font-bold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Views</span>
                <span className="font-bold text-gray-900">2,451</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Redemptions</span>
                <span className="font-bold text-gray-900">384</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Account Created</span>
                <span className="font-semibold text-gray-900">Jan 2026</span>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Complete Verification</h4>
                <p className="text-sm text-blue-800 mt-1">Complete your business verification to unlock all features and build student trust.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <X size={20} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
