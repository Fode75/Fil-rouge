import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";

// TODO: brancher sur l'authentification Supabase. Le contrôle réel reste côté serveur.
// Aperçu local uniquement (.env.development) : n'est pas une authentification.
export const isPreview =
  import.meta.env.DEV && import.meta.env.VITE_PREVIEW_USER_SPACE === "true";

export function RequireAuth() {
  return isPreview ? <Outlet /> : <Navigate to={ROUTES.login} replace />;
}

