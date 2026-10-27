import { useAsync } from "../../hooks/useAsync";
import { getMyShifts } from "../../services/shifts";
import { StateView } from "../../components/ui/StateView";
import { formatDate } from "../../utils/date";

export function ShiftsPage() {
  const { data, loading, error } = useAsync(getMyShifts);
  return (
    <>
      <h1>Permanences</h1>
      <StateView
        loading={loading}
        error={error}
        empty={!data?.length}
        emptyTitle="Aucun créneau choisi"
        emptyText="Les créneaux disponibles seront proposés ici."
      >
        <ul>
          {data?.map((s) => (
            <li key={s.id}>{s.title} — {formatDate(s.starts_at)}</li>
          ))}
        </ul>
      </StateView>
    </>
  );
}

