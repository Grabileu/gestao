import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Store, Printer } from "lucide-react";

export default function StoreSettings() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [deleteStore, setDeleteStore] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", address: "", city: "", state: "", manager: "", status: "active" });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.entities.Store.list()
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingStore?.id) {
      await api.entities.Store.update(editingStore.id, form);
    } else {
      await api.entities.Store.create(form);
    }
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    setShowForm(false);
    setEditingStore(null);
    setForm({ name: "", code: "", address: "", city: "", state: "", manager: "", status: "active" });
  };

  const handleDelete = async () => {
    await api.entities.Store.delete(deleteStore.id);
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    setDeleteStore(null);
  };

  const handleEdit = (store) => {
    setForm({ ...store });
    setEditingStore(store);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6 print-content">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuração de Lojas</h1>
          <p className="text-slate-400">Gerencie as lojas do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} variant="outline" className="border-slate-600 text-slate-300">
            <Printer className="h-4 w-4 mr-2" />Imprimir
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />Nova Loja
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Store className="h-5 w-5 text-blue-400" /></div>
            <div>
              <CardTitle className="text-white">Lojas Cadastradas</CardTitle>
              <CardDescription className="text-slate-400">{stores.length} loja(s)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Código</TableHead>
                <TableHead className="text-slate-300">Nome</TableHead>
                <TableHead className="text-slate-300">Endereço</TableHead>
                <TableHead className="text-slate-300">Cidade/UF</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">Nenhuma loja cadastrada</TableCell></TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id} className="border-slate-700">
                    <TableCell className="text-white font-mono">{store.code}</TableCell>
                    <TableCell className="text-white font-medium">{store.name}</TableCell>
                    <TableCell className="text-slate-300">{store.address || "-"}</TableCell>
                    <TableCell className="text-slate-300">{store.city ? `${store.city}/${store.state}` : "-"}</TableCell>
                    <TableCell>
                      <Badge className={store.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {store.status === "active" ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(store)} className="text-slate-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteStore(store)} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditingStore(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingStore ? "Editar Loja" : "Nova Loja"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Código *</Label>
                <Input value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label className="text-slate-300">Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Cidade</Label>
                <Input value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Estado</Label>
                <Input value={form.state} onChange={(e) => setForm(p => ({ ...p, state: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
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

      <AlertDialog open={!!deleteStore} onOpenChange={() => setDeleteStore(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir a loja "{deleteStore?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}