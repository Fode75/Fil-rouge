import { useState, type FormEvent } from "react";
import { Field } from "../ui/Field";
import { login } from "../../services/auth";

export function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form className="paper form" onSubmit={onSubmit} noValidate>
      {register && (
        <Field id="name" label="Nom complet" autoComplete="name" required />
      )}
      <Field id="email" label="Adresse e-mail" type="email" autoComplete="email" required />
      <Field
        id="password"
        label="Mot de passe"
        type="password"
        autoComplete={register ? "new-password" : "current-password"}
        required
      />
      <button className="btn" type="submit">
        {register ? "Créer mon compte" : "Me connecter"}
      </button>
      {error && <p role="alert" className="state-error">{error}</p>}
    </form>
  );
}

