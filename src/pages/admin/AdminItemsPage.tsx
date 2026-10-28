import { mockItems } from "../../mocks/items";

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  reserved: "Réservé",
  sold: "Vendu",
  donated: "Donné",
  unavailable: "Indisponible",
};

const CATEGORY_LABELS: Record<string, string> = {
  furniture: "Mobilier",
  clothing: "Vêtements",
  books: "Livres",
  electronics: "Électronique",
  kitchenware: "Cuisine",
  other: "Autre",
};

export default function AdminItemsPage() {
  return (
    <>
      <h1>Gestion des objets</h1>
      <p className="notice">Données fictives — l'API n'est pas encore branchée.</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1.5rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--green)" }}>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Titre</th>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Catégorie</th>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Prix</th>
            <th style={{ textAlign: "left", padding: ".5rem" }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {mockItems.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: ".5rem", fontWeight: 700 }}>{item.title}</td>
              <td style={{ padding: ".5rem" }} className="muted">
                {CATEGORY_LABELS[item.category] ?? item.category}
              </td>
              <td style={{ padding: ".5rem" }}>{item.price} €</td>
              <td style={{ padding: ".5rem" }}>
                <span className="badge">{STATUS_LABELS[item.status] ?? item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

