import { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Tags,
  MapPin,
  BadgePercent,
  Images,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { locationsApi } from '../api/locations';
import { promotionsApi } from '../api/promotions';
import { galleryApi } from '../api/gallery';
import { usersApi } from '../api/users';
import { Loading, ErrorState } from '../components/ui';

async function count(fetcher) {
  const res = await fetcher({ page: 1, limit: 1 });
  return res.meta?.total ?? 0;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const tasks = [
          { key: 'productos', run: () => count(productsApi.list) },
          { key: 'categorias', run: () => count(categoriesApi.list) },
          { key: 'sucursales', run: () => count(locationsApi.list) },
          { key: 'promociones', run: () => count(promotionsApi.list) },
          { key: 'galeria', run: () => count(galleryApi.list) },
        ];
        if (user?.role === 'ADMIN') {
          tasks.push({ key: 'usuarios', run: () => count(usersApi.list) });
        }

        const results = await Promise.allSettled(tasks.map((t) => t.run()));
        const next = {};
        tasks.forEach((t, i) => {
          next[t.key] = results[i].status === 'fulfilled' ? results[i].value : null;
        });
        if (active) setStats(next);
      } catch {
        if (active) setError('No se pudo cargar la información del dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user?.role]);

  if (loading) return <Loading label="Cargando dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const cards = [
    { key: 'productos', label: 'Productos', icon: UtensilsCrossed },
    { key: 'categorias', label: 'Categorías', icon: Tags },
    { key: 'sucursales', label: 'Sucursales', icon: MapPin },
    { key: 'promociones', label: 'Promociones', icon: BadgePercent },
    { key: 'galeria', label: 'Galería', icon: Images },
  ];
  if (user?.role === 'ADMIN') {
    cards.push({ key: 'usuarios', label: 'Usuarios', icon: Users });
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Resumen general del contenido del sitio.</p>

      <div className="stats-grid">
        {cards.map(({ key, label, icon: Icon }) => (
          <div className="stat-card" key={key}>
            <div className="stat-icon">
              <Icon size={22} />
            </div>
            <div className="stat-value">{stats?.[key] ?? '—'}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
