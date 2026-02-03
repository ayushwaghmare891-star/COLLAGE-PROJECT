import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../hooks/use-toast'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { toast } = useToast()
  
  const [showPassword, setShowPassword] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      const success = await login(formData.email, formData.password, 'admin')
      
      if (success) {
        toast({
          title: '🛡️ Welcome back, Admin!',
          description: "You've successfully logged in to the admin panel",
        })
        // Redirect to admin dashboard
        navigate('/admin/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`w-full h-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-3 sm:p-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center mb-8 sm:mb-12 px-2">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4">Admin Panel</h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 opacity-90">Secure administration access</p>
      </div>
      <div className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-visible transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="relative">
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
            <button
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => navigate('/'), 300)
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          <div className="pt-12 sm:pt-16 px-3 sm:px-4 md:px-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Login</h3>
            <p className="text-sm text-gray-600 mb-6">Enter your credentials to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="px-3 sm:px-4 md:px-8 space-y-4 sm:space-y-6 pb-8">
            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <div className="px-3 sm:px-4 md:px-8 py-4 sm:py-6 bg-gray-50 rounded-b-3xl border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 text-center">
            Not authorized? <span className="text-gray-400">Contact system administrator</span>
          </p>
        </div>
      </div>
    </div>
  )
}
