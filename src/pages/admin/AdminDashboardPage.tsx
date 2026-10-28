import { mockWorkshops } from "../../mocks/workshops";
import { mockItems } from "../../mocks/items";
import { formatDate } from "../../utils/date";

export default function AdminDashboardPage() {
  const totalSpots = mockWorkshops.reduce((s, w) => s + w.max_capacity, 0);
  const totalTaken = mockWorkshops.reduce((s, w) => s + w.spots_taken, 0);

  return (
    <>
      <h1>Vue d'ensemble</h1>
      <p className="notice">Données fictives — l'API n'est pas encore branchée.</p>

      <div className="grid" style={{ marginTop: "1.5rem" }}>
        <div className="paper card">
          <p className="muted" style={{ margin: 0 }}>Ateliers</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: ".25rem 0 0" }}>
            {mockWorkshops.length}
          </p>
        </div>
        <div className="paper card">
          <p className="muted" style={{ margin: 0 }}>Objets en stock</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: ".25rem 0 0" }}>
            {mockItems.length}
          </p>
        </div>
        <div className="paper card">
          <p className="muted" style={{ margin: 0 }}>Inscriptions</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: ".25rem 0 0" }}>
            {totalTaken} / {totalSpots}
          </p>
        </div>
      </div>

      <div className="paper" style={{ marginTop: "1.5rem" }}>
        <h2>Prochains ateliers</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--green)" }}>
              <th style={{ textAlign: "left", padding: ".5rem" }}>Atelier</th>
              <th style={{ textAlign: "left", padding: ".5rem" }}>Date</th>
              <th style={{ textAlign: "left", padding: ".5rem" }}>Remplissage</th>
            </tr>
          </thead>
          <tbody>
            {mockWorkshops.map((w) => {
              const pct = Math.round((w.spots_taken / w.max_capacity) * 100);
              const full = w.spots_taken >= w.max_capacity;
              return (
                <tr key={w.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: ".5rem", fontWeight: 700 }}>{w.title}</td>
                  <td style={{ padding: ".5rem" }} className="muted">{formatDate(w.starts_at)}</td>
                  <td style={{ padding: ".5rem", minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                      <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 4, height: 8 }}>
                        <div style={{
                          width: `${pct}%`,
                          background: full ? "var(--orange)" : "var(--green)",
                          height: "100%",
                          borderRadius: 4,
                        }} />
                      </div>
                      <span className="muted" style={{ fontSize: ".85rem", whiteSpace: "nowrap" }}>
                        {w.spots_taken}/{w.max_capacity}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

