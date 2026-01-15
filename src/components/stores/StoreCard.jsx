import { Store, MapPin, Users, Wallet } from "lucide-react";

export default function StoreCard({ store, employeeCount, totalBudget, onEdit, onDelete }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Store className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{store.name}</h3>
            <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {store.city}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit?.(store)} className="text-blue-400 hover:text-blue-300 text-sm">
            Editar
          </button>
          <button onClick={() => onDelete?.(store.id)} className="text-red-400 hover:text-red-300 text-sm">
            Deletar
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
        <div>
          <p className="text-slate-400 text-xs">Operadores Ativos</p>
          <p className="text-xl font-bold text-white flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-blue-400" />
            {employeeCount}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Orçamento</p>
          <p className="text-xl font-bold text-white flex items-center gap-2 mt-1">
            <Wallet className="w-4 h-4 text-green-400" />
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalBudget)}
          </p>
        </div>
      </div>
    </div>
  );
}
