import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, profile, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && (loading || !profile)) {
    return (
      <div className="section-block">
        <p>Dang tai quyen truy cap...</p>
      </div>
    )
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/account" replace />
  }

  return children
}

export default ProtectedRoute
