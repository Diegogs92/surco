import { NavLink } from 'react-router-dom'

const navGroups = [
  {
    label: 'Compartidos',
    items: [
      { to: '/campos', label: 'Campos' },
      { to: '/personal', label: 'Personal' },
      { to: '/proveedores', label: 'Proveedores' },
      { to: '/insumos', label: 'Insumos' },
      { to: '/maquinaria', label: 'Maquinaria' },
      { to: '/tareas', label: 'Tareas' },
      { to: '/alertas', label: 'Alertas' },
      { to: '/reportes', label: 'Reportes' },
    ],
  },
  {
    label: 'Agricultura',
    items: [
      { to: '/lotes-agricolas', label: 'Lotes agricolas' },
      { to: '/cultivos', label: 'Cultivos' },
      { to: '/campanas', label: 'Campanas' },
      { to: '/registros-agricolas', label: 'Siembra y cosecha' },
      { to: '/insumos?tipo=agricola', label: 'Insumos agricolas' },
      { to: '/maquinaria?tipo=agricola', label: 'Maquinaria agricola' },
      { to: '/tareas?tipo=agricola', label: 'Tareas agricolas' },
      { to: '/alertas?tipo=meteorologica', label: 'Alertas meteorologicas' },
    ],
  },
  {
    label: 'Ganaderia',
    items: [
      { to: '/ganaderia', label: 'Gestion ganadera' },
      { to: '/insumos?tipo=ganadero', label: 'Insumos ganaderos' },
      { to: '/maquinaria?tipo=ganadera', label: 'Maquinaria ganadera' },
      { to: '/tareas?tipo=ganadera', label: 'Tareas ganaderas' },
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
