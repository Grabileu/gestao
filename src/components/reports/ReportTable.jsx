export default function ReportTable({ data, isLoading }) {
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
            <th className="border border-gray-300 p-3 text-left">Tipo</th>
            <th className="border border-gray-300 p-3 text-left">Data</th>
            <th className="border border-gray-300 p-3 text-left">Status</th>
            <th className="border border-gray-300 p-3 text-left">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-3">{item.id}</td>
              <td className="border border-gray-300 p-3">{item.type}</td>
              <td className="border border-gray-300 p-3">{item.date}</td>
              <td className="border border-gray-300 p-3">
                <span className={`px-2 py-1 rounded text-sm ${
                  item.status === 'completed' ? 'bg-green-100 text-green-800' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="border border-gray-300 p-3">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
