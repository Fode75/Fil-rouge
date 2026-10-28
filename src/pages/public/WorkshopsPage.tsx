import { useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { getWorkshops } from "../../services/workshops";
import { StateView } from "../../components/ui/StateView";
import { MockNotice } from "../../components/ui/MockNotice";
import { WorkshopCard } from "../../components/business/WorkshopCard";
import { WorkshopCalendar, dayKey } from "../../components/business/WorkshopCalendar";

export function WorkshopsPage() {
  const { data, loading, error } = useAsync(getWorkshops);
  const [day, setDay] = useState<string | null>(null);
  const all = data ?? [];
  const shown = day ? all.filter((w) => dayKey(new Date(w.starts_at)) === day) : all;
  const dayLabel = day ? new Date(`${day}T00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "";

  return (
    <>
      <p className="accent">Apprendre en réparant</p>
      <h1>Ateliers à venir</h1>
      <MockNotice />
      <div className="ws-layout">
        <aside className="ws-side" aria-label="Agenda des ateliers">
          <WorkshopCalendar workshops={all} selectedDay={day} onSelectDay={setDay} />
        </aside>
        <section className="ws-main">
          <h2>{day ? `Ateliers du ${dayLabel}` : "Tous les ateliers"}</h2>
          {day && <p className="actions"><button className="btn btn-alt" onClick={() => setDay(null)}>Voir tous les ateliers</button></p>}
          <StateView loading={loading} error={error} empty={data?.length === 0} emptyTitle="Aucun atelier prévu" emptyText="De nouveaux ateliers seront bientôt annoncés.">
            {shown.length ? <div className="grid">{shown.map((w) => <WorkshopCard key={w.id} w={w} />)}</div> : <p className="muted">Aucun atelier ce jour-là.</p>}
          </StateView>
        </section>
      </div>
    </>
  );
}