import { CheckCircle, DollarSign, Users, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DepartmentCard({ department, employeeCount, totalSalary, onEdit, onDelete }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{department.name}</h3>
            <p className="text-slate-400 text-sm mt-1">{department.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit?.(department)} className="text-blue-400 hover:text-blue-300 text-sm">
              Editar
            </button>
            <button onClick={() => onDelete?.(department.id)} className="text-red-400 hover:text-red-300 text-sm">
              Deletar
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Funcionários
            </span>
            <span className="font-semibold text-white">{employeeCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total de Salários
            </span>
            <span className="font-semibold text-green-400">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSalary)}
            </span>
          </div>
          {department.manager && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Gerente
              </span>
              <span className="font-semibold text-white">{department.manager}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
