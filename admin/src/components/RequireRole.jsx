import { useAuth } from '../auth/AuthContext';

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="page">
        <div className="forbidden-card">
          <h1>403 — Acceso denegado</h1>
          <p>No tienes permisos para ver esta sección.</p>
        </div>
      </div>
    );
  }

  return children;
}
