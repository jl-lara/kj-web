import PageHero from '../components/PageHero.jsx';
import { useSite } from '../context/SiteContext.jsx';

export default function Promotions() {
  const { promotions, loading } = useSite();

  return (
    <>
      <PageHero eyebrow="Promociones" title="Promociones claras, sin slider automático" text="Ofertas vigentes publicadas por el equipo de Karnes en su Jugo." />
      <section className="section">
        <div className="container promo-grid">
          {loading && <p className="state-text">Cargando promociones…</p>}
          {!loading && promotions.length === 0 && (
            <p className="state-text">No hay promociones vigentes por el momento.</p>
          )}
          {!loading && promotions.map((promo) => (
            <article className="promo-card" key={promo.name}>
              <img src={promo.image} alt={promo.name} loading="lazy" />
              <div>
                <span>{promo.price || 'Disponible'}</span>
                <h2>{promo.name}</h2>
                <p>{promo.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
