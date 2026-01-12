import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Inicio', icon: '🏠' },
  { to: '/campos', label: 'Campos', icon: '🌾' },
  { to: '/tareas', label: 'Tareas', icon: '✓' },
  { to: '/reportes', label: 'Reportes', icon: '📈' },
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
          <span className="bottom-link-icon">{item.icon}</span>
          <span className="bottom-link-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
