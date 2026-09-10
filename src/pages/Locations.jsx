import LocationCard from '../components/LocationCard.jsx';
import PageHero from '../components/PageHero.jsx';
import { locations } from '../data/siteData.js';

export default function Locations() {
  return (
    <>
      <PageHero eyebrow="Sucursales" title="Cinco puntos para llegar a Karnes en su Jugo" text="Direcciones y teléfonos extraídos del sitio oficial de referencia." />
      <section className="section">
        <div className="container locations-layout">
          <aside className="map-panel" aria-label="Referencia de mapa">
            <span>Mapa</span>
            <h2>Tijuana</h2>
            <p>En esta etapa se dejan listas las acciones de ruta por sucursal. El mapa interactivo puede integrarse después sin rehacer la interfaz.</p>
          </aside>
          <div className="locations-list">
            {locations.map((location) => <LocationCard key={location.name} location={location} />)}
          </div>
        </div>
      </section>
    </>
  );
}
