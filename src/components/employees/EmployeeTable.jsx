export default function EmployeeTable({ data, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum funcionário encontrado</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-3 text-left">Nome</th>
            <th className="border border-gray-300 p-3 text-left">Email</th>
            <th className="border border-gray-300 p-3 text-left">Departamento</th>
            <th className="border border-gray-300 p-3 text-left">Cargo</th>
            <th className="border border-gray-300 p-3 text-left">Salário</th>
            <th className="border border-gray-300 p-3 text-left">Status</th>
            <th className="border border-gray-300 p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-3">{item.name}</td>
              <td className="border border-gray-300 p-3">{item.email}</td>
              <td className="border border-gray-300 p-3">{item.department}</td>
              <td className="border border-gray-300 p-3">{item.position}</td>
              <td className="border border-gray-300 p-3">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                }).format(item.salary || 0)}
              </td>
              <td className="border border-gray-300 p-3">
                <span className={`px-2 py-1 rounded text-sm ${
                  item.status === 'active' ? 'bg-green-100 text-green-800' :
                  item.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status === 'active' ? 'Ativo' : item.status === 'inactive' ? 'Inativo' : 'Suspenso'}
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
