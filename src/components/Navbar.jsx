import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Bell,
  Users,
  Handshake,
  Package,
  Tractor,
  Map,
  Leaf,
  Calendar,
  Wheat,
  CheckSquare,
  Beef,
  ClipboardList,
  ChartBar,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const navGroups = [
  {
    key: 'general',
    label: 'General',
    icon: ChartBar,
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/campos', label: 'Campos', icon: Map },
      { to: '/reportes', label: 'Reportes', icon: TrendingUp },
      { to: '/alertas', label: 'Alertas', icon: Bell },
    ],
  },
  {
    key: 'recursos',
    label: 'Recursos',
    icon: Settings,
    items: [
      { to: '/personal', label: 'Personal', icon: Users },
      { to: '/proveedores', label: 'Proveedores', icon: Handshake },
      { to: '/insumos', label: 'Insumos', icon: Package },
      { to: '/maquinaria', label: 'Maquinaria', icon: Tractor },
    ],
  },
  {
    key: 'agricultura',
    label: 'Agricultura',
    icon: Sprout,
    items: [
      { to: '/lotes-agricolas', label: 'Lotes', icon: Map },
      { to: '/cultivos', label: 'Cultivos', icon: Leaf },
      { to: '/campanas', label: 'Campañas', icon: Calendar },
      { to: '/registros-agricolas', label: 'Siembra y cosecha', icon: Wheat },
      { to: '/tareas', label: 'Tareas', icon: CheckSquare },
    ],
  },
  {
    key: 'ganaderia',
    label: 'Ganadería',
    icon: Beef,
    items: [
      { to: '/ganaderia', label: 'Ganado', icon: Beef },
      { to: '/insumos?tipo=ganadero', label: 'Insumos ganaderos', icon: Package },
      { to: '/maquinaria?tipo=ganadera', label: 'Maquinaria ganadera', icon: Tractor },
      { to: '/tareas?tipo=ganadera', label: 'Tareas ganaderas', icon: ClipboardList },
    ],
  },
]

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

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRefs = useRef({})
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.navbar-dropdown')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img className="navbar-logo" src="/surco%20logo.svg" alt="Surco" />
        <div>
          <p className="navbar-title">Surco</p>
          <p className="navbar-subtitle">Gestión agrícola</p>
        </div>
      </div>

      <div className="navbar-menu">
        {navGroups.map((group) => {
          const GroupIcon = group.icon
          const isOpen = openDropdown === group.key

          return (
            <div key={group.key} className="navbar-dropdown">
              <button
                type="button"
                className={`navbar-dropdown-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => toggleDropdown(group.key)}
              >
                <GroupIcon size={18} />
                <span>{group.label}</span>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
              </button>

              {isOpen && (
                <div className="navbar-dropdown-menu">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `navbar-dropdown-item ${isActive ? 'active' : ''}`
                        }
                        onClick={() => setOpenDropdown(null)}
                      >
                        <ItemIcon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="navbar-actions">
        <button
          className="ghost-button icon"
          onClick={toggleTheme}
          type="button"
          aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <div className="user-chip">
          <div className="avatar">
            {(user?.displayName || user?.email || 'U').slice(0, 1).toUpperCase()}
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

      <div className="navbar-footer">
        <span className="navbar-hint">Campo y oficina</span>
      </div>
    </nav>
  )
}

export default Navbar
