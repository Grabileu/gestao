export default function EmployeeCard({ employee, onEdit, onDelete }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-blue-500/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
          <p className="text-sm text-slate-400">{employee.position}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit?.(employee)} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded bg-blue-500/10">
            Editar
          </button>
          <button onClick={() => onDelete?.(employee.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10">
            Deletar
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-slate-400">
        <p>Email: {employee.email}</p>
        <p>Departamento: {employee.department}</p>
        <p>Salário: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(employee.salary || 0)}</p>
        <div className="pt-2">
          <span className={`inline-block px-2 py-1 rounded text-xs ${
            employee.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {employee.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
    </div>
  );
}
