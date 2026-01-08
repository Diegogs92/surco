function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>Completa los datos principales y guarda.</p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Cerrar
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  )
}

export default Modal
