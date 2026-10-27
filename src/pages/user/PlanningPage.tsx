import { useAsync } from "../../hooks/useAsync";
import { getMyRegistrations } from "../../services/registrations";
import { getMyShifts } from "../../services/shifts";
import { StateView } from "../../components/ui/StateView";
import { formatDate } from "../../utils/date";

export function PlanningPage() {
  const reg = useAsync(getMyRegistrations);
  const shifts = useAsync(getMyShifts);
  const loading = reg.loading || shifts.loading;
  const error = reg.error ?? shifts.error;
  const isEmpty = !reg.data?.length && !shifts.data?.length;

  return (
    <>
      <h1>Mon planning</h1>
      <StateView
        loading={loading}
        error={error}
        empty={isEmpty}
        emptyTitle="Rien de prévu"
        emptyText="Vos permanences et ateliers apparaîtront ici."
      >
        {!!shifts.data?.length && (
          <>
            <h2>Permanences</h2>
            <ul>
              {shifts.data.map((s) => (
                <li key={s.id}>{s.title} — {formatDate(s.starts_at)}</li>
              ))}
            </ul>
          </>
        )}
        {!!reg.data?.length && (
          <>
            <h2>Ateliers inscrits</h2>
            <ul>
              {reg.data.map((r) => (
                <li key={r.id}>{r.workshop_title} — {formatDate(r.starts_at)}</li>
              ))}
            </ul>
          </>
        )}
      </StateView>
    </>
  );
}

