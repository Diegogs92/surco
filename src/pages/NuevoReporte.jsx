import PageHeader from '../components/PageHeader.jsx'

function NuevoReporte() {
  return (
    <div className="page">
      <PageHeader
        title="Nuevo reporte"
        subtitle="Registra mantenimientos preventivos o correctivos."
      />
      <div className="card empty-helper">
        <h2>Crear un nuevo reporte</h2>
        <p>
          Usa el boton flotante para registrar una orden desde cualquier
          pantalla.
        </p>
      </div>
    </div>
  )
}

export default NuevoReporte
