import { ArrowRight, Clock, MapPin, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import MenuCard from '../components/MenuCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { images, locations, menuCategories, promotions, storyParagraphs, timeline } from '../data/siteData.js';
import logo from '../images/logo-top-portal.png';

export default function Home() {
  const signature = menuCategories[0].items[0];

  return (
    <>
      <section className="hero">
        <img className="hero-bg" src={images.hero} alt="Platillo de carne en su jugo" />
        <div className="hero-overlay" />
        <div className="container hero-content reveal">
          <img className="hero-logo" src={logo} alt="Karnes en su Jugo Tijuana" />
          <span className="eyebrow">Desde 1973</span>
          <h1>Karnes en su Jugo</h1>
          <p>Una tradición que sabe a casa, servida en Tijuana con receta familiar y tortillas de maíz hechas a mano.</p>
          <div className="hero-actions">
            <Link className="button" to="/menu">Ver menú</Link>
            <Link className="button button-light" to="/sucursales">Encuentra tu sucursal</Link>
          </div>
        </div>
      </section>

      <section className="section value-strip">
        <div className="container value-grid">
          <article><strong>1973</strong><span>Origen familiar en Culiacán, Sinaloa</span></article>
          <article><strong>1975</strong><span>Primera sucursal de Tijuana</span></article>
          <article><strong>5</strong><span>Sucursales documentadas en Tijuana</span></article>
          <article><strong>KJ</strong><span>Receta con consomé, frijoles y tortillas hechas a mano</span></article>
        </div>
      </section>

      <section className="section signature-section">
        <div className="container signature-grid">
          <div className="signature-image">
            <img src={signature.image} alt={signature.name} />
          </div>
          <div className="signature-copy">
            <span className="eyebrow">Platillo insignia</span>
            <h2>Karnes en su Jugo</h2>
            <p>{signature.description}</p>
            <div className="price-tag">{signature.price}</div>
            <Link className="button" to="/menu">Ver especialidades <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Menú" title="Sabores de casa, presentados con claridad" text="Una selección inicial basada en las categorías reales del sitio: especialidades, desayuno y comida." />
          <div className="menu-grid preview-grid">
            {menuCategories.flatMap((category) => category.items.slice(0, 2)).map((item) => <MenuCard key={`${item.name}-${item.price}`} item={item} />)}
          </div>
          <div className="section-cta"><Link className="button button-dark" to="/menu">Explorar menú completo</Link></div>
        </div>
      </section>

      <section className="section story-preview">
        <div className="container story-grid">
          <div>
            <SectionTitle eyebrow="Nuestra historia" title="Una receta que cruzó generaciones" text={storyParagraphs[0]} />
            <Link className="text-link" to="/historia">Leer la historia completa <ArrowRight size={16} /></Link>
          </div>
          <div className="home-timeline" aria-label="Línea del tiempo de Karnes en su Jugo">
            {timeline.map((item) => (
              <article key={item.year}>
                <time>{item.year}</time>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-band">
        <div className="container band-grid">
          <div>
            <span className="eyebrow">Promociones</span>
            <h2>Opciones entre semana</h2>
            <p>Promociones actuales documentadas en el sitio original, listas para actualizar en futuras etapas.</p>
          </div>
          {promotions.slice(0, 2).map((promo) => (
            <article className="promo-slim" key={promo.name}>
              <Clock size={18} />
              <h3>{promo.name}</h3>
              <p>{promo.description}</p>
              <strong>{promo.price}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Sucursales" title="Tijuana tiene mesa puesta" text="Consulta dirección, teléfono y ruta de las ubicaciones publicadas por Karnes en su Jugo Tijuana." />
          <div className="landing-map-card">
            <iframe
              title="Mapa interactivo de sucursales Karnes en su Jugo Tijuana"
              src="https://www.google.com/maps?q=Karnes%20en%20su%20Jugo%20Tijuana&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="landing-map-panel">
              <strong>{locations.length} sucursales en Tijuana</strong>
              <p>Abre la página de sucursales para consultar teléfono, dirección y ruta específica de cada ubicación.</p>
              <Link className="button" to="/sucursales"><MapPin size={17} /> Ver sucursales</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <Utensils size={28} />
          <h2>Tradición mexicana para comer hoy.</h2>
          <Link className="button button-light" to="/contacto">Contactar</Link>
        </div>
      </section>
    </>
  );
}
