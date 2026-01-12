import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, CheckSquare, TrendingUp } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { to: '/campos', label: 'Campos', icon: Map },
  { to: '/tareas', label: 'Tareas', icon: CheckSquare },
  { to: '/reportes', label: 'Reportes', icon: TrendingUp },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'bottom-link active' : 'bottom-link'
            }
          >
            <span className="bottom-link-icon">
              <Icon size={20} />
            </span>
            <span className="bottom-link-label">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default BottomNav
