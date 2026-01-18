import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calculator, FileSpreadsheet, Eye, Trash2, CheckCircle, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import moment from "moment";

// INSS 2024 table
const calculateINSS = (salary) => {
  if (salary <= 1412.00) return salary * 0.075;
  if (salary <= 2666.68) return 1412 * 0.075 + (salary - 1412) * 0.09;
  if (salary <= 4000.03) return 1412 * 0.075 + (2666.68 - 1412) * 0.09 + (salary - 2666.68) * 0.12;
  if (salary <= 7786.02) return 1412 * 0.075 + (2666.68 - 1412) * 0.09 + (4000.03 - 2666.68) * 0.12 + (salary - 4000.03) * 0.14;
  return 908.85; // Teto
};

// IRRF 2024 table
const calculateIRRF = (salary, inss) => {
  const base = salary - inss;
  if (base <= 2259.20) return 0;
  if (base <= 2826.65) return base * 0.075 - 169.44;
  if (base <= 3751.05) return base * 0.15 - 381.44;
  if (base <= 4664.68) return base * 0.225 - 662.77;
  return base * 0.275 - 896.00;
};

export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState(moment().format("YYYY-MM"));
  const [generating, setGenerating] = useState(false);
  const [viewPayroll, setViewPayroll] = useState(null);
  const [deletePayroll, setDeletePayroll] = useState(null);

  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: absences = [] } = useQuery({
    queryKey: ["absences"],
    queryFn: () => base44.entities.Absence.list()
  });

  const { data: overtimes = [] } = useQuery({
    queryKey: ["overtimes"],
    queryFn: () => base44.entities.Overtime.list()
  });

  const { data: payrolls = [] } = useQuery({
    queryKey: ["payrolls"],
    queryFn: () => base44.entities.Payroll.list("-month_reference")
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["payroll-config"],
    queryFn: () => base44.entities.PayrollConfig.list()
  });

  const config = configs[0] || {
    work_hours_per_day: 8,
    work_days_per_month: 22,
    overtime_50_percent: 50,
    overtime_100_percent: 100,
    absence_discount_enabled: true,
    medical_certificate_discount: false,
    inss_enabled: true,
    irrf_enabled: true,
    vt_discount_percent: 6,
    vt_enabled: true
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Payroll.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      setDeletePayroll(null);
    }
  });

  const currentPayrolls = payrolls.filter(p => p.month_reference === selectedMonth);

  const generatePayroll = async () => {
    setGenerating(true);
    
    const activeEmployees = employees.filter(e => e.status === "active" && e.salary > 0);
    const monthAbsences = absences.filter(a => a.month_reference === selectedMonth);
    const monthOvertimes = overtimes.filter(o => o.month_reference === selectedMonth && o.status === "approved");

    const hourlyRate = (salary) => salary / (config.work_days_per_month * config.work_hours_per_day);

    for (const employee of activeEmployees) {
      // Check if already exists
      const existing = payrolls.find(p => p.employee_id === employee.id && p.month_reference === selectedMonth);
      if (existing) continue;

      const empAbsences = monthAbsences.filter(a => a.employee_id === employee.id);
      const empOvertimes = monthOvertimes.filter(o => o.employee_id === employee.id);

      // Calculate absences
      let absencesDays = 0;
      let certificateDays = 0;
      empAbsences.forEach(a => {
        if (a.type === "absence" && a.discount_salary) {
          absencesDays += a.days_off || 1;
        } else if (a.type === "medical_certificate") {
          certificateDays += a.days_off || 1;
        }
      });

      const dailyRate = employee.salary / config.work_days_per_month;
      let absencesDiscount = 0;
      if (config.absence_discount_enabled) {
        absencesDiscount = absencesDays * dailyRate;
      }
      if (config.medical_certificate_discount) {
        absencesDiscount += certificateDays * dailyRate;
      }

      // Calculate overtime
      let overtime50Hours = 0;
      let overtime100Hours = 0;
      empOvertimes.forEach(o => {
        if (o.type === "50") overtime50Hours += o.hours || 0;
        else overtime100Hours += o.hours || 0;
      });

      const hr = hourlyRate(employee.salary);
      const overtime50Value = overtime50Hours * hr * (1 + config.overtime_50_percent / 100);
      const overtime100Value = overtime100Hours * hr * (1 + config.overtime_100_percent / 100);
      const totalOvertime = overtime50Value + overtime100Value;

      // Gross salary
      const grossSalary = employee.salary + totalOvertime - absencesDiscount;

      // INSS
      const inss = config.inss_enabled ? calculateINSS(grossSalary) : 0;
      
      // IRRF
      const irrf = config.irrf_enabled ? Math.max(0, calculateIRRF(grossSalary, inss)) : 0;

      // VT
      const vtDiscount = config.vt_enabled ? employee.salary * (config.vt_discount_percent / 100) : 0;

      const totalDiscounts = absencesDiscount + inss + irrf + vtDiscount;
      const netSalary = grossSalary - inss - irrf - vtDiscount;

      await base44.entities.Payroll.create({
        employee_id: employee.id,
        employee_name: employee.full_name,
        month_reference: selectedMonth,
        base_salary: employee.salary,
        work_days: config.work_days_per_month - absencesDays,
        absences_days: absencesDays,
        absences_discount: absencesDiscount,
        medical_certificates_days: certificateDays,
        overtime_50_hours: overtime50Hours,
        overtime_50_value: overtime50Value,
        overtime_100_hours: overtime100Hours,
        overtime_100_value: overtime100Value,
        total_overtime: totalOvertime,
        inss_value: inss,
        irrf_value: irrf,
        vt_discount: vtDiscount,
        gross_salary: grossSalary,
        total_discounts: totalDiscounts,
        net_salary: netSalary,
        status: "draft"
      });
    }

    queryClient.invalidateQueries({ queryKey: ["payrolls"] });
    setGenerating(false);
  };

  // Stats
  const totalNet = currentPayrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0);
  const totalGross = currentPayrolls.reduce((sum, p) => sum + (p.gross_salary || 0), 0);
  const totalDiscounts = currentPayrolls.reduce((sum, p) => sum + (p.total_discounts || 0), 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Folha de Pagamento</h1>
          <p className="text-slate-400">Gere e gerencie as folhas de pagamento</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white w-[180px]"
          />
          <Button onClick={generatePayroll} disabled={generating} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Calculator className="h-4 w-4 mr-2" />
            {generating ? "Gerando..." : "Gerar Folha"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Bruto</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalGross)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Descontos</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalDiscounts)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Líquido</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalNet)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              <TableHead className="text-slate-300">Funcionário</TableHead>
              <TableHead className="text-slate-300">Salário Base</TableHead>
              <TableHead className="text-slate-300">Horas Extras</TableHead>
              <TableHead className="text-slate-300">Descontos</TableHead>
              <TableHead className="text-slate-300">Líquido</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPayrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  Nenhuma folha gerada para este mês
                </TableCell>
              </TableRow>
            ) : (
              currentPayrolls.map((payroll) => (
                <TableRow key={payroll.id} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell className="text-white font-medium">{payroll.employee_name}</TableCell>
                  <TableCell className="text-white">{formatCurrency(payroll.base_salary)}</TableCell>
                  <TableCell className="text-green-400">{formatCurrency(payroll.total_overtime)}</TableCell>
                  <TableCell className="text-red-400">{formatCurrency(payroll.total_discounts)}</TableCell>
                  <TableCell className="text-white font-bold">{formatCurrency(payroll.net_salary)}</TableCell>
                  <TableCell>
                    <Badge className={
                      payroll.status === "paid" ? "bg-green-500/20 text-green-400" :
                      payroll.status === "approved" ? "bg-blue-500/20 text-blue-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }>
                      {payroll.status === "paid" ? "Pago" : payroll.status === "approved" ? "Aprovado" : "Rascunho"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setViewPayroll(payroll)} className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeletePayroll(payroll)} className="text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewPayroll} onOpenChange={() => setViewPayroll(null)}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes da Folha - {viewPayroll?.employee_name}</DialogTitle>
          </DialogHeader>
          {viewPayroll && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">Mês Referência</p>
                  <p className="text-white font-bold">{moment(viewPayroll.month_reference).format("MM/YYYY")}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">Salário Base</p>
                  <p className="text-white font-bold">{formatCurrency(viewPayroll.base_salary)}</p>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-3">Proventos</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Salário Base</span>
                    <span className="text-white">{formatCurrency(viewPayroll.base_salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Horas Extras 50% ({viewPayroll.overtime_50_hours}h)</span>
                    <span className="text-white">{formatCurrency(viewPayroll.overtime_50_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Horas Extras 100% ({viewPayroll.overtime_100_hours}h)</span>
                    <span className="text-white">{formatCurrency(viewPayroll.overtime_100_value)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-green-500/20 pt-2 mt-2">
                    <span className="text-green-400">Total Bruto</span>
                    <span className="text-green-400">{formatCurrency(viewPayroll.gross_salary)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h3 className="text-red-400 font-semibold mb-3">Descontos</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Faltas ({viewPayroll.absences_days} dias)</span>
                    <span className="text-white">{formatCurrency(viewPayroll.absences_discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">INSS</span>
                    <span className="text-white">{formatCurrency(viewPayroll.inss_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">IRRF</span>
                    <span className="text-white">{formatCurrency(viewPayroll.irrf_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Vale Transporte</span>
                    <span className="text-white">{formatCurrency(viewPayroll.vt_discount)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-red-500/20 pt-2 mt-2">
                    <span className="text-red-400">Total Descontos</span>
                    <span className="text-red-400">{formatCurrency(viewPayroll.total_discounts)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 font-semibold text-lg">Salário Líquido</span>
                  <span className="text-blue-400 font-bold text-2xl">{formatCurrency(viewPayroll.net_salary)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletePayroll} onOpenChange={() => setDeletePayroll(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Deseja realmente excluir esta folha de pagamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deletePayroll.id)} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}