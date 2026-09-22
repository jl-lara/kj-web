import { Search } from 'lucide-react';
import { useState } from 'react';
import MenuCard from '../components/MenuCard.jsx';
import PageHero from '../components/PageHero.jsx';
import { menuCategories } from '../data/siteData.js';

export default function Menu() {
  const [active, setActive] = useState('todos');
  const [query, setQuery] = useState('');

  const visibleCategories = menuCategories
    .filter((category) => active === 'todos' || category.id === active)
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((category) => category.items.length);

  return (
    <>
      <PageHero eyebrow="Menú" title="Categorías reales, experiencia renovada" text="Presentación visual moderna del menú existente, sin convertirlo en tienda en línea." />
      <section className="section">
        <div className="container">
          <div className="menu-toolbar">
            <div className="filters" aria-label="Filtrar categorías">
              <button className={active === 'todos' ? 'active' : ''} type="button" onClick={() => setActive('todos')}>Todos</button>
              {menuCategories.map((category) => (
                <button className={active === category.id ? 'active' : ''} key={category.id} type="button" onClick={() => setActive(category.id)}>
                  {category.label}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={18} />
              <span className="sr-only">Buscar platillo</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar platillo" />
            </label>
          </div>
          {visibleCategories.map((category) => (
            <section className="menu-category" key={category.id}>
              <h2>{category.label}</h2>
              <div className="menu-grid">
                {category.items.map((item) => <MenuCard key={`${category.id}-${item.name}`} item={item} />)}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
