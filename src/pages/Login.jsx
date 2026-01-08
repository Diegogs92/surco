import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const { user, loginWithGoogle } = useAuth()

  if (user) {
    return <Navigate to="/maquinaria" replace />
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">S</span>
          <div>
            <p className="brand-title">Surco</p>
            <p className="brand-subtitle">Gestion inteligente</p>
          </div>
        </div>
        <h1>Acceso rapido</h1>
        <p>
          Inicia sesion con Google para registrar maquinaria, reportes y
          mantenimientos desde el campo o la oficina.
        </p>
        <button className="primary-button full" onClick={loginWithGoogle}>
          Entrar con Google
        </button>
        <div className="auth-footer">
          <span>Modo offline disponible</span>
          <span>Sincroniza al recuperar conexion</span>
        </div>
      </div>
      <div className="auth-panel">
        <h2>Operacion simple, rapida y en terreno.</h2>
        <p>
          Captura reportes en segundos, planifica mantenimientos preventivos y
          revisa historial completo por equipo.
        </p>
        <div className="auth-grid">
          <div>
            <strong>Maquinaria</strong>
            <span>Registro y estado</span>
          </div>
          <div>
            <strong>Reportes</strong>
            <span>Seguimiento y alertas</span>
          </div>
          <div>
            <strong>Usuarios</strong>
            <span>Roles y control</span>
          </div>
          <div>
            <strong>Offline</strong>
            <span>Trabajo continuo</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
