import { useCallback, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { categoriesApi } from '../api/categories';
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
  name: '',
  description: '',
  displayOrder: '0',
  active: true,
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  else if (form.name.trim().length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.';
  if (form.description && form.description.length > 500) {
    errors.description = 'Máximo 500 caracteres.';
  }
  if (form.displayOrder !== '' && (!Number.isInteger(Number(form.displayOrder)) || Number(form.displayOrder) < 0)) {
    errors.displayOrder = 'Debe ser un número entero mayor o igual a 0.';
  }
  return errors;
}

export default function Categories() {
  const toast = useToast();
  const fetcher = useCallback(() => categoriesApi.list({ page: 1, limit: 100 }), []);
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

  function openEdit(category) {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description ?? '',
      displayOrder: String(category.displayOrder ?? 0),
      active: category.active,
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
      name: form.name.trim(),
      description: form.description.trim() || null,
      displayOrder: form.displayOrder === '' ? 0 : Number(form.displayOrder),
      active: form.active,
    };

    setSaving(true);
    try {
      if (editing) {
        await categoriesApi.update(editing.id, payload);
        toast('Categoría actualizada.');
      } else {
        await categoriesApi.create(payload);
        toast('Categoría creada.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(category) {
    try {
      await categoriesApi.updateStatus(category.id, !category.active);
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
      await categoriesApi.remove(deleteTarget.id);
      toast('Categoría eliminada.');
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
          <h1>Categorías</h1>
          <p>Gestión de categorías del menú.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {loading && <Loading label="Cargando categorías…" />}
      {!loading && error && <ErrorState message={friendlyError(error)} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No hay categorías registradas." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Orden</th>
                <th>Estado</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((category) => (
                <tr key={category.id}>
                  <td className="cell-strong">{category.name}</td>
                  <td className="cell-muted">{category.description || '—'}</td>
                  <td>{category.displayOrder}</td>
                  <td>
                    <Badge active={category.active} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Editar"
                        onClick={() => openEdit(category)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title={category.active ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggle(category)}
                      >
                        {category.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Eliminar"
                        onClick={() => setDeleteTarget(category)}
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
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
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
          <Field label="Nombre" error={formErrors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Nombre de la categoría"
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
          <Field label="Orden" error={formErrors.displayOrder}>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setField('displayOrder', e.target.value)}
            />
          </Field>
          <Toggle
            checked={form.active}
            onChange={(v) => setField('active', v)}
            label="Activo"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar categoría"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
