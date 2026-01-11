import { NavLink } from 'react-router-dom'

const navGroups = [
  {
    label: 'Agricultura',
    items: [
      { to: '/cultivos', label: 'Cultivos' },
      { to: '/tareas', label: 'Tareas' },
      { to: '/insumos', label: 'Insumos' },
      { to: '/maquinaria', label: 'Maquinaria' },
      { to: '/proveedores', label: 'Proveedores' },
      { to: '/costos', label: 'Costos' },
    ],
  },
  {
    label: 'Ganaderia',
    items: [
      { to: '/campos', label: 'Campos' },
      { to: '/personal', label: 'Personal' },
      { to: '/reportes', label: 'Reportes' },
    ],
  },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src="/surco%20logo.svg" alt="Surco" />
        <div>
          <p className="brand-title">Surco</p>
          <p className="brand-subtitle">Gestion agricola al maximo nivel</p>
        </div>
      </div>
      <nav className="nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Dashboard
        </NavLink>
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <span className="nav-group-title">{group.label}</span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Listo para campo y oficina.</p>
      </div>
    </aside>
  )
}

export default Sidebar
