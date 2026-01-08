import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page center">
        <div className="card loading-card">
          <div className="loader" />
          <p>Cargando sesion...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
