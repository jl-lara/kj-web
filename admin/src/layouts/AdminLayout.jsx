import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  MapPin,
  BadgePercent,
  Images,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/productos', label: 'Productos', icon: UtensilsCrossed },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/sucursales', label: 'Sucursales', icon: MapPin },
  { to: '/promociones', label: 'Promociones', icon: BadgePercent },
  { to: '/galeria', label: 'Galería', icon: Images },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Karnes en su Jugo</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink to="/login" className="nav-item nav-item-logout">
          <LogOut size={18} />
          <span>Salir</span>
        </NavLink>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
