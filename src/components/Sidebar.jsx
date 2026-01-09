import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/campos', label: 'Campos' },
  { to: '/cultivos', label: 'Cultivos' },
  { to: '/tareas', label: 'Tareas' },
  { to: '/maquinaria', label: 'Maquinaria' },
  { to: '/personal', label: 'Personal' },
  { to: '/insumos', label: 'Insumos' },
  { to: '/costos', label: 'Costos' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <img src="/surco%20logo.svg" alt="Surco" />
        </span>
        <div>
          <p className="brand-title">Surco</p>
          <p className="brand-subtitle">Gestion agricola al maximo nivel</p>
        </div>
      </div>
      <nav className="nav">
        {navItems.map((item) => (
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
      </nav>
      <div className="sidebar-footer">
        <p>Listo para campo y oficina.</p>
      </div>
    </aside>
  )
}

export default Sidebar
