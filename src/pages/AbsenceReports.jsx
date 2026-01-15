import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Calendar, Users } from "lucide-react";
import moment from "moment";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];
const typeLabels = { absence: "Falta", medical_certificate: "Atestado", justified: "Justificada" };

export default function AbsenceReports() {
  const [filters, setFilters] = useState({
    month: moment().format("YYYY-MM"),
    type: "all"
  });

  const { data: absences = [] } = useQuery({
    queryKey: ["absences"],
    queryFn: () => api.entities.Absence.list("-date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.list()
  });

  const filteredAbsences = absences.filter(a => {
    const monthMatch = !filters.month || a.month_reference === filters.month;
    const typeMatch = filters.type === "all" || a.type === filters.type;
    return monthMatch && typeMatch;
  });

  // Stats
  const totalAbsences = filteredAbsences.filter(a => a.type === "absence").length;
  const totalCertificates = filteredAbsences.filter(a => a.type === "medical_certificate").length;
  const totalJustified = filteredAbsences.filter(a => a.type === "justified").length;
  const totalDays = filteredAbsences.reduce((sum, a) => sum + (a.days_off || 1), 0);

  // By type chart
  const typeData = [
    { name: "Faltas", value: totalAbsences },
    { name: "Atestados", value: totalCertificates },
    { name: "Justificadas", value: totalJustified }
  ].filter(d => d.value > 0);

  // By employee
  const employeeSummary = {};
  filteredAbsences.forEach(a => {
    if (!employeeSummary[a.employee_name]) {
      employeeSummary[a.employee_name] = { name: a.employee_name, absences: 0, certificates: 0, justified: 0, days: 0 };
    }
    if (a.type === "absence") employeeSummary[a.employee_name].absences += 1;
    if (a.type === "medical_certificate") employeeSummary[a.employee_name].certificates += 1;
    if (a.type === "justified") employeeSummary[a.employee_name].justified += 1;
    employeeSummary[a.employee_name].days += a.days_off || 1;
  });
  const employeeData = Object.values(employeeSummary).sort((a, b) => b.days - a.days);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatório de Faltas e Atestados</h1>
        <p className="text-slate-400">Análise de ausências dos funcionários</p>
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
            <div className="w-[180px]">
              <Select value={filters.type} onValueChange={(v) => setFilters(p => ({ ...p, type: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="absence">Faltas</SelectItem>
                  <SelectItem value="medical_certificate">Atestados</SelectItem>
                  <SelectItem value="justified">Justificadas</SelectItem>
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
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Faltas</p>
              <p className="text-xl font-bold text-white">{totalAbsences}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Atestados</p>
              <p className="text-xl font-bold text-white">{totalCertificates}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Dias</p>
              <p className="text-xl font-bold text-white">{totalDays}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Funcionários</p>
              <p className="text-xl font-bold text-white">{employeeData.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {typeData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Dias de Ausência por Funcionário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeData.slice(0, 8)} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                  <Bar dataKey="days" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Resumo por Funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Funcionário</TableHead>
                  <TableHead className="text-slate-300">Faltas</TableHead>
                  <TableHead className="text-slate-300">Atestados</TableHead>
                  <TableHead className="text-slate-300">Justificadas</TableHead>
                  <TableHead className="text-slate-300">Total Dias</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">Nenhum registro encontrado</TableCell></TableRow>
                ) : (
                  employeeData.map((emp, index) => (
                    <TableRow key={index} className="border-slate-700">
                      <TableCell className="text-white font-medium">{emp.name}</TableCell>
                      <TableCell><Badge className="bg-red-500/20 text-red-400">{emp.absences}</Badge></TableCell>
                      <TableCell><Badge className="bg-yellow-500/20 text-yellow-400">{emp.certificates}</Badge></TableCell>
                      <TableCell><Badge className="bg-blue-500/20 text-blue-400">{emp.justified}</Badge></TableCell>
                      <TableCell className="text-white font-bold">{emp.days}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
