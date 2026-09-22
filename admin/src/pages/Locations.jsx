import { useCallback, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { locationsApi } from '../api/locations';
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
  address: '',
  phone: '',
  schedule: '',
  latitude: '',
  longitude: '',
  mapsUrl: '',
  whatsapp: '',
  imageUrl: '',
  displayOrder: '0',
  active: true,
};

function isUrl(value) {
  return /^https?:\/\/.+/i.test(value.trim());
}

function isCoord(value, min, max) {
  if (value === '') return true;
  const n = Number(value);
  return !Number.isNaN(n) && n >= min && n <= max;
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!form.address.trim()) errors.address = 'La dirección es obligatoria.';
  if (form.phone && form.phone.length > 40) errors.phone = 'Máximo 40 caracteres.';
  if (form.schedule && form.schedule.length > 300) errors.schedule = 'Máximo 300 caracteres.';
  if (form.whatsapp && form.whatsapp.length > 40) errors.whatsapp = 'Máximo 40 caracteres.';
  if (!isCoord(form.latitude, -90, 90)) errors.latitude = 'Latitud entre -90 y 90.';
  if (!isCoord(form.longitude, -180, 180)) errors.longitude = 'Longitud entre -180 y 180.';
  if (form.mapsUrl && !isUrl(form.mapsUrl)) errors.mapsUrl = 'Debe ser una URL válida.';
  if (form.imageUrl && !isUrl(form.imageUrl)) errors.imageUrl = 'Debe ser una URL válida.';
  if (form.displayOrder !== '' && (!Number.isInteger(Number(form.displayOrder)) || Number(form.displayOrder) < 0)) {
    errors.displayOrder = 'Debe ser un número entero mayor o igual a 0.';
  }
  return errors;
}

export default function Locations() {
  const toast = useToast();
  const fetcher = useCallback(() => locationsApi.list({ page: 1, limit: 100 }), []);
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

  function openEdit(location) {
    setEditing(location);
    setForm({
      name: location.name,
      address: location.address ?? '',
      phone: location.phone ?? '',
      schedule: location.schedule ?? '',
      latitude: location.latitude != null ? String(location.latitude) : '',
      longitude: location.longitude != null ? String(location.longitude) : '',
      mapsUrl: location.mapsUrl ?? '',
      whatsapp: location.whatsapp ?? '',
      imageUrl: location.imageUrl ?? '',
      displayOrder: String(location.displayOrder ?? 0),
      active: location.active,
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
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      schedule: form.schedule.trim() || null,
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude),
      mapsUrl: form.mapsUrl.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      displayOrder: form.displayOrder === '' ? 0 : Number(form.displayOrder),
      active: form.active,
    };

    setSaving(true);
    try {
      if (editing) {
        await locationsApi.update(editing.id, payload);
        toast('Sucursal actualizada.');
      } else {
        await locationsApi.create(payload);
        toast('Sucursal creada.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(location) {
    try {
      await locationsApi.updateStatus(location.id, !location.active);
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
      await locationsApi.remove(deleteTarget.id);
      toast('Sucursal eliminada.');
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
          <h1>Sucursales</h1>
          <p>Gestión de sucursales.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nueva sucursal
        </button>
      </div>

      {loading && <Loading label="Cargando sucursales…" />}
      {!loading && error && <ErrorState message={friendlyError(error)} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No hay sucursales registradas." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Orden</th>
                <th>Estado</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((location) => (
                <tr key={location.id}>
                  <td className="cell-strong">{location.name}</td>
                  <td className="cell-muted">{location.address}</td>
                  <td>{location.phone || '—'}</td>
                  <td>{location.displayOrder}</td>
                  <td>
                    <Badge active={location.active} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Editar"
                        onClick={() => openEdit(location)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title={location.active ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggle(location)}
                      >
                        {location.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Eliminar"
                        onClick={() => setDeleteTarget(location)}
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
        title={editing ? 'Editar sucursal' : 'Nueva sucursal'}
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
              placeholder="Nombre de la sucursal"
            />
          </Field>
          <Field label="Dirección" error={formErrors.address}>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              placeholder="Dirección"
            />
          </Field>
          <div className="form-row">
            <Field label="Teléfono" error={formErrors.phone}>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Opcional"
              />
            </Field>
            <Field label="WhatsApp" error={formErrors.whatsapp}>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setField('whatsapp', e.target.value)}
                placeholder="Opcional"
              />
            </Field>
          </div>
          <Field label="Horarios" error={formErrors.schedule}>
            <input
              type="text"
              value={form.schedule}
              onChange={(e) => setField('schedule', e.target.value)}
              placeholder="Ej. Lunes a domingo 8:00 - 22:00"
            />
          </Field>
          <div className="form-row">
            <Field label="Latitud" error={formErrors.latitude}>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setField('latitude', e.target.value)}
                placeholder="Opcional"
              />
            </Field>
            <Field label="Longitud" error={formErrors.longitude}>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setField('longitude', e.target.value)}
                placeholder="Opcional"
              />
            </Field>
          </div>
          <Field label="URL de Maps" error={formErrors.mapsUrl}>
            <input
              type="text"
              value={form.mapsUrl}
              onChange={(e) => setField('mapsUrl', e.target.value)}
              placeholder="Opcional"
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
          <Field label="Orden" error={formErrors.displayOrder}>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setField('displayOrder', e.target.value)}
            />
          </Field>
          <Toggle checked={form.active} onChange={(v) => setField('active', v)} label="Activo" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar sucursal"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
