import { Link } from "react-router-dom";
import { ROUTES } from "../../app/routes";

export const ForbiddenPage = () => (
  <>
    <h1>Accès interdit</h1>
    <p>Vous n'avez pas les droits pour voir cette page.</p>
    <Link className="btn" to={ROUTES.home}>Retour à l'accueil</Link>
  </>
);

