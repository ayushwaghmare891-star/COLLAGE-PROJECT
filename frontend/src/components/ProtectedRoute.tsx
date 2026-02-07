import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Add your authentication logic here (e.g., check localStorage, context, etc.)
  const isSignedIn = !!localStorage.getItem('auth_token')

  if (!isSignedIn) {
    return <Navigate to="/student/login" replace />
  }

  return <>{children}</>
}
