import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileSpreadsheet, Store, User, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import CashBreakFilters from "@/components/cashbreaks/CashBreakFilters";
import CashBreakStats from "@/components/cashbreaks/CashBreakStats";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#4361ee', '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b', '#06d6a0', '#118ab2'];

export default function CashBreakReports() {
  const [filters, setFilters] = useState({
    store: "all",
    cashier: "all",
    type: "all",
    status: "all",
    date_from: "",
    date_to: ""
  });

  const { data: cashBreaks = [], isLoading: loadingBreaks } = useQuery({
    queryKey: ['cashBreaks'],
    queryFn: () => base44.entities.CashBreak.list('-date')
  });

  const { data: stores = [], isLoading: loadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list()
  });

  const { data: cashiers = [], isLoading: loadingCashiers } = useQuery({
    queryKey: ['cashiers'],
    queryFn: () => base44.entities.Cashier.list()
  });

  const isLoading = loadingBreaks || loadingStores || loadingCashiers;

  const filteredBreaks = cashBreaks.filter(item => {
    const matchesStore = filters.store === "all" || item.store_id === filters.store;
    const matchesCashier = filters.cashier === "all" || item.cashier_id === filters.cashier;
    const matchesType = filters.type === "all" || item.type === filters.type;
    const matchesStatus = filters.status === "all" || item.voucher_status === filters.status;
    
    const matchesDateFrom = !filters.date_from || 
      (item.date && new Date(item.date) >= new Date(filters.date_from));
    
    const matchesDateTo = !filters.date_to || 
      (item.date && new Date(item.date) <= new Date(filters.date_to));

    return matchesStore && matchesCashier && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Dados por loja
  const storeData = stores.map(store => {
    const storeBreaks = filteredBreaks.filter(b => b.store_id === store.id);
    const shortages = storeBreaks.filter(b => b.type === 'shortage');
    const surpluses = storeBreaks.filter(b => b.type === 'surplus');
    return {
      name: store.code || store.name?.substring(0, 10),
      faltas: shortages.reduce((sum, b) => sum + (b.amount || 0), 0),
      sobras: surpluses.reduce((sum, b) => sum + (b.amount || 0), 0),
      total: storeBreaks.length
    };
  }).filter(d => d.total > 0);

  // Dados por operador
  const cashierData = cashiers.map(cashier => {
    const cashierBreaks = filteredBreaks.filter(b => b.cashier_id === cashier.id);
    const shortages = cashierBreaks.filter(b => b.type === 'shortage');
    return {
      name: cashier.name,
      store: cashier.store_name,
      count: cashierBreaks.length,
      shortageAmount: shortages.reduce((sum, b) => sum + (b.amount || 0), 0),
      shortageCount: shortages.length
    };
  }).filter(d => d.count > 0).sort((a, b) => b.shortageAmount - a.shortageAmount);

  // Dados para pie chart por tipo
  const typeData = [
    { name: 'Faltas', value: filteredBreaks.filter(b => b.type === 'shortage').reduce((sum, b) => sum + (b.amount || 0), 0) },
    { name: 'Sobras', value: filteredBreaks.filter(b => b.type === 'surplus').reduce((sum, b) => sum + (b.amount || 0), 0) }
  ].filter(d => d.value > 0);

  const handleClearFilters = () => {
    setFilters({
      store: "all",
      cashier: "all",
      type: "all",
      status: "all",
      date_from: "",
      date_to: ""
    });
  };

  const handleExport = () => {
    const headers = [
      "Data", "Loja", "Operador", "Turno", "Tipo", "Valor", "Vale", "Status", "Motivo"
    ];

    const typeLabels = { shortage: "Falta", surplus: "Sobra" };
    const statusLabels = { pending: "Pendente", paid: "Pago", cancelled: "Cancelado" };
    const shiftLabels = { morning: "Manhã", afternoon: "Tarde", night: "Noite" };

    const rows = filteredBreaks.map(b => [
      b.date || "",
      b.store_name || "",
      b.cashier_name || "",
      shiftLabels[b.shift] || "",
      typeLabels[b.type] || "",
      b.amount || 0,
      b.voucher_number || "",
      statusLabels[b.voucher_status] || "",
      b.reason || ""
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_quebras_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <FileSpreadsheet className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Relatórios de Quebras</h1>
            <p className="text-slate-400 mt-1">Análise detalhada por loja e operador</p>
          </div>
        </div>

        {/* Filters */}
        <CashBreakFilters 
          filters={filters}
          onChange={setFilters}
          stores={stores}
          cashiers={cashiers}
          onClear={handleClearFilters}
          onExport={handleExport}
          showExport={true}
        />

        {/* Stats */}
        <CashBreakStats cashBreaks={filteredBreaks} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Por Loja */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader className="flex flex-row items-center gap-3">
              <Store className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white text-lg">Quebras por Loja</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {storeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                    />
                    <Bar dataKey="faltas" fill="#f43f5e" name="Faltas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sobras" fill="#10b981" name="Sobras" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart - Por Tipo */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader className="flex flex-row items-center gap-3">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              <CardTitle className="text-white text-lg">Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#f43f5e" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                    />
                    <Legend formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Operadores com mais quebras */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
          <CardHeader className="flex flex-row items-center gap-3">
            <User className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-white text-lg">Ranking de Operadores (Mais Quebras)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-transparent">
                  <TableHead className="text-slate-400">#</TableHead>
                  <TableHead className="text-slate-400">Operador</TableHead>
                  <TableHead className="text-slate-400">Loja</TableHead>
                  <TableHead className="text-slate-400">Ocorrências</TableHead>
                  <TableHead className="text-slate-400">Faltas</TableHead>
                  <TableHead className="text-slate-400">Total Faltas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashierData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Nenhum dado disponível
                    </TableCell>
                  </TableRow>
                ) : (
                  cashierData.slice(0, 10).map((item, index) => (
                    <TableRow key={index} className="border-slate-700/50 hover:bg-slate-800/50">
                      <TableCell className="text-white font-bold">{index + 1}</TableCell>
                      <TableCell className="text-white font-medium">{item.name}</TableCell>
                      <TableCell className="text-slate-300">{item.store || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {item.count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                          {item.shortageCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-rose-400 font-semibold">
                        R$ {item.shortageAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}