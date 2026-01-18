import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  on_leave: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  terminated: "bg-rose-500/20 text-rose-400 border-rose-500/30"
};

const statusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  on_leave: "Afastado",
  terminated: "Desligado"
};

const contractLabels = {
  clt: "CLT",
  pj: "PJ",
  temporary: "Temporário",
  intern: "Estagiário",
  casual: "Avulso"
};

export default function EmployeeTable({ employees, onEdit, onView, onRefresh }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.Employee.delete(deleteId);
    setDeleteId(null);
    setDeleting(false);
    onRefresh();
  };

  return (
    <>
      <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              <TableHead className="text-slate-400">Funcionário</TableHead>
              <TableHead className="text-slate-400">Departamento</TableHead>
              <TableHead className="text-slate-400">Cargo</TableHead>
              <TableHead className="text-slate-400">Contrato</TableHead>
              <TableHead className="text-slate-400">Admissão</TableHead>
              <TableHead className="text-slate-400">Salário</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  Nenhum funcionário encontrado
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="border-slate-700/50 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-600">
                        <AvatarImage src={employee.photo_url} />
                        <AvatarFallback className="bg-blue-500/20 text-blue-400 text-sm">
                          {employee.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{employee.full_name}</p>
                        <p className="text-slate-400 text-sm">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{employee.department_name || "-"}</TableCell>
                  <TableCell className="text-slate-300">{employee.position}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {contractLabels[employee.contract_type] || employee.contract_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {employee.hire_date && employee.hire_date.split('T')[0].split('-').reverse().join('/')}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {employee.salary ? `R$ ${employee.salary.toLocaleString('pt-BR')}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[employee.status]}>
                      {statusLabels[employee.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem onClick={() => onView(employee)} className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(employee)} className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(employee.id)} className="text-rose-400 hover:bg-slate-700 cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
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
    </>
  );
}