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
import { Plus, Pencil, Trash2, Building2, Printer } from "lucide-react";

export default function Departments() {
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.entities.Department.list()
  });

  const [form, setForm] = useState({ name: "", description: "", manager: "", budget: "", status: "active" });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Department.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeleteDept(null);
    }
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { ...form, budget: parseFloat(form.budget) || 0 };
    if (editingDept?.id) {
      await api.entities.Department.update(editingDept.id, data);
    } else {
      await api.entities.Department.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ["departments"] });
    setShowForm(false);
    setEditingDept(null);
    setForm({ name: "", description: "", manager: "", budget: "", status: "active" });
  };

  const handleEdit = (dept) => {
    setForm({ ...dept, budget: dept.budget?.toString() || "" });
    setEditingDept(dept);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6 print-content">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Departamentos</h1>
          <p className="text-slate-400">Gerencie os departamentos da empresa</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} variant="outline" className="border-slate-600 text-slate-300">
            <Printer className="h-4 w-4 mr-2" />Imprimir
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />Novo Departamento
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-lg"><Building2 className="h-6 w-6 text-yellow-400" /></div>
          <div>
            <p className="text-slate-400 text-sm">Total de Departamentos</p>
            <p className="text-2xl font-bold text-white">{departments.length}</p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Nome</TableHead>
              <TableHead className="text-slate-300">Descrição</TableHead>
              <TableHead className="text-slate-300">Gerente</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">Nenhum departamento</TableCell></TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">{dept.name}</TableCell>
                  <TableCell className="text-slate-300">{dept.description || "-"}</TableCell>
                  <TableCell className="text-slate-300">{dept.manager || "-"}</TableCell>
                  <TableCell>
                    <Badge className={dept.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {dept.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(dept)} className="text-slate-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteDept(dept)} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditingDept(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingDept ? "Editar Departamento" : "Novo Departamento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-slate-300">Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
            </div>
            <div>
              <Label className="text-slate-300">Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Gerente</Label>
              <Input value={form.manager} onChange={(e) => setForm(p => ({ ...p, manager: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-600">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDept} onOpenChange={() => setDeleteDept(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir o departamento "{deleteDept?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteDept.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}