export function Spinner({ size = 22 }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

export function Loading({ label = 'Cargando…' }) {
  return (
    <div className="state-panel">
      <Spinner />
      <p className="state-text">{label}</p>
    </div>
  );
}

export function EmptyState({ message, action }) {
  return (
    <div className="state-panel">
      <p className="state-text">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-error">
      <p className="state-text">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Badge({ active }) {
  return (
    <span className={`badge ${active ? 'badge-active' : 'badge-inactive'}`}>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Eliminar',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}
