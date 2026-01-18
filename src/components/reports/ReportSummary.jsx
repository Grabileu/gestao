import { Card, CardContent } from "@/components/ui/card";
import { Users, Wallet, Building2, TrendingUp } from "lucide-react";

export default function ReportSummary({ employees }) {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

  const stats = [
    {
      icon: Users,
      label: "Total Funcionários",
      value: totalEmployees,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: TrendingUp,
      label: "Ativos",
      value: activeEmployees,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20"
    },
    {
      icon: Wallet,
      label: "Folha Total",
      value: `R$ ${totalSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      icon: Building2,
      label: "Média Salarial",
      value: `R$ ${avgSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20"
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
                <p className="text-white font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}