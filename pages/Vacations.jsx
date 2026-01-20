import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
import { Plus, Search, Eye, Trash2, Umbrella, Calendar, AlertCircle, Loader2 } from "lucide-react";
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
    queryFn: () => base44.entities.Vacation.list("-created_date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["payroll-config"],
    queryFn: () => base44.entities.PayrollConfig.list()
  });

  const config = configs[0] || { vacation_days_per_year: 30, vacation_bonus_enabled: true };

  const [form, setForm] = useState({
    employee_id: "",
    employee_name: "",
    acquisition_period_start: "",
    acquisition_period_end: "",
    concession_period_end: "",
    days_entitled: 30,
    days_taken: 30,
    start_date: "",
    end_date: "",
    return_date: "",
    vacation_pay: 0,
    vacation_bonus: 0,
    total_pay: 0,
    status: "pending",
    observations: ""
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vacation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setDeleteVacation(null);
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Vacation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setShowForm(false);
      setForm({
        employee_id: "", employee_name: "", acquisition_period_start: "", acquisition_period_end: "",
        concession_period_end: "", days_entitled: 30, days_taken: 30, start_date: "",
        end_date: "", return_date: "", vacation_pay: 0, vacation_bonus: 0,
        total_pay: 0, status: "pending", observations: ""
      });
    }
  });

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => String(e.id) === String(employeeId));
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

  const calculateVacationPay = (formData) => {
    const employee = employees.find(e => String(e.id) === String(formData.employee_id));
    if (!employee) return formData;

    const salary = employee.salary || 0;
    const dailyRate = salary / 30;
    const daysToTake = formData.days_taken || 30;
    const vacationPay = dailyRate * daysToTake;
    const vacationBonus = config.vacation_bonus_enabled ? salary / 3 : 0;
    const totalPay = vacationPay + vacationBonus;

    return {
      ...formData,
      vacation_pay: Number(vacationPay.toFixed(2)),
      vacation_bonus: Number(vacationBonus.toFixed(2)),
      total_pay: Number(totalPay.toFixed(2))
    };
  };

  const handleDatesChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "start_date" && value && updated.days_taken) {
        const endDate = moment(value).add(updated.days_taken - 1, "days").format("YYYY-MM-DD");
        const returnDate = moment(value).add(updated.days_taken, "days").format("YYYY-MM-DD");
        updated.end_date = endDate;
        updated.return_date = returnDate;
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalData = calculateVacationPay(form);
    saveMutation.mutate(finalData);
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
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                  <TableCell className="text-slate-300">{vacation.days_taken || vacation.days_entitled} dias</TableCell>
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
              <Select value={String(form.employee_id)} onValueChange={handleEmployeeChange}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  {employees.filter(e => e.status === "active").map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)} className="text-white hover:bg-slate-700 cursor-pointer">{emp.full_name}</SelectItem>
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
                    <Input type="number" value={form.days_entitled} readOnly className="bg-slate-800 border-slate-600 text-slate-400" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Dias de Férias *</Label>
                    <Input type="number" min={1} max={30} value={form.days_taken} onChange={(e) => setForm(p => ({ ...p, days_taken: parseInt(e.target.value) || 30 }))} className="bg-slate-800 border-slate-600 text-white" />
                    <p className="text-xs text-slate-500">Quantos dias vai tirar de férias</p>
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
                    <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                      <SelectItem value="pending" className="text-white hover:bg-slate-700 cursor-pointer">Pendente</SelectItem>
                      <SelectItem value="scheduled" className="text-white hover:bg-slate-700 cursor-pointer">Agendada</SelectItem>
                      <SelectItem value="in_progress" className="text-white hover:bg-slate-700 cursor-pointer">Em Gozo</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-slate-700 cursor-pointer">Concluída</SelectItem>
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending || !form.employee_id || !form.start_date} className="bg-blue-600 hover:bg-blue-700">
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
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
                  <span className="text-slate-300">Férias ({viewVacation.days_taken || viewVacation.days_entitled} dias)</span>
                  <span className="text-white">{formatCurrency(viewVacation.vacation_pay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">1/3 Constitucional</span>
                  <span className="text-white">{formatCurrency(viewVacation.vacation_bonus)}</span>
                </div>
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
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteVacation.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}