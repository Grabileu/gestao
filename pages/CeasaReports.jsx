import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, TrendingUp, Package, Users } from "lucide-react";
import moment from "moment";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CeasaReports() {
  const [filters, setFilters] = useState({
    month: moment().format("YYYY-MM"),
    supplier: "all"
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["ceasa-purchases"],
    queryFn: () => base44.entities.CeasaPurchase.list("-date")
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["ceasa-suppliers"],
    queryFn: () => base44.entities.CeasaSupplier.list()
  });

  const filteredPurchases = purchases.filter(p => {
    const monthMatch = !filters.month || p.date?.startsWith(filters.month);
    const supplierMatch = filters.supplier === "all" || p.supplier_id === filters.supplier;
    return monthMatch && supplierMatch;
  });

  // Stats
  const totalAmount = filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalPurchases = filteredPurchases.length;
  const avgPurchase = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

  // Products summary
  const productsSummary = {};
  filteredPurchases.forEach(p => {
    p.items?.forEach(item => {
      if (!productsSummary[item.product_name]) {
        productsSummary[item.product_name] = { name: item.product_name, quantity: 0, total: 0 };
      }
      productsSummary[item.product_name].quantity += item.quantity || 0;
      productsSummary[item.product_name].total += item.total_price || 0;
    });
  });
  const productsData = Object.values(productsSummary).sort((a, b) => b.total - a.total);

  // Supplier summary
  const supplierSummary = {};
  filteredPurchases.forEach(p => {
    if (!supplierSummary[p.supplier_name]) {
      supplierSummary[p.supplier_name] = { name: p.supplier_name, total: 0, count: 0 };
    }
    supplierSummary[p.supplier_name].total += p.total_amount || 0;
    supplierSummary[p.supplier_name].count += 1;
  });
  const supplierData = Object.values(supplierSummary).sort((a, b) => b.total - a.total);

  // Daily purchases for chart
  const dailyData = {};
  filteredPurchases.forEach(p => {
    const day = moment(p.date).format("DD/MM");
    if (!dailyData[day]) dailyData[day] = 0;
    dailyData[day] += p.total_amount || 0;
  });
  const chartData = Object.entries(dailyData).map(([day, total]) => ({ day, total })).slice(-15);

  const formatCurrency = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatório CEASA</h1>
        <p className="text-slate-400">Análise de compras e gastos</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-[180px]">
              <Input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters(p => ({ ...p, month: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div className="w-[200px]">
              <Select value={filters.supplier} onValueChange={(v) => setFilters(p => ({ ...p, supplier: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white"><SelectValue placeholder="Fornecedor" /></SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos fornecedores</SelectItem>
                  {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)} className="text-white hover:bg-slate-700 cursor-pointer">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Gasto</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Package className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Compras</p>
              <p className="text-xl font-bold text-white">{totalPurchases}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Média por Compra</p>
              <p className="text-xl font-bold text-white">{formatCurrency(avgPurchase)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Fornecedores</p>
              <p className="text-xl font-bold text-white">{supplierData.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Compras por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                  <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Gastos por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={supplierData.slice(0, 6)} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {supplierData.slice(0, 6).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Produtos Mais Comprados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Produto</TableHead>
                  <TableHead className="text-slate-300">Quantidade</TableHead>
                  <TableHead className="text-slate-300">Total Gasto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData.slice(0, 10).map((product, index) => (
                  <TableRow key={index} className="border-slate-700">
                    <TableCell className="text-white font-medium">{product.name}</TableCell>
                    <TableCell className="text-slate-300">{product.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-green-400 font-bold">{formatCurrency(product.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Resumo por Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Fornecedor</TableHead>
                  <TableHead className="text-slate-300">Compras</TableHead>
                  <TableHead className="text-slate-300">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierData.map((supplier, index) => (
                  <TableRow key={index} className="border-slate-700">
                    <TableCell className="text-white font-medium">{supplier.name}</TableCell>
                    <TableCell className="text-slate-300">{supplier.count}</TableCell>
                    <TableCell className="text-green-400 font-bold">{formatCurrency(supplier.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}