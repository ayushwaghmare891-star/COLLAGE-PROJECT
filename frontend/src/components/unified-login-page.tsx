import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

type UserRole = 'student' | 'admin'

interface RoleOption {
  id: UserRole
  label: string
  dashboardPath: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'student',
    label: 'Student',
    dashboardPath: '/dashboard',
  },
  {
    id: 'admin',
    label: 'Admin',
    dashboardPath: '/admin/dashboard',
  },
]

export function UnifiedLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [wrongRoleError, setWrongRoleError] = useState<{ message: string; correctRole: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get available roles based on current page
  // On /student/login: only show student
  // On /login: show all roles
  const getAvailableRoles = (): RoleOption[] => {
    if (location.pathname.includes('/student/login')) {
      // Student login page: only student
      return ROLE_OPTIONS.filter(role => role.id === 'student')
    }
    // General login page: all roles
    return ROLE_OPTIONS
  }

  // Determine if we're on a specific role's login page or the general login page
  const isSpecificRolePage = (): boolean => {
    return location.pathname.includes('/student/login')
  }

  // Determine primary role based on current location
  const getPrimaryRole = (): UserRole => {
    if (location.pathname.includes('/student')) {
      return 'student'
    } else if (location.pathname.includes('/admin')) {
      return 'admin'
    }
    return 'student' // default to student
  }

  // Get login order based on page type
  // On specific role pages (/student/login): only try that role
  // On general /login page: try all roles in order
  const getLoginOrder = (): UserRole[] => {
    if (location.pathname.includes('/student/login')) {
      // Student login page: only student
      return ['student']
    }
    
    // For general /login page, try all roles in order
    const primaryRole = getPrimaryRole()
    const otherRoles: UserRole[] = ['student', 'admin'].filter(r => r !== primaryRole) as UserRole[]
    return [primaryRole, ...otherRoles]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setWrongRoleError(null)
    setIsLoading(true)

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      // Get roles in priority order
      const rolesInOrder = getLoginOrder()
      let success = false
      let wrongRoleInfo: any = null

      // Try each role in order until one succeeds
      for (const role of rolesInOrder) {
        try {
          success = await login(formData.email, formData.password, role)
          if (success) {
            break
          }
        } catch (roleError: any) {
          // If this is a WRONG_ROLE error, store that info
          if (roleError.code === 'WRONG_ROLE') {
            wrongRoleInfo = {
              message: roleError.message,
              correctRole: roleError.correctRole
            }
          }
          
          console.log(`Login attempt failed for role ${role}:`, roleError)
          continue
        }
      }

      if (success) {
        // Get the actual role from the auth store (server determined the real role)
        const currentUser = user
        const userRole = currentUser?.role || 'student'
        
        const roleOption = ROLE_OPTIONS.find(r => r.id === userRole as UserRole)
        navigate(roleOption?.dashboardPath || '/')
      } else {
        // If we detected a wrong role, show that message with a helpful link
        if (wrongRoleInfo) {
          setWrongRoleError(wrongRoleInfo)
        } else {
          // Provide specific error message based on page type
          if (isSpecificRolePage()) {
            const primaryRole = getPrimaryRole()
            setError(`Invalid ${primaryRole} email or password. Please check your credentials and try again.`)
          } else {
            setError('Invalid email or password')
          }
        }
      }
    } catch (err: any) {
      // Network or other errors (not auth failures)
      setError(err.message || 'Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Always show login form - no card selector
  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="text-center mb-8 sm:mb-12 px-2">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4">Welcome Back!</h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 opacity-90">Login to your account</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative">
          {/* Home button */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
            <button
              onClick={() => navigate('/')}
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Home
            </button>
          </div>

          {/* Header section */}
          <div className="pt-12 sm:pt-16 px-3 sm:px-4 md:px-8 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Login</h3>
            {location.pathname.includes('/student/login') ? (
              <p className="text-sm text-gray-600 mb-6">Student Portal - Enter your credentials</p>
            ) : (
              <p className="text-sm text-gray-600 mb-6">Enter your email and password</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-3 sm:px-4 md:px-8 space-y-4 sm:space-y-6 pb-8">
            {/* Wrong Role Error message with helpful link */}
            {wrongRoleError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm space-y-2">
                <p>{wrongRoleError.message}</p>
                <button
                  type="button"
                  onClick={() => {
                    const rolePathMap = {
                      'student': '/student/login',
                      'admin': '/admin/login'
                    }
                    navigate(rolePathMap[wrongRoleError.correctRole as keyof typeof rolePathMap])
                  }}
                  className="text-amber-600 hover:text-amber-800 font-medium underline"
                >
                  Go to {wrongRoleError.correctRole} login →
                </button>
              </div>
            )}

            {/* Regular Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs sm:text-sm text-gray-600">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
