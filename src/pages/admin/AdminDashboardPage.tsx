import FillRateBar from '../../components/FillRateBar';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Vue d'ensemble</h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-slate-500 text-sm font-medium">Utilisateurs inscrits</h2>
          <p className="text-3xl font-bold text-slate-800 mt-2">124</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-slate-500 text-sm font-medium">Objets en stock</h2>
          <p className="text-3xl font-bold text-slate-800 mt-2">45</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-slate-500 text-sm font-medium">Ateliers ce mois-ci</h2>
          <p className="text-3xl font-bold text-slate-800 mt-2">8</p>
        </div>
      </div>

      {/* Section Ateliers avec la FillRateBar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Prochains ateliers</h2>
        
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-slate-700 mb-2">Atelier Réparation Vélos</h3>
            <FillRateBar current={8} max={10} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Initiation Couture</h3>
            <FillRateBar current={3} max={15} />
          </div>
        </div>
      </div>
    </div>
  );
}