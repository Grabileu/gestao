import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Trash2, Umbrella, Calendar, AlertCircle } from "lucide-react";
import moment from "moment";

const statusLabels = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  scheduled: { label: "Agendada", color: "bg-blue-500/20 text-blue-400" },
  in_progress: { label: "Em Gozo", color: "bg-green-500/20 text-green-400" },
  completed: { label: "Concluída", color: "bg-slate-500/20 text-slate-400" },
  cancelled: { label: "Cancelada", color: "bg-red-500/20 text-red-400" }
};

export default function Vacations() {
  const [showForm, setShowForm] = useState(false);
  const [viewVacation, setViewVacation] = useState(null);
  const [deleteVacation, setDeleteVacation] = useState(null);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const { data: vacations = [] } = useQuery({
    queryKey: ["vacations"],
    queryFn: () => api.entities.Vacation.list("-created_date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.list()
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["payroll-config"],
    queryFn: () => api.entities.PayrollConfig.list()
  });

  const config = configs[0] || { vacation_days_per_year: 30, vacation_bonus_enabled: true };

  const [form, setForm] = useState({
    employee_id: "",
    employee_name: "",
    acquisition_period_start: "",
    acquisition_period_end: "",
    concession_period_end: "",
    days_entitled: 30,
    days_taken: 0,
    days_sold: 0,
    start_date: "",
    end_date: "",
    return_date: "",
    vacation_pay: 0,
    vacation_bonus: 0,
    sold_days_pay: 0,
    total_pay: 0,
    status: "pending",
    observations: ""
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Vacation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setDeleteVacation(null);
    }
  });

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const hireDate = moment(employee.hire_date);
      const acqStart = hireDate.format("YYYY-MM-DD");
      const acqEnd = hireDate.clone().add(1, "year").subtract(1, "day").format("YYYY-MM-DD");
      const concEnd = hireDate.clone().add(2, "years").subtract(1, "day").format("YYYY-MM-DD");
      
      setForm(prev => ({
        ...prev,
        employee_id: employeeId,
        employee_name: employee.full_name,
        acquisition_period_start: acqStart,
        acquisition_period_end: acqEnd,
        concession_period_end: concEnd,
        days_entitled: config.vacation_days_per_year
      }));
    }
  };

  const calculateVacationPay = () => {
    const employee = employees.find(e => e.id === form.employee_id);
    if (!employee) return;

    const dailyRate = (employee.salary || 0) / 30;
    const daysToTake = form.days_entitled - (form.days_sold || 0);
    const vacationPay = dailyRate * daysToTake;
    const vacationBonus = config.vacation_bonus_enabled ? vacationPay / 3 : 0;
    const soldDaysPay = dailyRate * (form.days_sold || 0) * (config.vacation_bonus_enabled ? 4/3 : 1);
    const totalPay = vacationPay + vacationBonus + soldDaysPay;

    setForm(prev => ({
      ...prev,
      vacation_pay: vacationPay,
      vacation_bonus: vacationBonus,
      sold_days_pay: soldDaysPay,
      total_pay: totalPay
    }));
  };

  const handleDatesChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "start_date" && value && updated.days_entitled) {
        const daysToTake = updated.days_entitled - (updated.days_sold || 0);
        const endDate = moment(value).add(daysToTake - 1, "days").format("YYYY-MM-DD");
        const returnDate = moment(value).add(daysToTake, "days").format("YYYY-MM-DD");
        updated.end_date = endDate;
        updated.return_date = returnDate;
        updated.days_taken = daysToTake;
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    calculateVacationPay();
    await api.entities.Vacation.create(form);
    queryClient.invalidateQueries({ queryKey: ["vacations"] });
    setShowForm(false);
    setForm({
      employee_id: "", employee_name: "", acquisition_period_start: "", acquisition_period_end: "",
      concession_period_end: "", days_entitled: 30, days_taken: 0, days_sold: 0, start_date: "",
      end_date: "", return_date: "", vacation_pay: 0, vacation_bonus: 0, sold_days_pay: 0,
      total_pay: 0, status: "pending", observations: ""
    });
  };

  const filteredVacations = vacations.filter(v =>
    v.employee_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  // Stats
  const pending = vacations.filter(v => v.status === "pending").length;
  const scheduled = vacations.filter(v => v.status === "scheduled").length;
  const inProgress = vacations.filter(v => v.status === "in_progress").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Férias</h1>
          <p className="text-slate-400">Gerencie as férias dos funcionários</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Programar Férias
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg"><AlertCircle className="h-6 w-6 text-yellow-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-white">{pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg"><Calendar className="h-6 w-6 text-blue-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Agendadas</p>
              <p className="text-2xl font-bold text-white">{scheduled}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg"><Umbrella className="h-6 w-6 text-green-400" /></div>
            <div>
              <p className="text-slate-400 text-sm">Em Gozo</p>
              <p className="text-2xl font-bold text-white">{inProgress}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar funcionário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Funcionário</TableHead>
              <TableHead className="text-slate-300">Período Aquisitivo</TableHead>
              <TableHead className="text-slate-300">Dias</TableHead>
              <TableHead className="text-slate-300">Início</TableHead>
              <TableHead className="text-slate-300">Valor</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVacations.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">Nenhuma férias registrada</TableCell></TableRow>
            ) : (
              filteredVacations.map((vacation) => (
                <TableRow key={vacation.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">{vacation.employee_name}</TableCell>
                  <TableCell className="text-slate-300">
                    {moment(vacation.acquisition_period_start).format("DD/MM/YY")} - {moment(vacation.acquisition_period_end).format("DD/MM/YY")}
                  </TableCell>
                  <TableCell className="text-slate-300">{vacation.days_entitled - (vacation.days_sold || 0)} dias</TableCell>
                  <TableCell className="text-slate-300">{vacation.start_date ? moment(vacation.start_date).format("DD/MM/YYYY") : "-"}</TableCell>
                  <TableCell className="text-green-400 font-bold">{formatCurrency(vacation.total_pay)}</TableCell>
                  <TableCell><Badge className={statusLabels[vacation.status]?.color}>{statusLabels[vacation.status]?.label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setViewVacation(vacation)} className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteVacation(vacation)} className="text-slate-400 hover:text-red-400">
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

      {/* Form */}
      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Programar Férias</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-slate-300">Funcionário *</Label>
              <Select value={form.employee_id} onValueChange={handleEmployeeChange}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === "active").map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.employee_id && (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Período Aquisitivo</Label>
                    <p className="text-white">{moment(form.acquisition_period_start).format("DD/MM/YYYY")} - {moment(form.acquisition_period_end).format("DD/MM/YYYY")}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Limite Concessivo</Label>
                    <p className="text-white">{moment(form.concession_period_end).format("DD/MM/YYYY")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Dias de Direito</Label>
                    <Input type="number" value={form.days_entitled} onChange={(e) => setForm(p => ({ ...p, days_entitled: parseInt(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Dias Vendidos (Abono)</Label>
                    <Input type="number" max={10} value={form.days_sold} onChange={(e) => setForm(p => ({ ...p, days_sold: parseInt(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" />
                    <p className="text-xs text-slate-500">Máximo 10 dias</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Data Início *</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => handleDatesChange("start_date", e.target.value)} className="bg-slate-800 border-slate-600 text-white" required />
                  </div>
                  <div>
                    <Label className="text-slate-300">Data Fim</Label>
                    <Input type="date" value={form.end_date} readOnly className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Retorno</Label>
                    <Input type="date" value={form.return_date} readOnly className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="in_progress">Em Gozo</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Observações</Label>
                  <Textarea value={form.observations} onChange={(e) => setForm(p => ({ ...p, observations: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-600">Cancelar</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={!!viewVacation} onOpenChange={() => setViewVacation(null)}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes das Férias</DialogTitle>
          </DialogHeader>
          {viewVacation && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm">Funcionário</p>
                <p className="text-white font-bold text-lg">{viewVacation.employee_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">Início</p>
                  <p className="text-white">{viewVacation.start_date ? moment(viewVacation.start_date).format("DD/MM/YYYY") : "-"}</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">Retorno</p>
                  <p className="text-white">{viewVacation.return_date ? moment(viewVacation.return_date).format("DD/MM/YYYY") : "-"}</p>
                </div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Férias ({viewVacation.days_entitled - (viewVacation.days_sold || 0)} dias)</span>
                  <span className="text-white">{formatCurrency(viewVacation.vacation_pay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">1/3 Constitucional</span>
                  <span className="text-white">{formatCurrency(viewVacation.vacation_bonus)}</span>
                </div>
                {viewVacation.days_sold > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">Abono Pecuniário ({viewVacation.days_sold} dias)</span>
                    <span className="text-white">{formatCurrency(viewVacation.sold_days_pay)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-green-500/20 pt-2">
                  <span className="text-green-400">Total</span>
                  <span className="text-green-400">{formatCurrency(viewVacation.total_pay)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteVacation} onOpenChange={() => setDeleteVacation(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir este registro de férias?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteVacation.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}