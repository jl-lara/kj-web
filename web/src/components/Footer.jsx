import { ExternalLink, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { navItems } from '../data/siteData.js';
import { useSite } from '../context/SiteContext.jsx';
import logo from '../images/logo-top-portal.png';

export default function Footer() {
  const { settings, social, locations } = useSite();

  const phone = settings?.phone || locations[0]?.phone || '';
  const address = settings?.address || locations[0]?.address || '';

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
          {phone && <a href={`tel:${phone}`}><Phone size={16} /> {phone}</a>}
          {address && <span><MapPin size={16} /> {address}</span>}
        </div>
        <div>
          <h2>Redes</h2>
          {social.facebook && (
            <a href={social.facebook} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Facebook</a>
          )}
          {social.instagram && (
            <a href={social.instagram} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Instagram</a>
          )}
          {social.tiktok && (
            <a href={social.tiktok} target="_blank" rel="noreferrer"><ExternalLink size={16} /> TikTok</a>
          )}
          <span className="legal">Aviso de privacidad</span>
        </div>
      </div>
    </footer>
  );
}
