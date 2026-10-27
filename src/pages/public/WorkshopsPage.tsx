import { useAsync } from "../../hooks/useAsync";
import { getWorkshops } from "../../services/workshops";
import { StateView } from "../../components/ui/StateView";
import { MockNotice } from "../../components/ui/MockNotice";
import { WorkshopCard } from "../../components/business/WorkshopCard";

export function WorkshopsPage() {
  const { data, loading, error } = useAsync(getWorkshops);
  return (
    <>
      <h1>Ateliers à venir</h1>
      <MockNotice />
      <StateView
        loading={loading}
        error={error}
        empty={data?.length === 0}
        emptyTitle="Aucun atelier prévu"
        emptyText="De nouveaux ateliers seront bientôt annoncés."
      >
        <div className="grid">
          {data?.map((w) => <WorkshopCard key={w.id} w={w} />)}
        </div>
      </StateView>
    </>
  );
}

