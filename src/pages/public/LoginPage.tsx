import { Link } from "react-router-dom";
import { ROUTES } from "../../app/routes";
import { AuthForm } from "../../components/business/AuthForm";

export function LoginPage() {
  return (
    <div className="auth">
      <h1>Connexion</h1>
      <AuthForm />
      <p>
        Pas encore de compte ? <Link to={ROUTES.register}>Créer un compte</Link>
      </p>
    </div>
  );
}