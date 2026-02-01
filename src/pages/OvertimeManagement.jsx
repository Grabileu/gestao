import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44SupabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Clock } from "lucide-react";
import OvertimeForm from "@/components/overtime/OvertimeForm";
import OvertimeTable from "@/components/overtime/OvertimeTable";
import DatePickerInput from "@/components/vacations/DatePickerInput";

export default function OvertimeManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingOvertime, setEditingOvertime] = useState(null);
  const [deleteOvertime, setDeleteOvertime] = useState(null);
  const dateToRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    dateFrom: "",
    dateTo: ""
  });
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    type: "all",
    dateFrom: "",
    dateTo: ""
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [clearKey, setClearKey] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 31;

  const queryClient = useQueryClient();

  const { data: overtimes = [] } = useQuery({
    queryKey: ["overtimes"],
    queryFn: () => base44.entities.Overtime.list("-date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Overtime.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtimes"] });
      setDeleteOvertime(null);
    }
  });

  const handleEdit = (overtime) => {
    setEditingOvertime(overtime);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOvertime(null);
  };

  const normalizedType = filters.type === "all" ? "" : filters.type;

  const filteredOvertimes = hasSearched
    ? overtimes.filter(o => {
      const searchMatch = !filters.search || 
        o.employee_name?.toLowerCase().includes(filters.search.toLowerCase());
      const typeMatch = !normalizedType || o.type === normalizedType;
      const dateFromMatch = !filters.dateFrom || moment(o.date).isSameOrAfter(filters.dateFrom);
      const dateToMatch = !filters.dateTo || moment(o.date).isSameOrBefore(filters.dateTo);
      return searchMatch && typeMatch && dateFromMatch && dateToMatch;
    }).sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredOvertimes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOvertimes = filteredOvertimes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (!hasSearched) {
      setPage(1);
      return;
    }
    setPage((p) => Math.min(p, totalPages));
  }, [filteredOvertimes.length, hasSearched, totalPages]);

  // Stats
  const total50 = overtimes.filter(o => o.type === "50").reduce((sum, o) => sum + (o.hours || 0), 0);
  const total100 = overtimes.filter(o => o.type === "100").reduce((sum, o) => sum + (o.hours || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Horas Extras</h1>
          <p className="text-slate-400">Gerencie as horas extras dos funcionários</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Hora Extra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Horas 50%</p>
              <p className="text-2xl font-bold text-white">{total50}h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Horas 100%</p>
              <p className="text-2xl font-bold text-white">{total100}h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Busca */}
              <div className="w-[250px]">
                <label className="text-xs text-slate-500 mb-1 block">Funcionário</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por funcionário..."
                    value={pendingFilters.search}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 bg-slate-900 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-slate-500 ml-1">Data Inicial</label>
                <DatePickerInput
                  key={`date-from-${clearKey}`}
                  value={pendingFilters.dateFrom || ''}
                  onChange={(val) => setPendingFilters(prev => ({ ...prev, dateFrom: val }))}
                  onEnter={() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, "0");
                    const day = String(today.getDate()).padStart(2, "0");
                    setPendingFilters(p => ({ ...p, dateFrom: `${year}-${month}-${day}` }));
                    setTimeout(() => {
                      dateToRef.current?.querySelector('input')?.focus();
                    }, 100);
                  }}
                  onDateSelected={() => {
                    setTimeout(() => {
                      dateToRef.current?.querySelector('input')?.focus();
                    }, 100);
                  }}
                />
              </div>
              <div className="flex flex-col space-y-1" ref={dateToRef}>
                <label className="text-xs text-slate-500 ml-1">Data Final</label>
                <DatePickerInput
                  key={`date-to-${clearKey}`}
                  value={pendingFilters.dateTo || ''}
                  onChange={(val) => setPendingFilters(prev => ({ ...prev, dateTo: val }))}
                  onEnter={() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, "0");
                    const day = String(today.getDate()).padStart(2, "0");
                    setPendingFilters(p => ({ ...p, dateTo: `${year}-${month}-${day}` }));
                  }}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-slate-500 ml-1">Tipo</label>
                <Select value={pendingFilters.type || "all"} onValueChange={(v) => setPendingFilters(prev => ({ ...prev, type: v === "all" ? "" : v }))}>
                  <SelectTrigger className="w-[180px] bg-slate-900 border-slate-600 text-white">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-600 text-white">
                    <SelectItem value="all" className="text-white hover:bg-slate-800 cursor-pointer">Todos os tipos</SelectItem>
                    <SelectItem value="50" className="text-white hover:bg-slate-800 cursor-pointer">50%</SelectItem>
                    <SelectItem value="100" className="text-white hover:bg-slate-800 cursor-pointer">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end w-full">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                type="button"
                onClick={() => {
                  setHasSearched(true);
                  setPage(1);
                  setFilters({
                    search: pendingFilters.search,
                    type: pendingFilters.type || "all",
                    dateFrom: pendingFilters.dateFrom,
                    dateTo: pendingFilters.dateTo
                  });
                }}
              >
                Pesquisar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const cleared = { search: '', type: 'all', dateFrom: '', dateTo: '' };
                  setPendingFilters(cleared);
                  setClearKey((k) => k + 1);
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <span className="flex items-center"><svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>Limpar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <OvertimeTable
        overtimes={paginatedOvertimes}
        onEdit={handleEdit}
        onDelete={setDeleteOvertime}
        hasSearched={hasSearched}
      />

      {hasSearched && filteredOvertimes.length > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Página {currentPage} de {totalPages} • {filteredOvertimes.length} ocorrências
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

      {/* Form Dialog */}
      <OvertimeForm
        open={showForm}
        onClose={handleCloseForm}
        overtime={editingOvertime}
        employees={employees}
        onSave={() => queryClient.invalidateQueries({ queryKey: ["overtimes"] })}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteOvertime} onOpenChange={() => setDeleteOvertime(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Deseja realmente excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteOvertime.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}