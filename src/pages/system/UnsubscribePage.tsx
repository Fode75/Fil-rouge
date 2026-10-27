import { useParams } from "react-router-dom";

export function UnsubscribePage() {
  const { token } = useParams();
  return (
    <>
      <h1>Se désinscrire d'un atelier</h1>
      <p className="notice">
        Le lien {token ? "est bien reçu" : "est invalide"}, mais la désinscription n'est pas encore branchée à l'API.
      </p>
      <p>
        Une fois l'API prête, un bouton « Confirmer ma désinscription » apparaîtra ici,
        avec les cas lien expiré et désinscription réussie.
      </p>
    </>
  );
}

