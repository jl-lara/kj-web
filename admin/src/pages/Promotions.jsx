import { useCallback, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { promotionsApi } from '../api/promotions';
import { friendlyError } from '../api/errors';
import { useApiList } from '../hooks/useApiList';
import { useToast } from '../components/Toast';
import {
  Loading,
  EmptyState,
  ErrorState,
  Badge,
  Modal,
  ConfirmDialog,
  Field,
  Toggle,
} from '../components/ui';

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  price: '',
  startsAt: '',
  endsAt: '',
  active: true,
};

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'El título es obligatorio.';
  if (form.description && form.description.length > 1000) errors.description = 'Máximo 1000 caracteres.';
  if (form.imageUrl && !/^https?:\/\/.+/i.test(form.imageUrl.trim())) {
    errors.imageUrl = 'Debe ser una URL válida.';
  }
  if (form.price !== '' && (Number.isNaN(Number(form.price)) || Number(form.price) < 0)) {
    errors.price = 'Ingresa un precio válido (mayor o igual a 0).';
  }
  if (form.startsAt && form.endsAt && new Date(form.startsAt) >= new Date(form.endsAt)) {
    errors.endsAt = 'La fecha de fin debe ser posterior a la de inicio.';
  }
  return errors;
}

export default function Promotions() {
  const toast = useToast();
  const fetcher = useCallback(() => promotionsApi.list({ page: 1, limit: 100 }), []);
  const { items, loading, error, reload } = useApiList(fetcher);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(promotion) {
    setEditing(promotion);
    setForm({
      title: promotion.title,
      description: promotion.description ?? '',
      imageUrl: promotion.imageUrl ?? '',
      price: promotion.price != null ? String(promotion.price) : '',
      startsAt: toLocalInputValue(promotion.startsAt),
      endsAt: toLocalInputValue(promotion.endsAt),
      active: promotion.active,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      price: form.price === '' ? null : Number(form.price),
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      active: form.active,
    };

    setSaving(true);
    try {
      if (editing) {
        await promotionsApi.update(editing.id, payload);
        toast('Promoción actualizada.');
      } else {
        await promotionsApi.create(payload);
        toast('Promoción creada.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(promotion) {
    try {
      await promotionsApi.updateStatus(promotion.id, !promotion.active);
      toast('Estado actualizado.');
      reload();
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await promotionsApi.remove(deleteTarget.id);
      toast('Promoción eliminada.');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Promociones</h1>
          <p>Gestión de promociones.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nueva promoción
        </button>
      </div>

      {loading && <Loading label="Cargando promociones…" />}
      {!loading && error && <ErrorState message={friendlyError(error)} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No hay promociones registradas." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Precio</th>
                <th>Vigencia</th>
                <th>Estado</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="cell-strong">{promotion.title}</td>
                  <td>{promotion.price != null ? `$${Number(promotion.price).toFixed(2)}` : '—'}</td>
                  <td className="cell-muted">
                    {formatDate(promotion.startsAt)} → {formatDate(promotion.endsAt)}
                  </td>
                  <td>
                    <Badge active={promotion.active} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Editar"
                        onClick={() => openEdit(promotion)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title={promotion.active ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggle(promotion)}
                      >
                        {promotion.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Eliminar"
                        onClick={() => setDeleteTarget(promotion)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar promoción' : 'Nueva promoción'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="form">
          <Field label="Título" error={formErrors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Título de la promoción"
            />
          </Field>
          <Field label="Descripción" error={formErrors.description}>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Descripción (opcional)"
              rows={3}
            />
          </Field>
          <Field label="URL de imagen" error={formErrors.imageUrl}>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setField('imageUrl', e.target.value)}
              placeholder="Opcional"
            />
          </Field>
          <Field label="Precio" error={formErrors.price} hint="Opcional. Déjalo vacío si la promoción no tiene precio.">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <div className="form-row">
            <Field label="Inicio" error={formErrors.startsAt}>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setField('startsAt', e.target.value)}
              />
            </Field>
            <Field label="Fin" error={formErrors.endsAt}>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setField('endsAt', e.target.value)}
              />
            </Field>
          </div>
          <Toggle checked={form.active} onChange={(v) => setField('active', v)} label="Activo" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar promoción"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.title}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
