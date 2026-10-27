export function DonationCriteriaPage() {
  return (
    <>
      <h1>Ce que nous acceptons</h1>
      <p className="notice">Contenu provisoire : à remplacer par les critères officiels de la ressourcerie.</p>
      <div className="grid">
        <section className="paper card">
          <h2>Acceptés</h2>
          <ul>
            <li>Meubles en bon état</li>
            <li>Petit électroménager qui fonctionne</li>
            <li>Livres, vaisselle, luminaires</li>
          </ul>
        </section>
        <section className="paper card">
          <h2>Refusés</h2>
          <ul>
            <li>Objets cassés non réparables</li>
            <li>Literie usagée</li>
            <li>Produits dangereux</li>
          </ul>
        </section>
      </div>
    </>
  );
}

