import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../api/auth';
import { settingsApi } from '../api/settings';
import { uploadsApi } from '../api/uploads';
import { friendlyError } from '../api/errors';
import { useToast } from '../components/Toast';
import { Field, Loading, ErrorState } from '../components/ui';
import ImageUpload from '../components/ImageUpload';

const defaultSettings = {
  siteName: '',
  description: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  openingHours: '',
  logoUrl: '',
  faviconUrl: '',
};

function isUrl(value) {
  return /^https?:\/\/.+/i.test(value.trim());
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'ADMIN';

  // Perfil
  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  // Configuración del sitio
  const [form, setForm] = useState(defaultSettings);
  const [logo, setLogo] = useState({ file: null, remove: false });
  const [favicon, setFavicon] = useState({ file: null, remove: false });
  const [logoExisting, setLogoExisting] = useState(null);
  const [faviconExisting, setFaviconExisting] = useState(null);
  const [settingsErrors, setSettingsErrors] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    let active = true;
    settingsApi
      .get()
      .then((res) => {
        if (!active) return;
        const data = res.data || defaultSettings;
        const merged = { ...defaultSettings, ...data };
        setForm(merged);
        setLogoExisting(merged.logoUrl || null);
        setFaviconExisting(merged.faviconUrl || null);
      })
      .catch((err) => {
        if (active) setSettingsError(friendlyError(err));
      })
      .finally(() => {
        if (active) setLoadingSettings(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSettingsErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSaveName(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast('El nombre es obligatorio.', 'error');
      return;
    }
    setSavingName(true);
    try {
      const updated = await authApi.updateProfile(name.trim());
      updateUser(updated);
      toast('Perfil actualizado.');
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Ingresa tu contraseña actual.';
    if (!newPassword || newPassword.length < 8) errors.newPassword = 'Mínimo 8 caracteres.';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      toast('Contraseña actualizada. Inicia sesión de nuevo.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => logout(), 1200);
    } catch (err) {
      toast(friendlyError(err), 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    if (!isAdmin) return;

    const errors = {};
    if (!form.siteName.trim()) errors.siteName = 'El nombre es obligatorio.';
    if (form.email && !isEmail(form.email)) errors.email = 'Correo inválido.';
    if (form.facebook && !isUrl(form.facebook)) errors.facebook = 'URL inválida.';
    if (form.instagram && !isUrl(form.instagram)) errors.instagram = 'URL inválida.';
    if (form.tiktok && !isUrl(form.tiktok)) errors.tiktok = 'URL inválida.';
    setSettingsErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingSettings(true);
    const uploadedKeys = [];
    try {
      let logoUrl = logo.remove ? null : logoExisting;
      if (logo.file) {
        const uploaded = await uploadsApi.uploadImage(logo.file);
        uploadedKeys.push(uploaded.key);
        logoUrl = uploaded.url;
      }
      let faviconUrl = favicon.remove ? null : faviconExisting;
      if (favicon.file) {
        const uploaded = await uploadsApi.uploadImage(favicon.file);
        uploadedKeys.push(uploaded.key);
        faviconUrl = uploaded.url;
      }

      const payload = {
        siteName: form.siteName.trim(),
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        facebook: form.facebook.trim() || null,
        instagram: form.instagram.trim() || null,
        tiktok: form.tiktok.trim() || null,
        openingHours: form.openingHours.trim() || null,
        logoUrl,
        faviconUrl,
      };

      await settingsApi.update(payload);
      toast('Configuración guardada.');
      setLogo({ file: null, remove: false });
      setFavicon({ file: null, remove: false });
      setLogoExisting(logoUrl);
      setFaviconExisting(faviconUrl);
    } catch (err) {
      for (const key of uploadedKeys) {
        try {
          await uploadsApi.removeImage(key);
        } catch {
          // best effort cleanup
        }
      }
      toast(friendlyError(err), 'error');
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="page">
      <h1>Configuración</h1>
      <p>Perfil de usuario y configuración general del sitio.</p>

      <div className="settings-card">
        <h2>Mi perfil</h2>
        <form onSubmit={handleSaveName} className="form">
          <Field label="Nombre">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="settings-row">
            <span className="settings-label">Correo</span>
            <span>{user?.email}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Rol</span>
            <span>{user?.role}</span>
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={savingName}>
              <Save size={16} /> {savingName ? 'Guardando…' : 'Guardar perfil'}
            </button>
          </div>
        </form>
      </div>

      <div className="settings-card">
        <h2>Cambiar contraseña</h2>
        <form onSubmit={handleChangePassword} className="form">
          <Field label="Contraseña actual" error={passwordErrors.currentPassword}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field label="Nueva contraseña" error={passwordErrors.newPassword} hint="Mínimo 8 caracteres.">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirmar contraseña" error={passwordErrors.confirmPassword}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <div>
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword ? 'Cambiando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>

      <div className="settings-card">
        <div className="settings-card-head">
          <h2>Configuración del sitio</h2>
          {!isAdmin && <span className="settings-note">Solo lectura — requiere rol Administrador.</span>}
        </div>

        {loadingSettings && <Loading label="Cargando configuración…" />}
        {!loadingSettings && settingsError && (
          <ErrorState message={settingsError} onRetry={() => window.location.reload()} />
        )}

        {!loadingSettings && !settingsError && (
          <form onSubmit={handleSaveSettings} className="form">
            <h3 className="settings-section-title">Información general</h3>
            <Field label="Nombre del sitio" error={settingsErrors.siteName}>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setField('siteName', e.target.value)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Descripción">
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={2}
                disabled={!isAdmin}
              />
            </Field>

            <h3 className="settings-section-title">Contacto</h3>
            <div className="form-row">
              <Field label="Teléfono">
                <input type="text" value={form.phone} onChange={(e) => setField('phone', e.target.value)} disabled={!isAdmin} />
              </Field>
              <Field label="WhatsApp">
                <input type="text" value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} disabled={!isAdmin} />
              </Field>
            </div>
            <Field label="Correo" error={settingsErrors.email}>
              <input type="text" value={form.email} onChange={(e) => setField('email', e.target.value)} disabled={!isAdmin} />
            </Field>
            <Field label="Dirección">
              <input type="text" value={form.address} onChange={(e) => setField('address', e.target.value)} disabled={!isAdmin} />
            </Field>

            <h3 className="settings-section-title">Redes sociales</h3>
            <Field label="Facebook" error={settingsErrors.facebook}>
              <input type="text" value={form.facebook} onChange={(e) => setField('facebook', e.target.value)} disabled={!isAdmin} placeholder="https://…" />
            </Field>
            <div className="form-row">
              <Field label="Instagram" error={settingsErrors.instagram}>
                <input type="text" value={form.instagram} onChange={(e) => setField('instagram', e.target.value)} disabled={!isAdmin} placeholder="https://…" />
              </Field>
              <Field label="TikTok" error={settingsErrors.tiktok}>
                <input type="text" value={form.tiktok} onChange={(e) => setField('tiktok', e.target.value)} disabled={!isAdmin} placeholder="https://…" />
              </Field>
            </div>

            <h3 className="settings-section-title">Horarios</h3>
            <Field label="Horarios">
              <input
                type="text"
                value={form.openingHours}
                onChange={(e) => setField('openingHours', e.target.value)}
                disabled={!isAdmin}
                placeholder="Ej. Lunes a domingo 8:00 - 22:00"
              />
            </Field>

            <h3 className="settings-section-title">Branding</h3>
            <div className="form-row">
              <div className="field">
                <span className="field-label">Logo</span>
                <ImageUpload
                  existingUrl={logoExisting}
                  value={logo}
                  onChange={setLogo}
                  disabled={!isAdmin || savingSettings}
                />
              </div>
              <div className="field">
                <span className="field-label">Favicon</span>
                <ImageUpload
                  existingUrl={faviconExisting}
                  value={favicon}
                  onChange={setFavicon}
                  disabled={!isAdmin || savingSettings}
                />
              </div>
            </div>

            {isAdmin && (
              <div>
                <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                  <Save size={16} /> {savingSettings ? 'Guardando…' : 'Guardar configuración'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
