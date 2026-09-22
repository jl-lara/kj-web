import { useCallback, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { usersApi } from '../api/users';
import { friendlyError } from '../api/errors';
import { useApiList } from '../hooks/useApiList';
import { useToast } from '../components/Toast';
import {
  Loading,
  EmptyState,
  ErrorState,
  Badge,
  Modal,
  Field,
  Toggle,
} from '../components/ui';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'EDITOR',
  active: true,
};

const roleLabels = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
};

function validate(form, isEditing) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!form.email.trim()) errors.email = 'El correo es obligatorio.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Ingresa un correo válido.';
  }
  if (!isEditing && !form.password) errors.password = 'La contraseña es obligatoria.';
  if (form.password && form.password.length < 8) errors.password = 'Mínimo 8 caracteres.';
  return errors;
}

export default function Users() {
  const toast = useToast();
  const fetcher = useCallback(() => usersApi.list({ page: 1, limit: 100 }), []);
  const { items, loading, error, reload } = useApiList(fetcher);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active,
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
    const isEditing = Boolean(editing);
    const errors = validate(form, isEditing);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      active: form.active,
    };
    if (form.password) payload.password = form.password;

    setSaving(true);
    try {
      if (isEditing) {
        await usersApi.update(editing.id, payload);
        toast('Usuario actualizado.');
      } else {
        await usersApi.create(payload);
        toast('Usuario creado.');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(user) {
    try {
      await usersApi.updateStatus(user.id, !user.active);
      toast('Estado actualizado.');
      reload();
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Gestión de usuarios administrativos.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {loading && <Loading label="Cargando usuarios…" />}
      {!loading && error && <ErrorState message={friendlyError(error)} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="No hay usuarios registrados." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id}>
                  <td className="cell-strong">{user.name}</td>
                  <td className="cell-muted">{user.email}</td>
                  <td>
                    <span className={`role-chip role-${user.role.toLowerCase()}`}>
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </td>
                  <td>
                    <Badge active={user.active} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" title="Editar" onClick={() => openEdit(user)}>
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title={user.active ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggle(user)}
                      >
                        {user.active ? 'Desactivar' : 'Activar'}
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
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
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
              placeholder="Nombre completo"
            />
          </Field>
          <Field label="Correo" error={formErrors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </Field>
          <Field
            label={editing ? 'Contraseña' : 'Contraseña'}
            error={formErrors.password}
            hint={editing ? 'Deja en blanco para no cambiar la contraseña.' : 'Mínimo 8 caracteres.'}
          >
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Rol" error={formErrors.role}>
            <select value={form.role} onChange={(e) => setField('role', e.target.value)}>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </Field>
          <Toggle checked={form.active} onChange={(v) => setField('active', v)} label="Activo" />
        </form>
      </Modal>
    </div>
  );
}
