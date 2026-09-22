import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import Locations from './pages/Locations.jsx';
import Menu from './pages/Menu.jsx';
import Promotions from './pages/Promotions.jsx';
import Reservaciones from './pages/Reservaciones.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reservaciones" element={<Reservaciones />} />
        <Route path="/sucursales" element={<Locations />} />
        <Route path="/historia" element={<About />} />
        <Route path="/promociones" element={<Promotions />} />
        <Route path="/contacto" element={<Contact />} />
      </Route>
    </Routes>
  );
}
