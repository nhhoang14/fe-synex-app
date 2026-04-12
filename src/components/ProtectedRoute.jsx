import { Navigate } from 'react-router-dom'
import { ROUTES } from '../constants'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, profile, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && (loading || !profile)) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <p className="text-ink">Dang tai quyen truy cap...</p>
      </div>
    )
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.ACCOUNT} replace />
  }

  return children
}

export default ProtectedRoute
