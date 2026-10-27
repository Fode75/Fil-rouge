import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ROUTES } from "../app/routes";
import logo from "../assets/logo.png";

const links = [
  [ROUTES.workshops, "Ateliers"],
  [ROUTES.items, "Objets"],
  [ROUTES.donation, "Dons"],
  [ROUTES.info, "Infos pratiques"],
] as const;

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">Aller au contenu</a>
      <header className="site-header">
        <Link to={ROUTES.home} aria-label="La Ressourcerie du Quartier, accueil">
          <img src={logo} alt="La Ressourcerie du Quartier" className="logo" />
        </Link>
        <button
          className="btn menu-btn"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
        <nav id="nav" className={open ? "nav open" : "nav"} aria-label="Navigation principale" onClick={() => setOpen(false)}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to}>{label}</NavLink>
          ))}
          <NavLink to={ROUTES.me}>Mon espace</NavLink>
          <Link className="btn" to={ROUTES.login}>Connexion</Link>
        </nav>
      </header>
      <main id="main" className="container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>La Ressourcerie du Quartier · Donner une seconde vie aux objets.</p>
      </footer>
    </>
  );
}

