import { Field } from "../../components/ui/Field";

export const ProfilePage = () => (
  <>
    <h1>Mon profil</h1>
    <form className="paper form" onSubmit={(e) => e.preventDefault()}>
      <Field id="name" label="Nom complet" />
      <Field id="email" label="Adresse e-mail" type="email" />
      <button className="btn" type="submit" disabled>
        Enregistrer (bientôt disponible)
      </button>
    </form>
  </>
);

