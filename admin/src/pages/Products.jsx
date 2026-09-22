import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { uploadsApi } from '../api/uploads';
import { friendlyError } from '../api/errors';
import { useAuth } from '../auth/AuthContext';
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

const LIMIT = 10;

const emptyForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  displayOrder: '0',
  active: true,
};

function validate(form) {
  const errors = {};
  if (!form.categoryId) errors.categoryId = 'Selecciona una categoría.';
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (form.description && form.description.length > 1000) errors.description = 'Máximo 1000 caracteres.';
  if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Ingresa un precio válido (mayor o igual a 0).';
  }
  if (form.displayOrder !== '' && (!Number.isInteger(Number(form.displayOrder)) || Number(form.displayOrder) < 0)) {
    errors.displayOrder = 'Debe ser un número entero mayor o igual a 0.';
  }
  return errors;
}

export default function Products() {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    categoriesApi
      .list({ page: 1, limit: 100, sort: 'name' })
      .then((res) => {
        if (active) setCategories(res.data ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const fetcher = useCallback(
    () =>
      productsApi.list({
        page,
        limit: LIMIT,
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        active: activeFilter === '' ? undefined : activeFilter === 'true',
      }),
    [page, search, categoryFilter, activeFilter],
  );

  const { items, meta, loading, error, reload } = useApiList(fetcher);

  const categoryName = useCallback(
    (id) => categories.find((c) => c.id === id)?.name || '—',
    [categories],
  );

  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

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

  function openEdit(product) {
    setEditing(product);
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description ?? '',
      price: String(product.price ?? ''),
      displayOrder: String(product.displayOrder ?? 0),
      active: product.active,
    });
    setFormErrors({});
    setImage({ file: null, remove: false });
    setExistingUrl(product.imageUrl ?? null);
    setModalOpen(true);
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function applySearch() {
    setSearch(searchDraft);
    setPage(1);
  }

  function handleCategoryFilter(e) {
    setCategoryFilter(e.target.value);
    setPage(1);
  }

  function handleActiveFilter(e) {
    setActiveFilter(e.target.value);
    setPage(1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    let uploadedKey = null;
    try {
      let finalImageUrl = image.remove ? null : existingUrl;
      if (image.file) {
        const uploaded = await uploadsApi.uploadImage(image.file);
        uploadedKey = uploaded.key;
        finalImageUrl = uploaded.url;
      }

      const payload = {
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        imageUrl: finalImageUrl,
        displayOrder: form.displayOrder === '' ? 0 : Number(form.displayOrder),
        active: form.active,
      };

      if (editing) {
        await productsApi.update(editing.id, payload);
        toast('Producto actualizado.');
      } else {
        await productsApi.create(payload);
        toast('Producto creado.');
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

  async function handleToggle(product) {
    try {
      await productsApi.updateStatus(product.id, !product.active);
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
      await productsApi.remove(deleteTarget.id);
      toast('Producto eliminado.');
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
          <h1>Productos</h1>
          <p>Gestión de productos del menú.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Buscar por nombre…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applySearch();
              }
            }}
          />
          <button type="button" className="btn btn-secondary" onClick={applySearch}>
            <Search size={16} /> Buscar
          </button>
        </div>
        <select value={categoryFilter} onChange={handleCategoryFilter} className="select">
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={activeFilter} onChange={handleActiveFilter} className="select">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {loading && <Loading label="Cargando productos…" />}
      {!loading && error && <ErrorState message={friendlyError(error)} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No hay productos registrados." />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th className="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => (
                  <tr key={product.id}>
                    <td className="cell-strong">{product.name}</td>
                    <td className="cell-muted">{categoryName(product.categoryId)}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.displayOrder}</td>
                    <td>
                      <Badge active={product.active} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Editar"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title={product.active ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggle(product)}
                        >
                          {product.active ? 'Desactivar' : 'Activar'}
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            title="Eliminar"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
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
              placeholder="Nombre del producto"
            />
          </Field>
          <Field label="Categoría" error={formErrors.categoryId}>
            <select
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
            >
              <option value="">Selecciona…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Precio" error={formErrors.price}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              placeholder="0.00"
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
          <div className="field">
            <span className="field-label">Imagen</span>
            <ImageUpload
              existingUrl={existingUrl}
              value={image}
              onChange={setImage}
              disabled={saving}
            />
          </div>
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
        title="Eliminar producto"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
