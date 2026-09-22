import { useCallback, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { galleryApi } from '../api/gallery';
import { uploadsApi } from '../api/uploads';
import { friendlyError } from '../api/errors';
import { useApiList } from '../hooks/useApiList';
import { useToast } from '../components/Toast';
import ImageUpload from '../components/ImageUpload';
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
  altText: '',
  displayOrder: '0',
  active: true,
};

function validate(form) {
  const errors = {};
  if (form.title && form.title.length > 200) errors.title = 'Máximo 200 caracteres.';
  if (form.altText && form.altText.length > 300) errors.altText = 'Máximo 300 caracteres.';
  if (form.displayOrder !== '' && (!Number.isInteger(Number(form.displayOrder)) || Number(form.displayOrder) < 0)) {
    errors.displayOrder = 'Debe ser un número entero mayor o igual a 0.';
  }
  return errors;
}

export default function Gallery() {
  const toast = useToast();
  const fetcher = useCallback(() => galleryApi.list({ page: 1, limit: 100 }), []);
  const { items, loading, error, reload } = useApiList(fetcher);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState({ file: null, remove: false });
  const [existingUrl, setExistingUrl] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setImage({ file: null, remove: false });
    setExistingUrl(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title ?? '',
      altText: item.altText ?? '',
      displayOrder: String(item.displayOrder ?? 0),
      active: item.active,
    });
    setFormErrors({});
    setImage({ file: null, remove: false });
    setExistingUrl(item.imageUrl ?? null);
    setModalOpen(true);
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate(form);

    let finalImageUrl = image.remove ? null : existingUrl;
    if (image.file) finalImageUrl = '__pending__';
    if (!finalImageUrl) {
      errors.imageUrl = 'Debes seleccionar una imagen.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    let uploadedKey = null;
    try {
      finalImageUrl = image.remove ? null : existingUrl;
      if (image.file) {
        const uploaded = await uploadsApi.uploadImage(image.file);
        uploadedKey = uploaded.key;
        finalImageUrl = uploaded.url;
      }

      const payload = {
        imageUrl: finalImageUrl,
        title: form.title.trim() || null,
        altText: form.altText.trim() || null,
        displayOrder: form.displayOrder === '' ? 0 : Number(form.displayOrder),
        active: form.active,
      };

      if (editing) {
        await galleryApi.update(editing.id, payload);
        toast('Imagen actualizada.');
      } else {
        await galleryApi.create(payload);
        toast('Imagen agregada.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      if (uploadedKey) {
        try {
          await uploadsApi.removeImage(uploadedKey);
        } catch {
          // best effort cleanup of the just-uploaded file
        }
      }
      toast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    try {
      await galleryApi.updateStatus(item.id, !item.active);
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
      await galleryApi.remove(deleteTarget.id);
      toast('Imagen eliminada.');
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
          <h1>Galería</h1>
          <p>Gestión de imágenes de la galería.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nueva imagen
        </button>
      </div>

      {loading && <Loading label="Cargando galería…" />}
      {!loading && error && <ErrorState message={friendlyError(error)} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No hay imágenes en la galería." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="gallery-grid">
          {items.map((item) => (
            <div className="gallery-card" key={item.id}>
              <div className="gallery-thumb">
                <img src={item.imageUrl} alt={item.altText || item.title || 'Imagen'} loading="lazy" />
              </div>
              <div className="gallery-info">
                <div className="gallery-title">{item.title || 'Sin título'}</div>
                <div className="gallery-alt">{item.altText || '—'}</div>
                <div className="gallery-meta">
                  <Badge active={item.active} />
                  <span className="gallery-order">Orden: {item.displayOrder}</span>
                </div>
                <div className="row-actions">
                  <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(item)}>
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    title={item.active ? 'Desactivar' : 'Activar'}
                    onClick={() => handleToggle(item)}
                  >
                    {item.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    title="Eliminar"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar imagen' : 'Nueva imagen'}
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
          <div className="field">
            <span className="field-label">Imagen</span>
            <ImageUpload
              existingUrl={existingUrl}
              value={image}
              onChange={setImage}
              disabled={saving}
            />
            {formErrors.imageUrl && <span className="field-error">{formErrors.imageUrl}</span>}
          </div>
          <Field label="Título" error={formErrors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Opcional"
            />
          </Field>
          <Field label="Texto alternativo" error={formErrors.altText}>
            <input
              type="text"
              value={form.altText}
              onChange={(e) => setField('altText', e.target.value)}
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
        title="Eliminar imagen"
        message="¿Seguro que deseas eliminar esta imagen de la galería?"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
