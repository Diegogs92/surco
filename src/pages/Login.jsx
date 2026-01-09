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
          <img className="brand-logo" src="/surco%20logo.svg" alt="Surco" />
          <div>
            <p className="brand-title">Surco</p>
            <p className="brand-subtitle">Gestion agricola al maximo nivel</p>
          </div>
        </div>
        <h1>Acceso rápido</h1>
        <p>
          Inicia sesión con Google para registrar maquinaria, reportes y
          mantenimientos desde el campo o la oficina.
        </p>
        <button className="primary-button full" onClick={loginWithGoogle}>
          Entrar con Google
        </button>
        <div className="auth-footer">
          <span>Modo offline disponible</span>
          <span>Sincroniza al recuperar conexión</span>
        </div>
      </div>
      <div className="auth-panel">
        <h2>Operación simple, rápida y en terreno.</h2>
        <p>
          Captura reportes en segundos, planifica mantenimientos preventivos y
          revisa historial completo por equipo.
        </p>
        <div className="auth-grid">
          <div>
            <strong>Campos</strong>
            <span>Ubicación y lotes</span>
          </div>
          <div>
            <strong>Cultivos</strong>
            <span>Campañas y rendimiento</span>
          </div>
          <div>
            <strong>Tareas</strong>
            <span>Planificación diaria</span>
          </div>
          <div>
            <strong>Personal</strong>
            <span>Asistencia y costos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
