function FloatingActions({ onNewEquipo, onNewReporte }) {
  return (
    <div className="floating-actions">
      <button className="fab-button" type="button" onClick={onNewEquipo}>
        + Maquinaria
      </button>
      <button className="fab-button secondary" type="button" onClick={onNewReporte}>
        + Reporte
      </button>
    </div>
  )
}

export default FloatingActions
