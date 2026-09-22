import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../data/siteData.js';
import logo from '../images/logo-top-portal.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <nav className="navbar container" aria-label="Navegación principal">
        <NavLink className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-logo-wrap">
            <img src={logo} alt="Karnes en su Jugo Tijuana" />
          </span>
          <span>
            <strong>Karnes en su Jugo</strong>
            <small>Tijuana</small>
          </span>
        </NavLink>

        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-links ${open ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
