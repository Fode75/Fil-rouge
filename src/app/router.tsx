import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./guards";
import { PublicLayout } from "../layouts/PublicLayout";
import { UserLayout } from "../layouts/UserLayout";
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
// L'espace /administration est pris en charge par l'autre développeur.

export function AppRoutes() {
  return (
    <Routes>
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
      <Route element={<RequireAuth />}>
        <Route path="espace-personnel" element={<UserLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="inscriptions" element={<RegistrationsPage />} />
          <Route path="permanences" element={<ShiftsPage />} />
          <Route path="profil" element={<ProfilePage />} />
        </Route>
      </Route>
      {/* 404 global — capte toutes les URLs non reconnues */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

