import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default function CashBreakStats({ cashBreaks }) {
  // Desconsidera comprovantes entregues
  const contabilizados = cashBreaks.filter(c => c.voucher_status !== 'delivered');
  const shortages = contabilizados.filter(c => c.type === 'shortage');
  const surpluses = contabilizados.filter(c => c.type === 'surplus');
  const pending = contabilizados.filter(c => c.voucher_status === 'not_delivered' || c.voucher_status === 'pending');

  const totalShortage = shortages.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalSurplus = surpluses.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalPending = pending.reduce((sum, c) => sum + (c.amount || 0), 0);
  const balance = totalSurplus - totalShortage;

  const stats = [
    {
      icon: TrendingDown,
      label: "Total Faltas",
      value: `R$ ${totalShortage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      count: `${shortages.length} ocorrência(s)`,
      color: "text-rose-400",
      bgColor: "bg-rose-500/20"
    },
    {
      icon: TrendingUp,
      label: "Total Sobras",
      value: `R$ ${totalSurplus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      count: `${surpluses.length} ocorrência(s)`,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20"
    },
    {
      icon: AlertCircle,
      label: "Vales Pendentes",
      value: `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      count: `${pending.length} vale(s)`,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20"
    },
    {
      icon: CheckCircle,
      label: "Saldo",
      value: `R$ ${Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      count: balance >= 0 ? "Positivo" : "Negativo",
      color: balance >= 0 ? "text-emerald-400" : "text-rose-400",
      bgColor: balance >= 0 ? "bg-emerald-500/20" : "bg-rose-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className={`font-bold text-lg ${stat.color}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}