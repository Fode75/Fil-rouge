import { NavLink, Outlet, Link } from "react-router-dom";

const links = [
  ["/administration", "Vue d'ensemble"],
  ["/administration/ateliers", "Ateliers"],
  ["/administration/objets", "Objets"],
  ["/administration/inscriptions", "Inscriptions"],
  ["/administration/utilisateurs", "Utilisateurs"],
] as const;

export function AdminLayout() {
  return (
    <div className="user-shell">
      <aside className="paper side">
        <Link to="/">← Retour au site</Link>
        <nav aria-label="Administration">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/administration"}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
