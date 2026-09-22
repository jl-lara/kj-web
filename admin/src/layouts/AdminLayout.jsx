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
import { useAuth } from '../auth/AuthContext';

const navSections = [
  {
    label: null,
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Contenido',
    items: [
      { to: '/productos', label: 'Productos', icon: UtensilsCrossed },
      { to: '/categorias', label: 'Categorías', icon: Tags },
      { to: '/sucursales', label: 'Sucursales', icon: MapPin },
      { to: '/promociones', label: 'Promociones', icon: BadgePercent },
      { to: '/galeria', label: 'Galería', icon: Images },
    ],
  },
  {
    label: 'Administración',
    items: [{ to: '/usuarios', label: 'Usuarios', icon: Users, adminOnly: true }],
  },
  {
    label: null,
    items: [{ to: '/configuracion', label: 'Configuración', icon: Settings }],
  },
];

const roleLabels = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Karnes en su Jugo</div>
        <nav className="sidebar-nav">
          {navSections.map((section, i) => (
            <div className="nav-section" key={i}>
              {section.label && <div className="nav-section-label">{section.label}</div>}
              {section.items.map(({ to, label, icon: Icon, end, adminOnly }) => {
                if (adminOnly && user?.role !== 'ADMIN') return null;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-meta">{user?.email}</div>
          <div className="sidebar-user-role">{roleLabels[user?.role] ?? user?.role}</div>
          <button type="button" className="nav-item nav-item-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
