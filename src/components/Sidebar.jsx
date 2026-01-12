import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navGroups = [
  {
    key: 'compartidos',
    label: 'Compartidos',
    defaultOpen: true,
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
    key: 'agricultura',
    label: 'Agricultura',
    defaultOpen: true,
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
    key: 'ganaderia',
    label: 'Ganaderia',
    defaultOpen: false,
    items: [
      { to: '/ganaderia', label: 'Gestion ganadera' },
      { to: '/insumos?tipo=ganadero', label: 'Insumos ganaderos' },
      { to: '/maquinaria?tipo=ganadera', label: 'Maquinaria ganadera' },
      { to: '/tareas?tipo=ganadera', label: 'Tareas ganaderas' },
    ],
  },
]

function Sidebar() {
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(
      navGroups.map((group) => [group.key, Boolean(group.defaultOpen)]),
    ),
  )

  const activeGroupKeys = useMemo(() => {
    return navGroups
      .filter((group) =>
        group.items.some(
          (item) => item.to.split('?')[0] === location.pathname,
        ),
      )
      .map((group) => group.key)
  }, [location.pathname])

  useEffect(() => {
    if (!activeGroupKeys.length) return
    setOpenGroups((prev) => {
      let changed = false
      const next = { ...prev }
      activeGroupKeys.forEach((key) => {
        if (!next[key]) {
          next[key] = true
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [activeGroupKeys])

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

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
          <div className="nav-group" key={group.key}>
            <button
              className="nav-group-toggle"
              type="button"
              onClick={() => toggleGroup(group.key)}
              aria-expanded={openGroups[group.key]}
            >
              <span className="nav-group-title">{group.label}</span>
              <span
                className={`nav-group-icon ${openGroups[group.key] ? 'open' : ''}`}
              >
                &gt;
              </span>
            </button>
            <div
              className={`nav-group-items ${
                openGroups[group.key] ? 'open' : 'collapsed'
              }`}
            >
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
