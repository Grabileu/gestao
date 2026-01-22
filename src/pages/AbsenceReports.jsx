import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44SupabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Calendar, Users, Printer, Filter, X } from "lucide-react";
import moment from "moment";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];
const typeLabels = { absence: "Falta", medical_certificate: "Atestado", justified: "Justificada" };

export default function AbsenceReports() {
  const [filters, setFilters] = useState({
    month: moment().format("YYYY-MM"),
    type: "all",
    employee: "all",
    department: "all",
    dateFrom: "",
    dateTo: ""
  });

  const { data: absences = [] } = useQuery({
    queryKey: ["absences"],
    queryFn: () => base44.entities.Absence.list("-date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => base44.entities.Department.list()
  });

  const filteredAbsences = absences.filter(a => {
    const monthMatch = !filters.month || a.month_reference === filters.month;
    const typeMatch = filters.type === "all" || a.type === filters.type;
    const employeeMatch = filters.employee === "all" || a.employee_id === filters.employee;
    const emp = employees.find(e => e.id === a.employee_id);
    const deptMatch = filters.department === "all" || emp?.department_id === filters.department;
    const dateFromMatch = !filters.dateFrom || a.date >= filters.dateFrom;
    const dateToMatch = !filters.dateTo || a.date <= filters.dateTo;
    return monthMatch && typeMatch && employeeMatch && deptMatch && dateFromMatch && dateToMatch;
  });

  const clearFilters = () => {
    setFilters({
      month: "",
      type: "all",
      employee: "all",
      department: "all",
      dateFrom: "",
      dateTo: ""
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Faltas e Atestados - Sistema GUF</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; }
            .filters { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .filters h3 { font-size: 14px; margin-bottom: 10px; }
            .filters-grid { display: flex; flex-wrap: wrap; gap: 15px; font-size: 12px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 25px; }
            .stat-box { text-align: center; padding: 15px 25px; border: 1px solid #ddd; border-radius: 5px; }
            .stat-box .number { font-size: 28px; font-weight: bold; color: #333; }
            .stat-box .label { font-size: 11px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th { background: #333; color: white; padding: 10px 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
            .badge-red { background: #fee2e2; color: #dc2626; }
            .badge-yellow { background: #fef3c7; color: #d97706; }
            .badge-blue { background: #dbeafe; color: #2563eb; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sistema GUF - Relatório de Faltas e Atestados</h1>
            <p>Gerado em ${moment().format("DD/MM/YYYY [às] HH:mm")}</p>
          </div>
          
          <div class="filters">
            <h3>Filtros Aplicados:</h3>
            <div class="filters-grid">
              ${filters.month ? `<span><strong>Mês:</strong> ${moment(filters.month).format("MM/YYYY")}</span>` : ''}
              ${filters.type !== 'all' ? `<span><strong>Tipo:</strong> ${typeLabels[filters.type]}</span>` : ''}
              ${filters.employee !== 'all' ? `<span><strong>Funcionário:</strong> ${employees.find(e => e.id === filters.employee)?.full_name || '-'}</span>` : ''}
              ${filters.department !== 'all' ? `<span><strong>Departamento:</strong> ${departments.find(d => d.id === filters.department)?.name || '-'}</span>` : ''}
              ${filters.dateFrom ? `<span><strong>De:</strong> ${moment(filters.dateFrom).format("DD/MM/YYYY")}</span>` : ''}
              ${filters.dateTo ? `<span><strong>Até:</strong> ${moment(filters.dateTo).format("DD/MM/YYYY")}</span>` : ''}
            </div>
          </div>

          <div class="stats">
            <div class="stat-box">
              <div class="number">${totalAbsences}</div>
              <div class="label">FALTAS</div>
            </div>
            <div class="stat-box">
              <div class="number">${totalCertificates}</div>
              <div class="label">ATESTADOS</div>
            </div>
            <div class="stat-box">
              <div class="number">${totalJustified}</div>
              <div class="label">JUSTIFICADAS</div>
            </div>
            <div class="stat-box">
              <div class="number">${totalDays}</div>
              <div class="label">TOTAL DIAS</div>
            </div>
          </div>

          <h3 style="margin-bottom: 10px;">Resumo por Funcionário (${employeeData.length} funcionários)</h3>
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th style="text-align:center">Faltas</th>
                <th style="text-align:center">Atestados</th>
                <th style="text-align:center">Justificadas</th>
                <th style="text-align:center">Total Dias</th>
              </tr>
            </thead>
            <tbody>
              ${employeeData.map(emp => `
                <tr>
                  <td>${emp.name}</td>
                  <td style="text-align:center"><span class="badge badge-red">${emp.absences}</span></td>
                  <td style="text-align:center"><span class="badge badge-yellow">${emp.certificates}</span></td>
                  <td style="text-align:center"><span class="badge badge-blue">${emp.justified}</span></td>
                  <td style="text-align:center"><strong>${emp.days}</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h3 style="margin: 25px 0 10px;">Detalhamento (${filteredAbsences.length} registros)</h3>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Funcionário</th>
                <th>Tipo</th>
                <th>Dias</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAbsences.slice(0, 100).map(a => `
                <tr>
                  <td>${moment(a.date).format("DD/MM/YYYY")}</td>
                  <td>${a.employee_name || '-'}</td>
                  <td><span class="badge ${a.type === 'absence' ? 'badge-red' : a.type === 'medical_certificate' ? 'badge-yellow' : 'badge-blue'}">${typeLabels[a.type]}</span></td>
                  <td style="text-align:center">${a.days_off || 1}</td>
                  <td>${a.reason || '-'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            Sistema GUF - Gestão de Recursos Humanos | ${moment().format("DD/MM/YYYY HH:mm")}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

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
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300 font-medium">Filtros</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4 mr-1" />Limpar
              </Button>
              <Button onClick={handlePrint} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Printer className="h-4 w-4 mr-2" />Imprimir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Mês Referência</label>
              <Input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters(p => ({ ...p, month: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white h-9"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Tipo</label>
              <Select value={filters.type} onValueChange={(v) => setFilters(p => ({ ...p, type: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white h-9"><SelectValue /></SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                  <SelectItem value="absence" className="text-white hover:bg-slate-700 cursor-pointer">Faltas</SelectItem>
                  <SelectItem value="medical_certificate" className="text-white hover:bg-slate-700 cursor-pointer">Atestados</SelectItem>
                  <SelectItem value="justified" className="text-white hover:bg-slate-700 cursor-pointer">Justificadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Funcionário</label>
              <Select value={filters.employee} onValueChange={(v) => setFilters(p => ({ ...p, employee: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white h-9"><SelectValue /></SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)} className="text-white hover:bg-slate-700 cursor-pointer">{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Departamento</label>
              <Select value={filters.department} onValueChange={(v) => setFilters(p => ({ ...p, department: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white h-9"><SelectValue /></SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={String(dept.id)} className="text-white hover:bg-slate-700 cursor-pointer">{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Data Inicial</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(p => ({ ...p, dateFrom: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white h-9"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Data Final</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(p => ({ ...p, dateTo: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white h-9"
              />
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