import PageHero from '../components/PageHero.jsx';
import { promotions } from '../data/siteData.js';

export default function Promotions() {
  return (
    <>
      <PageHero eyebrow="Promociones" title="Promociones claras, sin slider automático" text="Cards editoriales con la información publicada actualmente por el sitio de referencia." />
      <section className="section">
        <div className="container promo-grid">
          {promotions.map((promo) => (
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
