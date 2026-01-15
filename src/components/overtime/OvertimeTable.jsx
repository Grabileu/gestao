export default function OvertimeTable({ data, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum dado encontrado</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-3 text-left">ID</th>
            <th className="border border-gray-300 p-3 text-left">Funcionário</th>
            <th className="border border-gray-300 p-3 text-left">Data</th>
            <th className="border border-gray-300 p-3 text-left">Horas</th>
            <th className="border border-gray-300 p-3 text-left">Motivo</th>
            <th className="border border-gray-300 p-3 text-left">Status</th>
            <th className="border border-gray-300 p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-3">{item.id}</td>
              <td className="border border-gray-300 p-3">{item.employee}</td>
              <td className="border border-gray-300 p-3">{item.date}</td>
              <td className="border border-gray-300 p-3">{item.hours}h</td>
              <td className="border border-gray-300 p-3">{item.reason}</td>
              <td className="border border-gray-300 p-3">
                <span className={`px-2 py-1 rounded text-sm ${
                  item.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.approved ? 'Aprovado' : 'Pendente'}
                </span>
              </td>
              <td className="border border-gray-300 p-3">
                <button onClick={() => onEdit?.(item)} className="text-blue-600 hover:text-blue-800 mr-2">
                  Editar
                </button>
                <button onClick={() => onDelete?.(item.id)} className="text-red-600 hover:text-red-800">
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
