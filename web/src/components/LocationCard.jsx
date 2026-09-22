import { MapPin, Navigation, Phone } from 'lucide-react';

export default function LocationCard({ location }) {
  return (
    <article className="location-card">
      <img src={location.image} alt={`Foto de ${location.name}`} loading="lazy" />
      <div className="location-card-content">
        <h3>{location.name}</h3>
        <p><MapPin size={17} /> {location.address}</p>
        <div className="action-row">
          <a className="button button-dark" href={`tel:${location.tel}`}><Phone size={16} /> Llamar</a>
          {location.map && (
            <a className="button button-ghost" href={location.map} target="_blank" rel="noreferrer">
              <Navigation size={16} /> Cómo llegar
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
