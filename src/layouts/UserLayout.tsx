import { NavLink, Outlet, Link } from "react-router-dom";
import { ROUTES } from "../app/routes";
import { isPreview } from "../app/guards";

const links = [
  [ROUTES.me, "Tableau de bord"],
  [ROUTES.planning, "Mon planning"],
  [ROUTES.registrations, "Mes ateliers"],
  [ROUTES.shifts, "Permanences"],
  [ROUTES.profile, "Mon profil"],
] as const;

export function UserLayout() {
  return (
    <div className="user-shell">
      <aside className="paper side">
        <Link to={ROUTES.home}>← Retour au site</Link>
        <nav aria-label="Espace personnel">
          {links.map(([to, l]) => (
            <NavLink key={to} to={to} end={to === ROUTES.me}>{l}</NavLink>
          ))}
        </nav>
      </aside>
      <main className="container">
        {isPreview && (
          <p className="notice">
            Aperçu développeur : l'accès n'est pas protégé. L'authentification sera branchée sur le backend.
          </p>
        )}
        <Outlet />
      </main>
    </div>
  );
}

