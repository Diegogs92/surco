import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function SunIcon() {
  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <path
        d="M12 3v2.5M12 18.5V21M4.5 12H3M21 12h-1.5M6 6l-1.7-1.7M19.7 19.7L18 18M6 18l-1.7 1.7M19.7 4.3L18 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M21 14.5a8.5 8.5 0 1 1-11.5-11 7 7 0 1 0 11.5 11Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <div className="brand-inline mobile-only">
        <img className="brand-logo" src="/surco%20logo.svg" alt="Surco" />
        <div>
          <p className="brand-title">Surco</p>
          <p className="brand-subtitle">Gestion agricola al maximo nivel</p>
        </div>
      </div>
      <div className="topbar-actions">
        <button
          className="ghost-button icon"
          onClick={toggleTheme}
          type="button"
          aria-label={`Cambiar a tema ${
            theme === 'dark' ? 'claro' : 'oscuro'
          }`}
          title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
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
