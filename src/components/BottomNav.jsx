import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/campos', label: 'Campos' },
  { to: '/tareas', label: 'Tareas' },
  { to: '/maquinaria', label: 'Maquinaria' },
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
