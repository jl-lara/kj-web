import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import DynamicFavicon from '../components/DynamicFavicon.jsx';

export default function MainLayout() {
  return (
    <>
      <DynamicFavicon />
      <Navbar />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
