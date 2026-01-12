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
import FieldWeatherBadges from './FieldWeatherBadges.jsx'

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

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRefs = useRef({})

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

      <FieldWeatherBadges />

      <div className="navbar-footer">
        <span className="navbar-hint">Campo y oficina</span>
      </div>
    </nav>
  )
}

export default Navbar
