import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminItemsPage from '../pages/admin/AdminItemsPage';
import AdminWorkshopsPage from '../pages/admin/AdminWorkshopsPage';
import AdminRegistrationsPage from '../pages/admin/AdminRegistrationsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          {/* L'index correspond à l'URL /admin (le Dashboard) */}
          <Route index element={<AdminDashboardPage />} />
          
          {/* Les sous-pages qui s'affichent quand on clique sur les onglets */}
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="items" element={<AdminItemsPage />} />
          <Route path="workshops" element={<AdminWorkshopsPage />} />
          <Route path="registrations" element={<AdminRegistrationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}