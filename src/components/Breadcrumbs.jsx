import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels = {
  dashboard: 'Dashboard',
  campos: 'Campos',
  cultivos: 'Cultivos',
  tareas: 'Tareas',
  maquinaria: 'Maquinaria',
  reportes: 'Reportes',
  personal: 'Personal',
  insumos: 'Insumos',
  proveedores: 'Proveedores',
  costos: 'Costos',
  alertas: 'Alertas',
  campanas: 'Campañas',
  'lotes-agricolas': 'Lotes Agrícolas',
  'registros-agricolas': 'Siembra y Cosecha',
  ganaderia: 'Ganadería',
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  if (pathnames.length === 0 || location.pathname === '/') {
    return null
  }

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/dashboard" className="breadcrumb-link">
            <Home size={16} />
          </Link>
        </li>
        {pathnames.map((segment, index) => {
          const path = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const label = routeLabels[segment] || segment

          return (
            <li key={path} className="breadcrumb-item">
              <ChevronRight size={16} className="breadcrumb-separator" />
              {isLast ? (
                <span className="breadcrumb-current">{label}</span>
              ) : (
                <Link to={path} className="breadcrumb-link">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
