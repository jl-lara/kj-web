import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    navigate('/');
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Karnes en su Jugo</h1>
        <p>Panel administrativo</p>
        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@karnesensujugo.com"
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
            required
          />
        </label>
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
}
