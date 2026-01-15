export default function CashBreakStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-gray-600 text-sm">Total de Pausas</p>
        <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-gray-600 text-sm">Aprovadas</p>
        <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-gray-600 text-sm">Pendentes</p>
        <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-gray-600 text-sm">Rejeitadas</p>
        <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
      </div>
    </div>
  );
}
