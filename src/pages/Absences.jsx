import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44SupabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Calendar, FileText, AlertCircle } from "lucide-react";
import AbsenceForm from "@/components/absences/AbsenceForm";
import AbsenceTable from "@/components/absences/AbsenceTable";
import DatePickerInput from "@/components/vacations/DatePickerInput";

export default function Absences() {
  const [showForm, setShowForm] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [deleteAbsence, setDeleteAbsence] = useState(null);
  const dateToRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    month: "",
    dateFrom: "",
    dateTo: "",
    store: "all"
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    type: "all",
    month: "",
    dateFrom: "",
    dateTo: "",
    store: "all"
  });
  const [clearKey, setClearKey] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 31;

  const queryClient = useQueryClient();

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ["absences"],
    queryFn: async () => {
      const data = await base44.entities.Absence.list("-date");
      console.log("Absências carregadas do servidor:", data);
      return data;
    }
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => base44.entities.Store.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Absence.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      setDeleteAbsence(null);
    }
  });

  const handleEdit = (absence) => {
    // Extrai o ID original removendo o sufixo _1, _2, etc
    const editData = {
      ...absence,
      id: absence.id.split('_')[0]
    };
    setEditingAbsence(editData);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAbsence(null);
  };

  // Expande registros de atestados/faltas para cada dia de afastamento
  const expandedAbsences = absences.flatMap(a => {
    // Se for mais de um dia, cria um registro para cada dia, cada um com id único
    if (a.days_off && a.days_off > 1) {
      return Array.from({ length: a.days_off }, (_, i) => ({
        ...a,
        date: moment(a.date).add(i, 'days').format('YYYY-MM-DD'),
        original_date: a.date,
        day_index: i + 1,
        id: `${a.id}_${i+1}` // id único para cada dia
      }));
    }
    return [{ ...a, id: `${a.id}_1` }]; // também garante id único para registros de 1 dia
  });

  const normalizedType = filters.type === "all" ? "" : filters.type;

  const filteredAbsences = hasSearched
    ? expandedAbsences.filter(a => {
    const searchMatch = !filters.search || 
      a.employee_name?.toLowerCase().includes(filters.search.toLowerCase());
    const typeMatch = !normalizedType || a.type === normalizedType;
    
    // Filtro de loja: pega o store_id do employee relacionado
    const employee = employees.find(e => e.id === a.employee_id);
    const storeMatch = filters.store === "all" || (employee && String(employee.store_id) === String(filters.store));
    
    const monthMatch = !filters.month || moment(a.date).format('YYYY-MM') === moment(filters.month, 'YYYY-MM').format('YYYY-MM');
    const dateFromMatch = !filters.dateFrom || moment(a.date).isSameOrAfter(filters.dateFrom);
    const dateToMatch = !filters.dateTo || moment(a.date).isSameOrBefore(filters.dateTo);
    
    const match = searchMatch && typeMatch && storeMatch && monthMatch && dateFromMatch && dateToMatch;
    
    if (!match && a.employee_name) {
      console.log(`Falta filtrada: ${a.employee_name} - Search: ${searchMatch} - Type: ${typeMatch} - Store: ${storeMatch} - Month: ${monthMatch} - DateFrom: ${dateFromMatch} - DateTo: ${dateToMatch}`);
    }
    
    return match;
  }).sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredAbsences.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedAbsences = filteredAbsences.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (!hasSearched) {
      setPage(1);
      return;
    }
    setPage((p) => Math.min(p, totalPages));
  }, [filteredAbsences.length, hasSearched, totalPages]);

  console.log("Absências expandidas:", expandedAbsences.length);
  console.log("Absências filtradas:", filteredAbsences.length);
  console.log("Filtros atuais:", filters);

  // Stats
  const totalAbsences = absences.filter(a => a.type === "absence").length;
  const totalCertificates = absences.filter(a => a.type === "medical_certificate").length;
  const totalJustified = absences.filter(a => a.type === "justified").length;
  const totalDelays = absences.filter(a => a.type === "delay").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Faltas e Atestados</h1>
          <p className="text-slate-400">Gerencie faltas e atestados dos funcionários</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Falta/Atestado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Faltas</p>
              <p className="text-2xl font-bold text-white">{totalAbsences}</p>
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
              <p className="text-2xl font-bold text-white">{totalCertificates}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Atrasos</p>
              <p className="text-2xl font-bold text-white">{totalDelays}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Justificadas</p>
              <p className="text-2xl font-bold text-white">{totalJustified}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            {/* Busca por funcionário */}
            <div className="flex-1 min-w-50">
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
            {/* Data Inicial */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs text-slate-500 mb-1 ml-1">Data Inicial</label>
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
            {/* Data Final */}
            <div className="flex flex-col space-y-2" ref={dateToRef}>
              <label className="text-xs text-slate-500 mb-1 ml-1">Data Final</label>
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
            {/* Tipo */}
            <div className="w-45">
              <label className="text-xs text-slate-500 mb-1 block">Tipo</label>
              <Select
                value={pendingFilters.type || "all"}
                onValueChange={(v) => setPendingFilters(prev => ({ ...prev, type: v === "all" ? "" : v }))}
              >
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-600 text-white">
                  <SelectItem value="all" className="text-white hover:bg-slate-800 cursor-pointer">Todos os tipos</SelectItem>
                  <SelectItem value="absence" className="text-white hover:bg-slate-800 cursor-pointer">Falta</SelectItem>
                  <SelectItem value="medical_certificate" className="text-white hover:bg-slate-800 cursor-pointer">Atestado</SelectItem>
                  <SelectItem value="justified" className="text-white hover:bg-slate-800 cursor-pointer">Justificada</SelectItem>
                  <SelectItem value="delay" className="text-white hover:bg-slate-800 cursor-pointer">Atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Loja */}
            <div className="w-45">
              <label className="text-xs text-slate-500 mb-1 block">Loja</label>
              <Select value={pendingFilters.store} onValueChange={(v) => setPendingFilters(prev => ({ ...prev, store: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Loja" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-600 text-white">
                  <SelectItem value="all" className="text-white hover:bg-slate-800 cursor-pointer">Todas as lojas</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id} className="text-white hover:bg-slate-800 cursor-pointer">
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Botão Limpar */}
            <div className="flex-1 flex justify-end min-w-40 gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                type="button"
                onClick={() => {
                  setHasSearched(true);
                  setPage(1);
                  setFilters({
                    search: pendingFilters.search,
                    type: pendingFilters.type || "all",
                    month: "",
                    dateFrom: pendingFilters.dateFrom,
                    dateTo: pendingFilters.dateTo,
                    store: pendingFilters.store
                  });
                }}
              >
                Pesquisar
              </Button>
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
                onClick={() => {
                  const cleared = { search: '', type: 'all', month: '', dateFrom: '', dateTo: '', store: 'all' };
                  setPendingFilters(cleared);
                  setClearKey((k) => k + 1);
                }}
                type="button"
              >
                <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Limpar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <AbsenceTable
        absences={paginatedAbsences}
        onEdit={handleEdit}
        onDelete={setDeleteAbsence}
        hasSearched={hasSearched}
      />

      {hasSearched && filteredAbsences.length > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Página {currentPage} de {totalPages} • {filteredAbsences.length} ocorrências
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
      <AbsenceForm
        open={showForm}
        onClose={handleCloseForm}
        absence={editingAbsence}
        employees={employees}
        onSave={(saved) => {
          if (saved) {
            queryClient.setQueryData(["absences"], (old = []) => {
              const exists = old.some(a => String(a.id) === String(saved.id));
              if (exists) {
                return old.map(a => (String(a.id) === String(saved.id) ? saved : a));
              }
              return [saved, ...old];
            });
          }
          console.log("Salvou! Recarregando absências...");
          queryClient.invalidateQueries({ queryKey: ["absences"] });
        }}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteAbsence} onOpenChange={() => setDeleteAbsence(null)}>
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
              onClick={() => {
                // Extrai o ID original removendo o sufixo _1, _2, etc
                const originalId = deleteAbsence.id.split('_')[0];
                console.log("Deletando ID original:", originalId, "de:", deleteAbsence.id);
                deleteMutation.mutate(originalId);
              }}
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