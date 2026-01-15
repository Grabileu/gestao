import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Receipt, Building2, TrendingDown, TrendingUp, Calendar, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function Dashboard() {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.list()
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.entities.Store.list()
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.entities.Department.list()
  });

  const { data: cashBreaks = [] } = useQuery({
    queryKey: ["cash-breaks"],
    queryFn: () => api.entities.CashBreak.list("-date", 100)
  });

  const activeEmployees = employees.filter(e => e.status === "active");
  const cashiers = employees.filter(e => e.is_cashier);
  
  const currentMonth = moment().format("YYYY-MM");
  const monthBreaks = cashBreaks.filter(b => b.date?.startsWith(currentMonth));
  const totalShortage = monthBreaks.filter(b => b.type === "shortage").reduce((sum, b) => sum + (b.total_discount || 0), 0);
  const totalSurplus = monthBreaks.filter(b => b.type === "surplus").reduce((sum, b) => sum + (b.amount || 0), 0);

  const formatCurrency = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  return (
    <div className="p-6 space-y-6 print-content">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Visão geral do GUF System</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="border-slate-600 text-slate-300">
          <Printer className="h-4 w-4 mr-2" />Imprimir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg"><Users className="h-6 w-6 text-blue-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Funcionários Ativos</p>
              <p className="text-2xl font-bold text-white">{activeEmployees.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg"><Receipt className="h-6 w-6 text-purple-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Operadores de Caixa</p>
              <p className="text-2xl font-bold text-white">{cashiers.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg"><Store className="h-6 w-6 text-green-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Lojas</p>
              <p className="text-2xl font-bold text-white">{stores.filter(s => s.status === "active").length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg"><Building2 className="h-6 w-6 text-yellow-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Departamentos</p>
              <p className="text-2xl font-bold text-white">{departments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quebras do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Quebras do Mês (Faltas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">{formatCurrency(totalShortage)}</p>
            <p className="text-sm text-slate-400 mt-1">{monthBreaks.filter(b => b.type === "shortage").length} ocorrências</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Sobras do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(totalSurplus)}</p>
            <p className="text-sm text-slate-400 mt-1">{monthBreaks.filter(b => b.type === "surplus").length} ocorrências</p>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Quebras */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Últimas Quebras de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cashBreaks.length === 0 ? (
            <p className="text-slate-400 text-center py-4">Nenhuma quebra registrada</p>
          ) : (
            <div className="space-y-3">
              {cashBreaks.slice(0, 5).map((brk) => (
                <div key={brk.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{brk.employee_name}</p>
                    <p className="text-sm text-slate-400">{moment(brk.date).format("DD/MM/YYYY")} - {brk.store_name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${brk.type === "shortage" ? "text-red-400" : "text-green-400"}`}>
                      {brk.type === "shortage" ? "-" : "+"}{formatCurrency(brk.total_discount || brk.amount)}
                    </p>
                    <p className="text-xs text-slate-500">{brk.type === "shortage" ? "Falta" : "Sobra"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}