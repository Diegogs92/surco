import { AlertCircle, RefreshCw } from 'lucide-react'

export function ErrorMessage({
  message = 'Ocurrió un error al cargar los datos',
  onRetry,
  showRetry = true
}) {
  return (
    <div className="error-message">
      <div className="error-content">
        <AlertCircle size={48} className="error-icon" />
        <h3 className="error-title">Error</h3>
        <p className="error-text">{message}</p>
        {showRetry && onRetry && (
          <button onClick={onRetry} className="btn btn-primary error-retry-btn">
            <RefreshCw size={18} />
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <AlertCircle size={64} className="error-icon" />
        <h2 className="error-title">Algo salió mal</h2>
        <p className="error-text">
          Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
        </p>
        {error?.message && (
          <details className="error-details">
            <summary>Detalles técnicos</summary>
            <pre className="error-stack">{error.message}</pre>
          </details>
        )}
        <div className="error-actions">
          <button onClick={resetErrorBoundary} className="btn btn-primary">
            <RefreshCw size={18} />
            Intentar de nuevo
          </button>
          <button onClick={() => window.location.href = '/dashboard'} className="btn btn-secondary">
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
