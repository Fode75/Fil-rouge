import { Link } from "react-router-dom";
import { ROUTES } from "../../app/routes";
import emblem from "../../assets/emblem.png";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Ici, rien ne se jette : tout se répare, se donne et se partage.</h1>
          <p>Déposez vos objets, trouvez-en de nouveaux et venez apprendre à réparer lors de nos ateliers.</p>
          <p className="actions">
            <Link className="btn" to={ROUTES.workshops}>Voir les ateliers</Link>
            <Link className="btn btn-alt" to={ROUTES.donation}>Que puis-je donner ?</Link>
          </p>
        </div>
        <img
          src={emblem}
          alt="Chaise, lampe, livres et clé à molette entourés du symbole du recyclage"
          className="emblem"
        />
      </section>
      <section className="grid">
        <Link className="paper card tile" to={ROUTES.items}>
          <h2>Objets à vendre</h2>
          <p>Meubles, luminaires, livres à petit prix.</p>
        </Link>
        <Link className="paper card tile" to={ROUTES.info}>
          <h2>Où et quand venir</h2>
          <p>Horaires d'ouverture et adresse.</p>
        </Link>
        <Link className="paper card tile" to={ROUTES.register}>
          <h2>Devenir bénévole</h2>
          <p>Créez un compte et choisissez vos permanences.</p>
        </Link>
      </section>
    </>
  );
}

