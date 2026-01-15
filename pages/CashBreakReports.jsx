import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Filter } from "lucide-react";
import moment from "moment";

const paymentTypeLabels = {
  cash: "Dinheiro",
  credit: "Crédito",
  debit: "Débito",
  subsidy: "Subsídio",
  food_voucher: "Alimentação",
  pos: "POS",
  customer_credit: "Cliente a Prazo",
  pix: "Pix"
};

export default function CashBreakReport() {
  const [filters, setFilters] = useState({
    startDate: moment().startOf("month").format("YYYY-MM-DD"),
    endDate: moment().endOf("month").format("YYYY-MM-DD"),
    store_id: "all",
    employee_id: "all",
    payment_type: "all"
  });

  const { data: cashBreaks = [] } = useQuery({
    queryKey: ["cash-breaks"],
    queryFn: () => api.entities.CashBreak.list("-date")
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.entities.Store.list()
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.list()
  });

  const cashiers = employees.filter(e => e.is_cashier);

  const filteredData = cashBreaks.filter(b => {
    const dateMatch = (!filters.startDate || b.date >= filters.startDate) && 
                      (!filters.endDate || b.date <= filters.endDate);
    const storeMatch = filters.store_id === "all" || b.store_id === filters.store_id;
    const empMatch = filters.employee_id === "all" || b.employee_id === filters.employee_id;
    const typeMatch = filters.payment_type === "all" || b.payment_type === filters.payment_type;
    return dateMatch && storeMatch && empMatch && typeMatch;
  });

  const totals = filteredData.reduce((acc, b) => {
    if (b.type === "shortage") {
      acc.totalShortage += b.amount || 0;
      acc.totalDiscount += b.total_discount || 0;
    } else {
      acc.totalSurplus += b.amount || 0;
    }
    return acc;
  }, { totalShortage: 0, totalSurplus: 0, totalDiscount: 0 });

  const formatCurrency = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Quebras de Caixa - GUF System</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            h1 { text-align: center; margin-bottom: 5px; font-size: 16px; }
            .subtitle { text-align: center; color: #666; margin-bottom: 15px; font-size: 10px; }
            .filters { background: #f5f5f5; padding: 10px; margin-bottom: 15px; border-radius: 4px; }
            .filters span { margin-right: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            .shortage { color: #dc2626; }
            .surplus { color: #16a34a; }
            .totals { background: #f5f5f5; padding: 10px; border-radius: 4px; }
            .totals div { margin-bottom: 5px; }
            .total-label { font-weight: bold; }
            @media print { 
              body { padding: 10px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>GUF System - Relatório de Quebras de Caixa</h1>
          <p class="subtitle">Período: ${moment(filters.startDate).format("DD/MM/YYYY")} a ${moment(filters.endDate).format("DD/MM/YYYY")}</p>
          
          <div class="filters">
            <span><strong>Registros:</strong> ${filteredData.length}</span>
            ${filters.store_id !== "all" ? `<span><strong>Loja:</strong> ${stores.find(s => s.id === filters.store_id)?.name}</span>` : ""}
            ${filters.employee_id !== "all" ? `<span><strong>Operador:</strong> ${employees.find(e => e.id === filters.employee_id)?.full_name}</span>` : ""}
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Operador</th>
                <th>Loja</th>
                <th>Finalizadora</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Desconto</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(b => `
                <tr>
                  <td>${moment(b.date).format("DD/MM/YYYY")}</td>
                  <td>${b.employee_name || "-"}</td>
                  <td>${b.store_name || "-"}</td>
                  <td>${paymentTypeLabels[b.payment_type] || b.payment_type}</td>
                  <td class="${b.type === "shortage" ? "shortage" : "surplus"}">${b.type === "shortage" ? "Falta" : "Sobra"}</td>
                  <td>${formatCurrency(b.amount)}</td>
                  <td class="shortage">${formatCurrency(b.total_discount)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="totals">
            <div><span class="total-label">Total de Faltas:</span> <span class="shortage">${formatCurrency(totals.totalShortage)}</span></div>
            <div><span class="total-label">Total de Sobras:</span> <span class="surplus">${formatCurrency(totals.totalSurplus)}</span></div>
            <div><span class="total-label">Total de Descontos:</span> <span class="shortage">${formatCurrency(totals.totalDiscount)}</span></div>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatório de Quebras de Caixa</h1>
          <p className="text-slate-400">Análise detalhada de faltas e sobras</p>
        </div>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" />Imprimir Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-slate-300">Data Início</Label>
              <Input 
                type="date" 
                value={filters.startDate} 
                onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))} 
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Data Fim</Label>
              <Input 
                type="date" 
                value={filters.endDate} 
                onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))} 
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Loja</Label>
              <Select value={filters.store_id} onValueChange={(v) => setFilters(p => ({ ...p, store_id: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Operador</Label>
              <Select value={filters.employee_id} onValueChange={(v) => setFilters(p => ({ ...p, employee_id: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {cashiers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Finalizadora</Label>
              <Select value={filters.payment_type} onValueChange={(v) => setFilters(p => ({ ...p, payment_type: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(paymentTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-red-400 text-sm">Total de Faltas</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(totals.totalShortage)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-green-400 text-sm">Total de Sobras</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totals.totalSurplus)}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <p className="text-yellow-400 text-sm">Total Descontos</p>
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totals.totalDiscount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Data</TableHead>
                <TableHead className="text-slate-300">Operador</TableHead>
                <TableHead className="text-slate-300">Loja</TableHead>
                <TableHead className="text-slate-300">Finalizadora</TableHead>
                <TableHead className="text-slate-300">Tipo</TableHead>
                <TableHead className="text-slate-300">Valor</TableHead>
                <TableHead className="text-slate-300">Desconto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((b) => (
                  <TableRow key={b.id} className="border-slate-700">
                    <TableCell className="text-white">{moment(b.date).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className="text-white">{b.employee_name}</TableCell>
                    <TableCell className="text-slate-300">{b.store_name}</TableCell>
                    <TableCell className="text-slate-300">{paymentTypeLabels[b.payment_type]}</TableCell>
                    <TableCell>
                      <Badge className={b.type === "shortage" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}>
                        {b.type === "shortage" ? "Falta" : "Sobra"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">{formatCurrency(b.amount)}</TableCell>
                    <TableCell className="text-red-400 font-bold">{formatCurrency(b.total_discount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}