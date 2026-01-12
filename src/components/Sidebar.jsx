import { useState } from 'react'
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
} from 'lucide-react'

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
      { to: '/insumos?tipo=ganadero', label: 'Insumos', icon: Package },
      { to: '/maquinaria?tipo=ganadera', label: 'Maquinaria', icon: Tractor },
      { to: '/tareas?tipo=ganadera', label: 'Tareas', icon: ClipboardList },
    ],
  },
]

function Sidebar() {
  const [openGroups, setOpenGroups] = useState(['general', 'agricultura'])

  const toggleGroup = (key) => {
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src="/surco%20logo.svg" alt="Surco" />
        <div>
          <p className="brand-title">Surco</p>
          <p className="brand-subtitle">Gestión agrícola profesional</p>
        </div>
      </div>
      <nav className="nav">
        {navGroups.map((group) => {
          const isOpen = openGroups.includes(group.key)
          const GroupIcon = group.icon
          return (
            <div key={group.key} className="nav-group">
              <button
                type="button"
                className="nav-group-header"
                onClick={() => toggleGroup(group.key)}
              >
                <span className="nav-group-icon">
                  <GroupIcon size={18} />
                </span>
                <span className="nav-group-label">{group.label}</span>
                <span className={`nav-group-chevron ${isOpen ? 'open' : ''}`}>
                  ›
                </span>
              </button>
              {isOpen && (
                <div className="nav-group-items">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `nav-item ${isActive ? 'active' : ''}`
                        }
                      >
                        <span className="nav-item-icon">
                          <ItemIcon size={16} />
                        </span>
                        <span className="nav-item-label">{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <p>Listo para campo y oficina</p>
      </div>
    </aside>
  )
}

export default Sidebar
