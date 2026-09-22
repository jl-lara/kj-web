import { ExternalLink, MapPin, MessageSquare, Phone } from 'lucide-react';
import LocationCard from '../components/LocationCard.jsx';
import PageHero from '../components/PageHero.jsx';
import { locations, social } from '../data/siteData.js';

export default function Contact() {
  const primary = locations[0];

  return (
    <>
      <PageHero eyebrow="Contacto" title="Acciones rápidas para visitar o llamar" text="El contacto se simplifica para que el usuario encuentre teléfono, rutas y redes sin llenar un formulario innecesario." />
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-panel">
            <h2>Contacto principal</h2>
            <a href={`tel:${primary.tel}`}><Phone size={18} /> {primary.phone}</a>
            <a href={social.facebook} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Facebook</a>
            <span><MessageSquare size={18} /> Messenger desde Facebook</span>
            <p><MapPin size={18} /> {primary.address}</p>
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
          {locations.slice(0, 2).map((location) => <LocationCard key={location.name} location={location} />)}
        </div>
      </section>
    </>
  );
}
