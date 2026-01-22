import { useState } from "react";
import { base44 } from "@/api/base44SupabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Building2, Plus, MoreVertical, Pencil, Trash2, Users, Wallet, Loader2 } from "lucide-react";
import DepartmentForm from "@/components/departments/DepartmentForm";

export default function Departments() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list()
  });

  const { data: employees = [], isLoading: loadingEmps } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list()
  });

  const isLoading = loadingDepts || loadingEmps;

  const handleOpenForm = (dept = null) => {
    setEditingDepartment(dept);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    handleCloseForm();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.Department.delete(deleteId);
    setDeleteId(null);
    setDeleting(false);
    queryClient.invalidateQueries({ queryKey: ['departments'] });
  };

  const getDepartmentStats = (deptId) => {
    const deptEmployees = employees.filter(e => String(e.department_id) === String(deptId) && e.status === 'active');
    const totalSalary = deptEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
    return {
      count: deptEmployees.length,
      salary: totalSalary
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Departamentos</h1>
            <p className="text-slate-400 mt-1">Gerencie os departamentos da empresa</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Departamento
          </Button>
        </div>

        {/* Departments Grid */}
        {departments.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="py-16 text-center">
              <Building2 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum departamento cadastrado</h3>
              <p className="text-slate-400 mb-6">Comece criando o primeiro departamento da empresa.</p>
              <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar Departamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const stats = getDepartmentStats(dept.id);
              return (
                <Card key={dept.id} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                          <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{dept.name}</CardTitle>
                          <Badge className={dept.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}>
                            {dept.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem onClick={() => handleOpenForm(dept)} className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(dept.id)} className="text-rose-400 hover:bg-slate-700 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dept.description && (
                      <p className="text-slate-400 text-sm line-clamp-2">{dept.description}</p>
                    )}
                    
                    {dept.manager && (
                      <div className="text-sm">
                        <span className="text-slate-500">Gerente:</span>
                        <span className="text-slate-300 ml-2">{dept.manager}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold">{stats.count}</span>
                        <span className="text-slate-400 text-sm">funcionários</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-semibold text-sm">
                          R$ {stats.salary.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Form Modal */}
        <DepartmentForm 
          open={showForm}
          onClose={handleCloseForm}
          department={editingDepartment}
          onSave={handleSave}
        />

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Tem certeza que deseja excluir este departamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-rose-600 hover:bg-rose-700">
                {deleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}