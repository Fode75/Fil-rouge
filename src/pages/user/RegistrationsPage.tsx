import { useAsync } from "../../hooks/useAsync";
import { getMyRegistrations } from "../../services/registrations";
import { StateView } from "../../components/ui/StateView";
import { formatDate } from "../../utils/date";

export function RegistrationsPage() {
  const { data, loading, error } = useAsync(getMyRegistrations);
  return (
    <>
      <h1>Mes ateliers</h1>
      <StateView
        loading={loading}
        error={error}
        empty={!data?.length}
        emptyTitle="Aucune inscription"
        emptyText="Inscrivez-vous à un atelier depuis la page Ateliers."
      >
        <ul>
          {data?.map((r) => (
            <li key={r.id}>{r.workshop_title} — {formatDate(r.starts_at)}</li>
          ))}
        </ul>
      </StateView>
    </>
  );
}

