import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import WeatherWidget from './WeatherWidget.jsx'

function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <div>
        <p className="topbar-title">Operacion agricola</p>
        <p className="topbar-subtitle">Campos, cultivos y costos en un solo lugar</p>
      </div>
      <WeatherWidget />
      <div className="topbar-actions">
        <button className="ghost-button" onClick={toggleTheme} type="button">
          Tema: {theme === 'dark' ? 'Oscuro' : 'Claro'}
        </button>
        <div className="user-chip">
          <div className="avatar">
            {(user?.displayName || user?.email || 'U')
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <div>
            <p>{user?.displayName || 'Usuario'}</p>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="primary-button" onClick={logout} type="button">
          Salir
        </button>
      </div>
    </header>
  )
}

export default Topbar
