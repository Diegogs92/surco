import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/maquinaria', label: 'Maquinaria' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/usuarios', label: 'Usuarios' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">S</span>
        <div>
          <p className="brand-title">Surco</p>
          <p className="brand-subtitle">Mantenimiento</p>
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
