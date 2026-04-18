import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/ui/Spinner.jsx'

export default function ProtectedRoute({ requiredAuth = false, requiredAdmin = false }) {
  const location = useLocation()
  const { user, isAdmin, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Spinner />
      </div>
    )
  }

  if (requiredAdmin) {
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />
    if (!isAdmin) return <Navigate to="/" replace />
  }

  if (requiredAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
