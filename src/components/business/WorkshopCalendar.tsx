import { useEffect, useMemo, useState } from "react";
import type { Workshop } from "../../types/workshop";

const DAYS = [["lun", "lundi"], ["mar", "mardi"], ["mer", "mercredi"], ["jeu", "jeudi"], ["ven", "vendredi"], ["sam", "samedi"], ["dim", "dimanche"]];
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

interface Props {
  workshops?: Workshop[];
  selectedDay?: string | null;
  onSelectDay?: (day: string | null) => void;
}

// Calendrier vierge par défaut : sans atelier, il affiche simplement le mois en cours.
export function WorkshopCalendar({ workshops = [], selectedDay, onSelectDay }: Props) {
  const [cur, setCur] = useState(firstOfMonth(new Date()));
  const [inner, setInner] = useState<string | null>(null);
  const sel = selectedDay !== undefined ? selectedDay : inner;
  const setSel = onSelectDay ?? setInner;

  useEffect(() => {
    if (!workshops.length) return;
    setCur(firstOfMonth(new Date(Math.min(...workshops.map((w) => new Date(w.starts_at).getTime())))));
    setSel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshops]);

  const byDay = useMemo(() => {
    const m: Record<string, Workshop[]> = {};
    workshops.forEach((w) => { (m[dayKey(new Date(w.starts_at))] ||= []).push(w); });
    return m;
  }, [workshops]);

  const offset = (cur.getDay() + 6) % 7; // semaine commençant le lundi
  const count = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: count }, (_, i) => new Date(cur.getFullYear(), cur.getMonth(), i + 1));
  const move = (n: number) => { setCur(new Date(cur.getFullYear(), cur.getMonth() + n, 1)); setSel(null); };
  const today = dayKey(new Date());
  const title = cur.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const inMonth = days.reduce((n, d) => n + (byDay[dayKey(d)]?.length ?? 0), 0);

  return (
    <section className="cal" aria-label="Calendrier des ateliers">
      <div className="cal-head">
        <button className="btn" onClick={() => move(-1)} aria-label="Mois précédent">←</button>
        <h2 aria-label={title} aria-live="polite">
          {[...title].map((c, i) => c === " " ? <span key={i} className="sp" /> : <span key={i} aria-hidden="true" className={`ltr l${i % 5}`}>{c}</span>)}
        </h2>
        <button className="btn" onClick={() => move(1)} aria-label="Mois suivant">→</button>
      </div>
      <div className="cal-wds">{DAYS.map(([s, l]) => <abbr key={s} title={l}>{s}</abbr>)}</div>
      <div className="cal-grid">
        {Array.from({ length: offset }, (_, i) => <span key={`o${i}`} />)}
        {days.map((d) => {
          const k = dayKey(d), ws = byDay[k] ?? [], cls = `cal-day${k === today ? " today" : ""}`;
          if (!ws.length) return <div key={k} className={cls}><span className="cal-num">{d.getDate()}</span></div>;
          const full = ws.every((w) => w.spots_taken >= w.max_capacity);
          return (
            <button key={k} className={`${cls} has${full ? " full" : ""}`} aria-pressed={sel === k}
              aria-label={`${d.getDate()} ${d.toLocaleDateString("fr-FR", { month: "long" })} : ${ws.length} atelier${ws.length > 1 ? "s" : ""}${full ? ", complet" : ""}`}
              onClick={() => setSel(sel === k ? null : k)}>
              <span className="cal-num">{d.getDate()}</span><span className="cal-dot" aria-hidden="true">♻</span>
            </button>
          );
        })}
      </div>
      <p className="cal-legend">{inMonth ? `${inMonth} atelier${inMonth > 1 ? "s" : ""} ce mois-ci` : "Aucun atelier ce mois-ci"} · vert : places · orange : complet</p>
    </section>
  );
}