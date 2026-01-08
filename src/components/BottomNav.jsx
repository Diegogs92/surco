import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/maquinaria', label: 'Maquinaria' },
  { to: '/nuevo-reporte', label: 'Nuevo' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/usuarios', label: 'Usuarios' },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? 'bottom-link active' : 'bottom-link'
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
