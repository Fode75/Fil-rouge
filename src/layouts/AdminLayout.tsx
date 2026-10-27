import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barre latérale (Sidebar) */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-slate-700">
          Admin - Ressourcerie
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block px-4 py-2 rounded hover:bg-slate-700">Dashboard</Link>
          <Link to="/admin/users" className="block px-4 py-2 rounded hover:bg-slate-700">Utilisateurs</Link>
          <Link to="/admin/items" className="block px-4 py-2 rounded hover:bg-slate-700">Objets</Link>
          <Link to="/admin/workshops" className="block px-4 py-2 rounded hover:bg-slate-700">Ateliers</Link>
          <Link to="/admin/registrations" className="block px-4 py-2 rounded hover:bg-slate-700">Inscriptions</Link>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* C'est ici que s'afficheront tes pages spécifiques (Dashboard, Users, etc.) */}
      </main>
    </div>
  );
}