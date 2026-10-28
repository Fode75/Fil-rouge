import { Link } from "react-router-dom";
import { ROUTES } from "../../app/routes";
import { AuthForm } from "../../components/business/AuthForm";

export function RegisterPage() {
  return (
    <div className="auth">
      <h1>Créer un compte</h1>
      <AuthForm register />
      <p>
        Déjà inscrit ? <Link to={ROUTES.login}>Se connecter</Link>
      </p>
    </div>
  );
}