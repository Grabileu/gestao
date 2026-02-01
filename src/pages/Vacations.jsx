import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44SupabaseClient";
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
import { Plus, Search, Eye, Trash2, Umbrella, Calendar, AlertCircle, X, Edit } from "lucide-react";
import moment from "moment";
import DatePickerInput from "@/components/vacations/DatePickerInput";

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
  const [searchEmployee, setSearchEmployee] = useState("");
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const employeeTriggerRef = useRef(null);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(256);
  const dateToRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    date_from: "",
    date_to: ""
  });
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    status: "all",
    date_from: "",
    date_to: ""
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [clearKey, setClearKey] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 31;

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

  // Ordenar funcionários alfabeticamente e filtrar ativos
  const sortedEmployees = employees
    .filter(e => e.status === "active")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Filtrar por busca
  const filteredEmployees = sortedEmployees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  useEffect(() => {
    if (!showEmployeeList) return;

    const updateMaxHeight = () => {
      if (!employeeTriggerRef.current) return;
      const rect = employeeTriggerRef.current.getBoundingClientRect();
      const padding = 64;
      const available = window.innerHeight - rect.bottom - padding;
      const maxHeight = Math.min(256, Math.max(0, available));
      setDropdownMaxHeight(maxHeight);
    };

    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, [showEmployeeList]);

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
    status: "scheduled",
    observations: ""
  });

  const selectedEmployee = employees.find(e => String(e.id) === String(form.employee_id));

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vacation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setDeleteVacation(null);
    }
  });

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => String(e.id) === String(employeeId));
    if (employee) {
      const now = moment();
      const hireDate = moment(employee.hire_date);
      const acqStartBase = hireDate.clone().year(now.year());
      const acqStartMoment = acqStartBase.isAfter(now) ? acqStartBase.clone().subtract(1, "year") : acqStartBase;
      const acqEndMoment = acqStartMoment.clone().add(1, "year").subtract(1, "day");
      const concEndMoment = acqStartMoment.clone().add(2, "years").subtract(1, "day");

      const acqStart = acqStartMoment.format("YYYY-MM-DD");
      const acqEnd = acqEndMoment.format("YYYY-MM-DD");
      const concEnd = concEndMoment.format("YYYY-MM-DD");
      
      setForm(prev => ({
        ...prev,
        employee_id: employeeId,
        employee_name: employee.full_name,
        acquisition_period_start: acqStart,
        acquisition_period_end: acqEnd,
        concession_period_end: concEnd,
        days_entitled: config.vacation_days_per_year
      }));
      setShowEmployeeList(false);
      setSearchEmployee("");
    }
  };

  const calculateVacationPay = () => {
    const employee = employees.find(e => e.id === form.employee_id);
    if (!employee) return null;

    const dailyRate = (employee.salary || 0) / 30;
    const daysToTake = form.days_entitled - (form.days_sold || 0);
    const vacationPay = dailyRate * daysToTake;
    const vacationBonus = config.vacation_bonus_enabled ? vacationPay / 3 : 0;
    const soldDaysPay = dailyRate * (form.days_sold || 0) * (config.vacation_bonus_enabled ? 4/3 : 1);
    const totalPay = vacationPay + vacationBonus + soldDaysPay;

    return {
      vacation_pay: vacationPay,
      vacation_bonus: vacationBonus,
      sold_days_pay: soldDaysPay,
      total_pay: totalPay
    };
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
    const pay = calculateVacationPay();
    try {
      const dataToSave = pay ? { ...form, ...pay } : form;
      if (pay) {
        setForm(prev => ({ ...prev, ...pay }));
      }
      await base44.entities.Vacation.create(dataToSave);
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      setShowForm(false);
      setForm({
        employee_id: "", employee_name: "", acquisition_period_start: "", acquisition_period_end: "",
        concession_period_end: "", days_entitled: 30, days_taken: 0, days_sold: 0, start_date: "",
        end_date: "", return_date: "", vacation_pay: 0, vacation_bonus: 0, sold_days_pay: 0,
        total_pay: 0, status: "scheduled", observations: ""
      });
    } catch (err) {
      console.error("Erro ao salvar férias:", err);
      alert("Erro ao salvar férias: " + (err?.message || "Verifique os campos obrigatórios e tente novamente."));
    }
  };

  const filteredVacations = hasSearched
    ? vacations.filter(v => {
      const matchesSearch = !filters.search || v.employee_name?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "all" || v.status === filters.status;
      const matchesDateFrom = !filters.date_from || (v.start_date && new Date(v.start_date) >= new Date(filters.date_from));
      const matchesDateTo = !filters.date_to || (v.start_date && new Date(v.start_date) <= new Date(filters.date_to));
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    })
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredVacations.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedVacations = filteredVacations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (!hasSearched) {
      setPage(1);
      return;
    }
    setPage((p) => Math.min(p, totalPages));
  }, [filteredVacations.length, hasSearched, totalPages]);

  const formatCurrency = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const getVacationPaySummary = (vacation) => {
    if (vacation?.total_pay && vacation.total_pay > 0) {
      return {
        vacation_pay: vacation.vacation_pay || 0,
        vacation_bonus: vacation.vacation_bonus || 0,
        sold_days_pay: vacation.sold_days_pay || 0,
        total_pay: vacation.total_pay
      };
    }

    const employee = employees.find(e => String(e.id) === String(vacation.employee_id));
    if (!employee) {
      return { vacation_pay: 0, vacation_bonus: 0, sold_days_pay: 0, total_pay: 0 };
    }

    const dailyRate = (employee.salary || 0) / 30;
    const daysToTake = (vacation.days_entitled || 0) - (vacation.days_sold || 0);
    const vacationPay = dailyRate * daysToTake;
    const vacationBonus = config.vacation_bonus_enabled ? vacationPay / 3 : 0;
    const soldDaysPay = dailyRate * (vacation.days_sold || 0) * (config.vacation_bonus_enabled ? 4/3 : 1);
    const totalPay = vacationPay + vacationBonus + soldDaysPay;

    return {
      vacation_pay: vacationPay,
      vacation_bonus: vacationBonus,
      sold_days_pay: soldDaysPay,
      total_pay: totalPay
    };
  };

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

      {/* Filtros */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Busca por Funcionário */}
            <div className="md:col-span-2 flex flex-col space-y-2">
              <span className="text-slate-400 text-xs mb-1 ml-1">Funcionário</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={pendingFilters.search}
                  onChange={(e) => setPendingFilters(p => ({ ...p, search: e.target.value }))}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Data Início */}
            <div className="flex flex-col space-y-2">
              <span className="text-slate-400 text-xs mb-1 ml-1">Data Inicial</span>
              <DatePickerInput
                key={`date-from-${clearKey}`}
                value={pendingFilters.date_from}
                onChange={(val) => setPendingFilters(p => ({ ...p, date_from: val }))}
                onEnter={() => {
                  // Inserir data atual ao pressionar Enter
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");
                  setPendingFilters(p => ({ ...p, date_from: `${year}-${month}-${day}` }));
                  // Focar no campo de data final após selecionar
                  setTimeout(() => {
                    dateToRef.current?.querySelector('input')?.focus();
                  }, 100);
                }}
                onDateSelected={() => {
                  // Focar no campo de data final após selecionar data inicial
                  setTimeout(() => {
                    dateToRef.current?.querySelector('input')?.focus();
                  }, 100);
                }}
              />
            </div>

            {/* Data Fim */}
            <div className="flex flex-col space-y-2" ref={dateToRef}>
              <span className="text-slate-400 text-xs mb-1 ml-1">Data Final</span>
              <DatePickerInput
                key={`date-to-${clearKey}`}
                value={pendingFilters.date_to}
                onChange={(val) => setPendingFilters(p => ({ ...p, date_to: val }))}
                onEnter={() => {
                  // Inserir data atual ao pressionar Enter
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");
                  setPendingFilters(p => ({ ...p, date_to: `${year}-${month}-${day}` }));
                  document.activeElement?.blur();
                }}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col space-y-2">
              <span className="text-slate-400 text-xs mb-1 ml-1">Status</span>
              <Select value={pendingFilters.status} onValueChange={(v) => setPendingFilters(p => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white cursor-pointer">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="all" className="focus:bg-slate-700">Todos os Status</SelectItem>
                  <SelectItem value="scheduled" className="focus:bg-slate-700">Agendada</SelectItem>
                  <SelectItem value="in_progress" className="focus:bg-slate-700">Em Gozo</SelectItem>
                  <SelectItem value="completed" className="focus:bg-slate-700">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão Limpar */}
          <div className="flex justify-end gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              type="button"
              onClick={() => {
                setHasSearched(true);
                setPage(1);
                setFilters({
                  search: pendingFilters.search,
                  status: pendingFilters.status,
                  date_from: pendingFilters.date_from,
                  date_to: pendingFilters.date_to
                });
              }}
            >
              Pesquisar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const cleared = { search: "", status: "all", date_from: "", date_to: "" };
                setPendingFilters(cleared);
                setClearKey((k) => k + 1);
              }}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {hasSearched && (
        <div className="text-sm text-slate-400 mb-4">
          {filteredVacations.length} férias {filteredVacations.length === 1 ? "encontrada" : "encontradas"}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Funcionário</TableHead>
              <TableHead className="text-slate-300">Dias de Férias</TableHead>
              <TableHead className="text-slate-300">Dias Vendidos</TableHead>
              <TableHead className="text-slate-300 text-center">Início - Fim</TableHead>
              <TableHead className="text-slate-300">Valor</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVacations.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">{hasSearched ? "Nenhuma férias registrada" : ""}</TableCell></TableRow>
            ) : (
              paginatedVacations.map((vacation) => (
                <TableRow key={vacation.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">{vacation.employee_name}</TableCell>
                  <TableCell className="text-slate-300">{vacation.days_entitled - (vacation.days_sold || 0)} dias</TableCell>
                  <TableCell className="text-slate-300">{vacation.days_sold || 0} dias</TableCell>
                  <TableCell className="text-slate-300 text-center">
                    {vacation.start_date
                      ? `${moment(vacation.start_date).format("DD/MM/YYYY")} - ${vacation.end_date ? moment(vacation.end_date).format("DD/MM/YYYY") : "-"}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-green-400 font-bold">
                    {formatCurrency(getVacationPaySummary(vacation).total_pay)}
                  </TableCell>
                  <TableCell><Badge className={statusLabels[vacation.status]?.color}>{statusLabels[vacation.status]?.label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setViewVacation(vacation)} className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {vacation.status !== "completed" && (
                        <Button size="icon" variant="ghost" onClick={() => {
                          setForm({
                            ...vacation,
                            employee_id: vacation.employee_id || "",
                            employee_name: vacation.employee_name || ""
                          });
                          setShowForm(true);
                        }} className="text-slate-400 hover:text-blue-400">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
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

      {hasSearched && filteredVacations.length > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Página {currentPage} de {totalPages} • {filteredVacations.length} ocorrências
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Form */}
      <Dialog open={showForm} onOpenChange={() => {
        setShowForm(false);
        setSearchEmployee("");
        setShowEmployeeList(false);
      }}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Programar Férias</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target?.tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label className="text-slate-300 mb-2 block">Funcionário *</Label>
              <div className="relative">
                {/* Input que mostra selecionado */}
                <button
                  type="button"
                  onClick={() => setShowEmployeeList(!showEmployeeList)}
                  ref={employeeTriggerRef}
                  className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-white text-left flex items-center justify-between hover:border-slate-500"
                >
                  <span className={form.employee_name ? "text-white" : "text-slate-400"}>
                    {form.employee_name || "Selecione um funcionário"}
                  </span>
                  {form.employee_name && (
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm(prev => ({ ...prev, employee_id: "", employee_name: "" }));
                        setSearchEmployee("");
                      }}
                    />
                  )}
                </button>

                {/* Dropdown com busca */}
                {showEmployeeList && (
                  <div className="absolute top-full left-0 right-0 mt-2 -translate-y-4 transform bg-slate-800 border border-slate-600 rounded-md z-50 shadow-lg">
                    <div className="p-2 border-b border-slate-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          autoFocus
                          type="text"
                          placeholder="Pesquisar funcionário..."
                          value={searchEmployee}
                          onChange={(e) => setSearchEmployee(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white pl-10"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: `${dropdownMaxHeight}px` }}>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(emp => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => handleEmployeeChange(String(emp.id))}
                            className="w-full text-left px-3 py-2 hover:bg-slate-700 text-white text-sm whitespace-nowrap"
                          >
                            {emp.full_name}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          Nenhum funcionário encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pr-4">
              {form.employee_id && (
                <>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Data de Admissão</Label>
                    <p className="text-white">{selectedEmployee?.hire_date ? moment(selectedEmployee.hire_date).format("DD/MM/YYYY") : "-"}</p>
                  </div>
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
                    <Input
                      type="number"
                      max={10}
                      value={form.days_sold === 0 ? "" : form.days_sold}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setForm(prev => {
                          const daysSold = parseInt(e.target.value) || 0;
                          const updated = { ...prev, days_sold: daysSold };
                          if (updated.start_date && updated.days_entitled) {
                            const daysToTake = updated.days_entitled - (updated.days_sold || 0);
                            updated.end_date = moment(updated.start_date).add(daysToTake - 1, "days").format("YYYY-MM-DD");
                            updated.return_date = moment(updated.start_date).add(daysToTake, "days").format("YYYY-MM-DD");
                            updated.days_taken = daysToTake;
                          }
                          return updated;
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-500">Máximo 10 dias</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Data Início *</Label>
                    <DatePickerInput
                      value={form.start_date || ""}
                      onChange={(val) => handleDatesChange("start_date", val)}
                      onEnter={() => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(2, "0");
                        const day = String(today.getDate()).padStart(2, "0");
                        handleDatesChange("start_date", `${year}-${month}-${day}`);
                      }}
                    />
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
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white cursor-pointer"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white z-50">
                      <SelectItem value="scheduled" className="focus:bg-slate-700 hover:bg-slate-700">Agendada</SelectItem>
                      <SelectItem value="in_progress" className="focus:bg-slate-700 hover:bg-slate-700">Em Gozo</SelectItem>
                      <SelectItem value="completed" className="focus:bg-slate-700 hover:bg-slate-700">Concluída</SelectItem>
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
                <Button type="button" variant="outline" size="default" onClick={() => setShowForm(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancelar</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar</Button>
              </div>
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
              {(() => {
                const pay = getVacationPaySummary(viewVacation);
                return (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Férias ({viewVacation.days_entitled - (viewVacation.days_sold || 0)} dias)</span>
                  <span className="text-white">{formatCurrency(pay.vacation_pay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">1/3 Constitucional</span>
                  <span className="text-white">{formatCurrency(pay.vacation_bonus)}</span>
                </div>
                {viewVacation.days_sold > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">Abono Pecuniário ({viewVacation.days_sold} dias)</span>
                    <span className="text-white">{formatCurrency(pay.sold_days_pay)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-green-500/20 pt-2">
                  <span className="text-green-400">Total</span>
                  <span className="text-green-400">{formatCurrency(pay.total_pay)}</span>
                </div>
              </div>
                );
              })()}
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