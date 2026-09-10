import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
