import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { images, storyParagraphs, timeline } from '../data/siteData.js';

export default function About() {
  return (
    <>
      <PageHero eyebrow="Nuestra historia" title="De una receta familiar a una marca con presencia en Tijuana" text="La historia se reorganiza en una narrativa visual para dar peso al origen y la continuidad familiar." />
      <section className="section about-feature">
        <div className="container story-grid">
          <img src={images.history} alt="Karnes en su Jugo servido con guarniciones" />
          <div>
            <SectionTitle eyebrow="Quiénes somos" title="Tradición mexicana con segunda generación al frente" />
            {storyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Timeline" title="Momentos que explican la marca" />
          <div className="timeline">
            {timeline.map((item) => (
              <article key={item.year}>
                <time>{item.year}</time>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
