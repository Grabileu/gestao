import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Clock } from "lucide-react";
import OvertimeForm from "@/components/overtime/OvertimeForm";
import OvertimeTable from "@/components/overtime/OvertimeTable";

export default function OvertimeManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingOvertime, setEditingOvertime] = useState(null);
  const [deleteOvertime, setDeleteOvertime] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    month: ""
  });

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

  const filteredOvertimes = overtimes.filter(o => {
    const searchMatch = !filters.search || 
      o.employee_name?.toLowerCase().includes(filters.search.toLowerCase());
    const typeMatch = filters.type === "all" || o.type === filters.type;
    const monthMatch = !filters.month || o.month_reference === filters.month;
    return searchMatch && typeMatch && monthMatch;
  });

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
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
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
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
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
      <OvertimeTable
        overtimes={filteredOvertimes}
        onEdit={handleEdit}
        onDelete={setDeleteOvertime}
      />

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
            <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
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