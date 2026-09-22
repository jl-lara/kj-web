import { useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { friendlyError } from '../api/errors';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(friendlyError(err, 'No se pudo iniciar sesión.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Karnes en su Jugo</h1>
        <p>Panel administrativo</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@karnesensujugo.com"
            autoComplete="username"
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
