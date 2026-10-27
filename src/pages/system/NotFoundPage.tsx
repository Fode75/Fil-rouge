import { Link } from "react-router-dom";
import { ROUTES } from "../../app/routes";

export const NotFoundPage = () => (
  <>
    <h1>Page introuvable</h1>
    <p>Cette adresse n'existe pas.</p>
    <Link className="btn" to={ROUTES.home}>Retour à l'accueil</Link>
  </>
);

