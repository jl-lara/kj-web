import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RequireRole from './components/RequireRole.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Locations from './pages/Locations.jsx';
import Promotions from './pages/Promotions.jsx';
import Gallery from './pages/Gallery.jsx';
import Users from './pages/Users.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/sucursales" element={<Locations />} />
        <Route path="/promociones" element={<Promotions />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route
          path="/usuarios"
          element={
            <RequireRole roles={['ADMIN']}>
              <Users />
            </RequireRole>
          }
        />
        <Route path="/configuracion" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
