import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PayrollTable({ data, isLoading, onView, onDelete }) {
  if (isLoading) {
    return <div className="text-center py-8 text-white">Carregando...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-slate-400">Nenhuma folha de pagamento</div>;
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-white font-semibold border-b border-slate-700">Funcionário</th>
            <th className="px-4 py-3 text-left text-white font-semibold border-b border-slate-700">Período</th>
            <th className="px-4 py-3 text-left text-white font-semibold border-b border-slate-700">Salário Base</th>
            <th className="px-4 py-3 text-left text-white font-semibold border-b border-slate-700">Líquido</th>
            <th className="px-4 py-3 text-left text-white font-semibold border-b border-slate-700">Status</th>
            <th className="px-4 py-3 text-left text-white font-semibold border-b border-slate-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((payroll) => (
            <tr key={payroll.id} className="border-b border-slate-700 hover:bg-slate-800/30">
              <td className="px-4 py-3 text-slate-200">{payroll.employee_name}</td>
              <td className="px-4 py-3 text-slate-200">{payroll.month_reference}</td>
              <td className="px-4 py-3 text-green-400">{formatCurrency(payroll.base_salary)}</td>
              <td className="px-4 py-3 text-blue-400 font-semibold">{formatCurrency(payroll.net_salary)}</td>
              <td className="px-4 py-3">
                <Badge variant={payroll.status === "approved" ? "success" : "warning"}>
                  {payroll.status === "approved" ? "Aprovada" : "Pendente"}
                </Badge>
              </td>
              <td className="px-4 py-3 space-x-2">
                <button onClick={() => onView?.(payroll)} className="text-blue-400 hover:text-blue-300 text-sm">
                  Ver
                </button>
                <button onClick={() => onDelete?.(payroll.id)} className="text-red-400 hover:text-red-300 text-sm">
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
