import { Link } from "react-router-dom";
import { ROUTES } from "../../app/routes";
import { formatDate } from "../../utils/date";
import type { Workshop } from "../../types/workshop";

export function WorkshopCard({ w }: { w: Workshop }) {
  const full = w.spots_taken >= w.max_capacity;
  return (
    <article className="paper card">
      <h3>{w.title}</h3>
      <p className="muted">{formatDate(w.starts_at)}</p>
      <p>{w.description}</p>
      <p>
        <span className={full ? "badge badge-full" : "badge"}>
          {full ? "Complet" : `${w.max_capacity - w.spots_taken} places restantes`}
        </span>
      </p>
      <Link className="btn" to={ROUTES.workshop(w.id)}>
        Voir l'atelier
      </Link>
    </article>
  );
}

