export default function MenuCard({ item }) {
  return (
    <article className={`menu-card ${item.featured ? 'featured' : ''}`}>
      <img src={item.image} alt={item.name} loading="lazy" />
      <div>
        <span>{item.price || 'Consulta disponibilidad'}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}
