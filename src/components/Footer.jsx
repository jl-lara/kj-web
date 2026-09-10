import { ExternalLink, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { locations, navItems, social } from '../data/siteData.js';
import logo from '../images/logo-top-portal.png';

export default function Footer() {
  const mainLocation = locations[0];

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <img className="footer-logo" src={logo} alt="Karnes en su Jugo Tijuana" />
          <p>Karnes en su Jugo Tijuana conserva una receta familiar con presencia actual en la ciudad.</p>
        </div>
        <div>
          <h2>Navegación</h2>
          <div className="footer-nav-cols">
            <div>
              {navItems.slice(0, 4).map((item) => (
                <Link key={item.path} to={item.path}>{item.label}</Link>
              ))}
            </div>
            <div>
              {navItems.slice(4).map((item) => (
                <Link key={item.path} to={item.path}>{item.label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h2>Contacto</h2>
          <a href={`tel:${mainLocation.tel}`}><Phone size={16} /> {mainLocation.phone}</a>
          <span><MapPin size={16} /> {mainLocation.address}</span>
        </div>
        <div>
          <h2>Redes</h2>
          <a href={social.facebook} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Facebook</a>
          <span className="legal">Aviso de privacidad</span>
        </div>
      </div>
    </footer>
  );
}
