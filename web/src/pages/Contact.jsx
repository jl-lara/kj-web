import { ExternalLink, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import LocationCard from '../components/LocationCard.jsx';
import PageHero from '../components/PageHero.jsx';
import { useSite } from '../context/SiteContext.jsx';

function telHref(phone, whatsapp) {
  if (whatsapp && whatsapp.trim()) return `tel:${whatsapp.trim()}`;
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  return `tel:${digits.length === 10 ? `+52${digits}` : `+${digits}`}`;
}

export default function Contact() {
  const { settings, social, locations, loading } = useSite();

  const phone = settings?.phone || locations[0]?.phone || '';
  const address = settings?.address || locations[0]?.address || '';
  const whatsapp = settings?.whatsapp || '';
  const email = settings?.email || '';

  return (
    <>
      <PageHero eyebrow="Contacto" title="Acciones rápidas para visitar o llamar" text="Teléfono, WhatsApp, correo y redes actualizados desde el panel administrativo." />
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-panel">
            <h2>Contacto principal</h2>
            {phone && (
              <a href={telHref(phone, whatsapp)}><Phone size={18} /> {phone}</a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                <MessageSquare size={18} /> WhatsApp
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}><Mail size={18} /> {email}</a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Facebook</a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Instagram</a>
            )}
            {address && (
              <p><MapPin size={18} /> {address}</p>
            )}
          </div>
          <form className="contact-form" aria-label="Formulario de contacto visual">
            <h2>Mensaje rápido</h2>
            <label>Nombre<input type="text" name="name" /></label>
            <label>Correo<input type="email" name="email" /></label>
            <label>Comentario<textarea name="message" rows="4" /></label>
            <button className="button" type="button">Preparado para futura conexión</button>
          </form>
        </div>
      </section>
      <section className="section compact-section">
        <div className="container locations-preview">
          {loading && <p className="state-text">Cargando sucursales…</p>}
          {!loading && locations.slice(0, 2).map((location) => <LocationCard key={location.name} location={location} />)}
        </div>
      </section>
    </>
  );
}
