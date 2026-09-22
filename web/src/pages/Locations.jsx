import LocationCard from '../components/LocationCard.jsx';
import PageHero from '../components/PageHero.jsx';
import { useSite } from '../context/SiteContext.jsx';

export default function Locations() {
  const { locations, loading } = useSite();

  return (
    <>
      <PageHero eyebrow="Sucursales" title="Cinco puntos para llegar a Karnes en su Jugo" text="Direcciones y teléfonos actualizados desde el panel administrativo." />
      <section className="section">
        <div className="container locations-layout">
          <aside className="map-panel" aria-label="Referencia de mapa">
            <span>Mapa</span>
            <h2>Tijuana</h2>
            <p>Consulta dirección, teléfono y ruta de cada sucursal.</p>
          </aside>
          <div className="locations-list">
            {loading && <p className="state-text">Cargando sucursales…</p>}
            {!loading && locations.length === 0 && (
              <p className="state-text">No hay sucursales publicadas por el momento.</p>
            )}
            {!loading && locations.map((location) => <LocationCard key={location.name} location={location} />)}
          </div>
        </div>
      </section>
    </>
  );
}
