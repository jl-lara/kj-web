import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import { useSite } from '../context/SiteContext.jsx';

function GalleryItem({ item }) {
  const [failed, setFailed] = useState(false);
  const label = item.altText || item.title || 'Imagen de la galería';

  if (failed) {
    return (
      <figure className="gallery-item gallery-item-fallback">
        <ImageOff size={28} />
        <figcaption>{item.title || 'Imagen no disponible'}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="gallery-item">
      <img src={item.imageUrl} alt={label} loading="lazy" onError={() => setFailed(true)} />
      {item.title && <figcaption>{item.title}</figcaption>}
    </figure>
  );
}

export default function Gallery() {
  const { gallery, loading, fromFallback } = useSite();

  return (
    <>
      <PageHero eyebrow="Galería" title="Nuestros platillos y sucursales" text="Una mirada a Karnes en su Jugo Tijuana, actualizada desde el panel administrativo." />
      <section className="section">
        <div className="container">
          {loading && <p className="state-text">Cargando galería…</p>}
          {!loading && fromFallback && (
            <p className="state-text">No se pudo cargar la galería en este momento. Intenta de nuevo más tarde.</p>
          )}
          {!loading && !fromFallback && gallery.length === 0 && (
            <p className="state-text">Aún no hay imágenes en la galería.</p>
          )}
          {!loading && !fromFallback && gallery.length > 0 && (
            <div className="gallery-grid">
              {gallery.map((item) => <GalleryItem key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
