import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./guards";
import { PublicLayout } from "../layouts/PublicLayout";
import { UserLayout } from "../layouts/UserLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { HomePage } from "../pages/public/HomePage";
import { DonationCriteriaPage } from "../pages/public/DonationCriteriaPage";
import { PracticalInfoPage } from "../pages/public/PracticalInfoPage";
import { ItemsPage } from "../pages/public/ItemsPage";
import { WorkshopsPage } from "../pages/public/WorkshopsPage";
import { WorkshopDetailPage } from "../pages/public/WorkshopDetailPage";
import { LoginPage } from "../pages/public/LoginPage";
import { RegisterPage } from "../pages/public/RegisterPage";
import { NotFoundPage } from "../pages/system/NotFoundPage";
import { ForbiddenPage } from "../pages/system/ForbiddenPage";
import { UnsubscribePage } from "../pages/system/UnsubscribePage";
import { DashboardPage } from "../pages/user/DashboardPage";
import { PlanningPage } from "../pages/user/PlanningPage";
import { RegistrationsPage } from "../pages/user/RegistrationsPage";
import { ShiftsPage } from "../pages/user/ShiftsPage";
import { ProfilePage } from "../pages/user/ProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminWorkshopsPage from "../pages/admin/AdminWorkshopsPage";
import AdminItemsPage from "../pages/admin/AdminItemsPage";
import AdminRegistrationsPage from "../pages/admin/AdminRegistrationsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Espace public */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="criteres-de-don" element={<DonationCriteriaPage />} />
        <Route path="infos-pratiques" element={<PracticalInfoPage />} />
        <Route path="objets" element={<ItemsPage />} />
        <Route path="ateliers" element={<WorkshopsPage />} />
        <Route path="ateliers/:id" element={<WorkshopDetailPage />} />
        <Route path="connexion" element={<LoginPage />} />
        <Route path="inscription" element={<RegisterPage />} />
        <Route path="desinscription/:token" element={<UnsubscribePage />} />
        <Route path="403" element={<ForbiddenPage />} />
      </Route>

      {/* Espace personnel */}
      <Route element={<RequireAuth />}>
        <Route path="espace-personnel" element={<UserLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="inscriptions" element={<RegistrationsPage />} />
          <Route path="permanences" element={<ShiftsPage />} />
          <Route path="profil" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Espace administration */}
      <Route element={<RequireAuth />}>
        <Route path="administration" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="ateliers" element={<AdminWorkshopsPage />} />
          <Route path="objets" element={<AdminItemsPage />} />
          <Route path="inscriptions" element={<AdminRegistrationsPage />} />
          <Route path="utilisateurs" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* 404 global */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
