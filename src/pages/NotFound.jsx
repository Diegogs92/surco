import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="page center">
      <div className="card">
        <h1>Pagina no encontrada</h1>
        <p>El enlace no existe o fue movido.</p>
        <Link className="primary-button" to="/dashboard">
          Volver al panel
        </Link>
      </div>
    </div>
  )
}

export default NotFound
