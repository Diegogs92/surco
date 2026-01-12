import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navGroups = [
  {
    key: 'general',
    label: 'General',
    icon: '📊',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
      { to: '/campos', label: 'Campos', icon: '🌾' },
      { to: '/reportes', label: 'Reportes', icon: '📈' },
      { to: '/alertas', label: 'Alertas', icon: '🔔' },
    ],
  },
  {
    key: 'recursos',
    label: 'Recursos',
    icon: '🛠️',
    items: [
      { to: '/personal', label: 'Personal', icon: '👥' },
      { to: '/proveedores', label: 'Proveedores', icon: '🤝' },
      { to: '/insumos', label: 'Insumos', icon: '📦' },
      { to: '/maquinaria', label: 'Maquinaria', icon: '🚜' },
    ],
  },
  {
    key: 'agricultura',
    label: 'Agricultura',
    icon: '🌱',
    items: [
      { to: '/lotes-agricolas', label: 'Lotes agrícolas', icon: '🗺️' },
      { to: '/cultivos', label: 'Cultivos', icon: '🌿' },
      { to: '/campanas', label: 'Campañas', icon: '📅' },
      { to: '/registros-agricolas', label: 'Siembra y cosecha', icon: '🌾' },
      { to: '/tareas', label: 'Tareas', icon: '✓' },
    ],
  },
  {
    key: 'ganaderia',
    label: 'Ganadería',
    icon: '🐄',
    items: [
      { to: '/ganaderia', label: 'Gestión ganadera', icon: '🐮' },
      { to: '/insumos?tipo=ganadero', label: 'Insumos ganaderos', icon: '🍖' },
      { to: '/maquinaria?tipo=ganadera', label: 'Maquinaria ganadera', icon: '🚜' },
      { to: '/tareas?tipo=ganadera', label: 'Tareas ganaderas', icon: '📋' },
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
          return (
            <div key={group.key} className="nav-group">
              <button
                type="button"
                className="nav-group-header"
                onClick={() => toggleGroup(group.key)}
              >
                <span className="nav-group-icon">{group.icon}</span>
                <span className="nav-group-label">{group.label}</span>
                <span className={`nav-group-chevron ${isOpen ? 'open' : ''}`}>
                  ›
                </span>
              </button>
              {isOpen && (
                <div className="nav-group-items">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? 'active' : ''}`
                      }
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      <span className="nav-item-label">{item.label}</span>
                    </NavLink>
                  ))}
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
