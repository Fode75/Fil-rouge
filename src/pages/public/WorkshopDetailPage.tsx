import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "../../app/routes";
import { useAsync } from "../../hooks/useAsync";
import { getWorkshop, registerToWorkshop } from "../../services/workshops";
import { StateView } from "../../components/ui/StateView";
import { Field } from "../../components/ui/Field";
import { MockNotice } from "../../components/ui/MockNotice";
import { formatDate } from "../../utils/date";

export function WorkshopDetailPage() {
  const { id = "" } = useParams();
  const { data, loading, error } = useAsync(() => getWorkshop(id), [id]);
  const [formError, setFormError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const f = new FormData(e.currentTarget);
    try {
      await registerToWorkshop(id, {
        name: String(f.get("name")),
        email: String(f.get("email")),
      });
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <>
      <Link to={ROUTES.workshops}>← Tous les ateliers</Link>
      <MockNotice />
      <StateView
        loading={loading}
        error={error}
        empty={!data}
        emptyTitle="Atelier introuvable"
        emptyText="Cet atelier n'existe pas ou n'est plus proposé."
      >
        {data && (
          <>
            <h1>{data.title}</h1>
            <p className="muted">
              {formatDate(data.starts_at)} · {data.spots_taken}/{data.max_capacity} inscrits
            </p>
            <p>{data.description}</p>
            <form className="paper form" onSubmit={onSubmit} noValidate>
              <h2>Réserver ma place</h2>
              <Field id="name" label="Nom complet" autoComplete="name" required />
              <Field id="email" label="Adresse e-mail" type="email" autoComplete="email" required />
              <button
                className="btn"
                type="submit"
                disabled={data.spots_taken >= data.max_capacity}
              >
                Réserver ma place
              </button>
              {formError && <p role="alert" className="state-error">{formError}</p>}
            </form>
          </>
        )}
      </StateView>
    </>
  );
}

