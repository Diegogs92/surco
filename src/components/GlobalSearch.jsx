import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

const searchablePages = [
  { title: 'Dashboard', path: '/dashboard', keywords: 'inicio home panel' },
  { title: 'Campos', path: '/campos', keywords: 'terrenos predios parcelas' },
  { title: 'Reportes', path: '/reportes', keywords: 'informes estadísticas' },
  { title: 'Alertas', path: '/alertas', keywords: 'notificaciones avisos' },
  { title: 'Personal', path: '/personal', keywords: 'empleados trabajadores equipo' },
  { title: 'Proveedores', path: '/proveedores', keywords: 'suppliers vendedores' },
  { title: 'Insumos', path: '/insumos', keywords: 'materiales productos' },
  { title: 'Maquinaria', path: '/maquinaria', keywords: 'equipos tractores' },
  { title: 'Lotes Agrícolas', path: '/lotes-agricolas', keywords: 'parcelas terrenos' },
  { title: 'Cultivos', path: '/cultivos', keywords: 'siembra plantaciones' },
  { title: 'Campañas', path: '/campanas', keywords: 'temporadas ciclos' },
  { title: 'Siembra y Cosecha', path: '/registros-agricolas', keywords: 'registros plantación recolección' },
  { title: 'Tareas', path: '/tareas', keywords: 'actividades trabajos pendientes' },
  { title: 'Ganadería', path: '/ganaderia', keywords: 'ganado animales livestock' },
]

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  const filteredResults = query
    ? searchablePages.filter(
        (page) =>
          page.title.toLowerCase().includes(query.toLowerCase()) ||
          page.keywords.toLowerCase().includes(query.toLowerCase())
      )
    : searchablePages

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const handleSelect = useCallback((path) => {
    navigate(path)
    handleClose()
  }, [navigate, handleClose])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handleOpen()
      }

      if (!isOpen) return

      // ESC to close
      if (e.key === 'Escape') {
        handleClose()
      }

      // Arrow navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        )
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
      }

      // Enter to select
      if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault()
        handleSelect(filteredResults[selectedIndex].path)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredResults, handleOpen, handleClose, handleSelect])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="global-search" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar páginas... (Ctrl+K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            autoFocus
          />
          <button className="search-close" onClick={handleClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="search-results">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
              <button
                key={result.path}
                className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(result.path)}
                type="button"
              >
                <span className="search-result-title">{result.title}</span>
                <span className="search-result-path">{result.path}</span>
              </button>
            ))
          ) : (
            <div className="search-no-results">No se encontraron resultados</div>
          )}
        </div>

        <div className="search-footer">
          <kbd>↑↓</kbd> Navegar
          <kbd>Enter</kbd> Seleccionar
          <kbd>ESC</kbd> Cerrar
        </div>
      </div>
    </div>
  )
}
