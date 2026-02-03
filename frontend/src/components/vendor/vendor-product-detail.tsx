'use client'

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Save } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface Product {
  id: string
  name: string
  category: string
  price: string
  stock?: number
  image?: string
  status?: string
  description?: string
}

export function VendorProductDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<Product | null>(
    location.state?.product || null
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Product | null>(
    location.state?.product || null
  )

  useEffect(() => {
    // Product is passed via location state when navigating from dashboard
    if (location.state?.product) {
      setProduct(location.state.product)
      setEditData(location.state.product)
    }
  }, [location.state])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editData) {
      setProduct(editData)
      
      // Update in localStorage
      const productsStr = localStorage.getItem('vendorProducts')
      if (productsStr) {
        try {
          const products = JSON.parse(productsStr)
          const updated = products.map((p: Product) => 
            p.id === editData.id ? editData : p
          )
          localStorage.setItem('vendorProducts', JSON.stringify(updated))
        } catch (error) {
          console.error('Error updating products:', error)
        }
      }

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      })
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      const productsStr = localStorage.getItem('vendorProducts')
      if (productsStr) {
        try {
          const products = JSON.parse(productsStr)
          const updated = products.filter((p: Product) => p.id !== editData?.id)
          localStorage.setItem('vendorProducts', JSON.stringify(updated))
        } catch (error) {
          console.error('Error deleting product:', error)
        }
      }

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      })
      navigate('/vendor/dashboard')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(product)
  }

  if (!product) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Product not found</p>
            <button
              onClick={() => navigate('/vendor/dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Products
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Product Details'}
            </h1>
            <p className="text-gray-600 mt-1">{product.name}</p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Edit2 size={20} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Trash2 size={20} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Product Image/Icon */}
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-8xl">{product.image || '📦'}</span>
        </div>

        {/* Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData?.name || ''}
                onChange={(e) => setEditData(editData ? { ...editData, name: e.target.value } : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 font-semibold text-lg">{product.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            {isEditing ? (
              <select
                value={editData?.category || ''}
                onChange={(e) => setEditData(editData ? { ...editData, category: e.target.value } : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Books">Books</option>
                <option value="Services">Services</option>
              </select>
            ) : (
              <p className="text-gray-900 font-semibold text-lg">{product.category}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData?.price || ''}
                onChange={(e) => setEditData(editData ? { ...editData, price: e.target.value } : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="₹0.00"
              />
            ) : (
              <p className="text-gray-900 font-semibold text-lg">{product.price}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editData?.stock || 0}
                onChange={(e) => setEditData(editData ? { ...editData, stock: parseInt(e.target.value) || 0 } : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 font-semibold text-lg">{product.stock || 0} units</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              product.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {product.status || 'inactive'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editData?.description || ''}
              onChange={(e) => setEditData(editData ? { ...editData, description: e.target.value } : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Enter product description"
            />
          ) : (
            <p className="text-gray-700">
              {product.description || 'No description provided'}
            </p>
          )}
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
