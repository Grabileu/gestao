import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Receipt, Clock, AlertCircle, Banknote } from "lucide-react";

export default function Home() {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.list()
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.entities.Store.list()
  });

  const { data: cashBreaks = [] } = useQuery({
    queryKey: ["cash-breaks"],
    queryFn: () => api.entities.CashBreak.list()
  });

  const activeEmployees = employees.filter(e => e.status === "active");
  const cashiers = employees.filter(e => e.is_cashier);
  const activeStores = stores.filter(s => s.status === "active");

  const totalShortage = cashBreaks
    .filter(c => c.type === "shortage")
    .reduce((sum, c) => sum + (c.total_discount || 0), 0);

  const stats = [
    { title: "Funcionários Ativos", value: activeEmployees.length, icon: Users, color: "blue" },
    { title: "Operadores de Caixa", value: cashiers.length, icon: Receipt, color: "green" },
    { title: "Lojas Ativas", value: activeStores.length, icon: Store, color: "purple" },
    { title: "Total Quebras (Descontos)", value: `R$ ${totalShortage.toFixed(2)}`, icon: AlertCircle, color: "red" },
  ];

  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    red: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Bem-vindo ao GUF System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Últimas Quebras de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            {cashBreaks.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-white">{item.employee_name}</p>
                  <p className="text-sm text-slate-400">{item.store_name}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${item.type === "shortage" ? "text-red-400" : "text-green-400"}`}>
                    R$ {(item.total_discount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">{item.type === "shortage" ? "Falta" : "Sobra"}</p>
                </div>
              </div>
            ))}
            {cashBreaks.length === 0 && (
              <p className="text-slate-400 text-center py-4">Nenhuma quebra registrada</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Funcionários Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.slice(0, 5).map((emp, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-white">{emp.full_name}</p>
                  <p className="text-sm text-slate-400">{emp.position}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${emp.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {emp.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
            ))}
            {employees.length === 0 && (
              <p className="text-slate-400 text-center py-4">Nenhum funcionário cadastrado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}