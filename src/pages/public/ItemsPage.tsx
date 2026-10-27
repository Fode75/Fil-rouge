import { useAsync } from "../../hooks/useAsync";
import { getItems } from "../../services/items";
import { StateView } from "../../components/ui/StateView";
import { MockNotice } from "../../components/ui/MockNotice";

export function ItemsPage() {
  const { data, loading, error } = useAsync(getItems);
  return (
    <>
      <h1>Objets disponibles</h1>
      <MockNotice />
      <StateView
        loading={loading}
        error={error}
        empty={data?.length === 0}
        emptyTitle="Aucun objet en vente"
        emptyText="Revenez bientôt : le stock change chaque semaine."
      >
        <ul className="grid list">
          {data?.map((i) => (
            <li key={i.id} className="paper card">
              <h3>{i.title}</h3>
              <p className="muted">{i.category}</p>
              <p><strong>{i.price} €</strong></p>
            </li>
          ))}
        </ul>
      </StateView>
    </>
  );
}

