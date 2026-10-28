import { mockWorkshops } from "../../mocks/workshops";
import { formatDate } from "../../utils/date";

export default function AdminWorkshopsPage() {
  return (
    <>
      <h1>Gestion des ateliers</h1>
      <p className="notice">Données fictives — l'API n'est pas encore branchée.</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1.5rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--green)" }}>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Titre</th>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Date</th>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Places</th>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {mockWorkshops.map((w) => {
            const full = w.spots_taken >= w.max_capacity;
            return (
              <tr key={w.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: ".5rem", fontWeight: 700 }}>{w.title}</td>
                <td style={{ padding: ".5rem" }} className="muted">{formatDate(w.starts_at)}</td>
                <td style={{ padding: ".5rem" }}>{w.spots_taken} / {w.max_capacity}</td>
                <td style={{ padding: ".5rem" }}>
                  <span className={full ? "badge badge-full" : "badge"}>
                    {full ? "Complet" : "Ouvert"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

