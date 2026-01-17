import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Calendar, FileText, AlertCircle } from "lucide-react";
import AbsenceForm from "@/components/absences/AbsenceForm";
import AbsenceTable from "@/components/absences/AbsenceTable";

export default function Absences() {
  const [showForm, setShowForm] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [deleteAbsence, setDeleteAbsence] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    month: ""
  });

  const queryClient = useQueryClient();

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ["absences"],
    queryFn: () => base44.entities.Absence.list("-date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Absence.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      setDeleteAbsence(null);
    }
  });

  const handleEdit = (absence) => {
    setEditingAbsence(absence);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAbsence(null);
  };

  const filteredAbsences = absences.filter(a => {
    const searchMatch = !filters.search || 
      a.employee_name?.toLowerCase().includes(filters.search.toLowerCase());
    const typeMatch = filters.type === "all" || a.type === filters.type;
    const monthMatch = !filters.month || a.month_reference === filters.month;
    return searchMatch && typeMatch && monthMatch;
  });

  // Stats
  const totalAbsences = absences.filter(a => a.type === "absence").length;
  const totalCertificates = absences.filter(a => a.type === "medical_certificate").length;
  const totalJustified = absences.filter(a => a.type === "justified").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Faltas e Atestados</h1>
          <p className="text-slate-400">Gerencie faltas e atestados dos funcionários</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Falta/Atestado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por funcionário..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <Select value={filters.type} onValueChange={(v) => setFilters(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-600 text-white">
                  <SelectItem value="all" className="text-white hover:bg-slate-800 cursor-pointer">Todos os tipos</SelectItem>
                  <SelectItem value="absence" className="text-white hover:bg-slate-800 cursor-pointer">Falta</SelectItem>
                  <SelectItem value="medical_certificate" className="text-white hover:bg-slate-800 cursor-pointer">Atestado</SelectItem>
                  <SelectItem value="justified" className="text-white hover:bg-slate-800 cursor-pointer">Justificada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <AbsenceTable
        absences={filteredAbsences}
        onEdit={handleEdit}
        onDelete={setDeleteAbsence}
      />

      {/* Form Dialog */}
      <AbsenceForm
        open={showForm}
        onClose={handleCloseForm}
        absence={editingAbsence}
        employees={employees}
        onSave={() => queryClient.invalidateQueries({ queryKey: ["absences"] })}
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
              onClick={() => deleteMutation.mutate(deleteAbsence.id)}
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