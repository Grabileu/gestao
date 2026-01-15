import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Printer, Users } from "lucide-react";
import moment from "moment";

const CONTRACT_TYPES = {
  clt: "CLT",
  pj: "PJ",
  temporary: "Temporário",
  intern: "Estagiário",
  casual: "Avulso"
};

const STATUS_TYPES = {
  active: "Ativo",
  inactive: "Inativo",
  on_leave: "Afastado",
  terminated: "Desligado"
};

export default function Employees() {
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.list()
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.entities.Department.list()
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.entities.Store.list()
  });

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    birth_date: "",
    hire_date: "",
    department_id: "",
    department_name: "",
    position: "",
    salary: 0,
    contract_type: "clt",
    status: "active",
    is_cashier: false,
    cashier_code: "",
    store_id: "",
    store_name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    bank_name: "",
    bank_agency: "",
    bank_account: "",
    notes: ""
  });

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "",
      cpf: "",
      birth_date: "",
      hire_date: "",
      department_id: "",
      department_name: "",
      position: "",
      salary: 0,
      contract_type: "clt",
      status: "active",
      is_cashier: false,
      cashier_code: "",
      store_id: "",
      store_name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      bank_name: "",
      bank_agency: "",
      bank_account: "",
      notes: ""
    });
    setEditingItem(null);
  };

  const handleDeptChange = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
      setForm(prev => ({ ...prev, department_id: dept.id, department_name: dept.name }));
    }
  };

  const handleStoreChange = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setForm(prev => ({ ...prev, store_id: store.id, store_name: store.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = {
      ...form,
      birth_date: form.birth_date || null,
      hire_date: form.hire_date || null
    };
    
    if (editingItem?.id) {
      await api.entities.Employee.update(editingItem.id, dataToSave);
    } else {
      await api.entities.Employee.create(dataToSave);
    }
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async () => {
    await api.entities.Employee.delete(deleteItem.id);
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    setDeleteItem(null);
  };

  const handleEdit = (item) => {
    // Preservar datas exatamente como estão no banco (sem conversão de timezone)
    setForm({
      ...item,
      birth_date: item.birth_date ? item.birth_date.split('T')[0] : "",
      hire_date: item.hire_date ? item.hire_date.split('T')[0] : ""
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const filteredEmployees = activeTab === "cashiers" 
    ? employees.filter(e => e.is_cashier) 
    : employees;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Funcionários - GUF System</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f4f4f4; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>GUF System - Funcionários</h1>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Contrato</th>
                <th>Status</th>
                <th>Operador</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmployees.map(emp => `
                <tr>
                  <td>${emp.full_name}</td>
                  <td>${emp.position || "-"}</td>
                  <td>${emp.department_name || "-"}</td>
                  <td>${CONTRACT_TYPES[emp.contract_type] || emp.contract_type}</td>
                  <td>${STATUS_TYPES[emp.status] || emp.status}</td>
                  <td>${emp.is_cashier ? "Sim" : "Não"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Check if contract type doesn't pay INSS
  const noINSS = form.contract_type === "intern" || form.contract_type === "casual";

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Funcionários</h1>
          <p className="text-slate-400">Gerencie funcionários e operadores de caixa</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="border-slate-600 text-slate-300">
            <Printer className="h-4 w-4 mr-2" />Imprimir
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />Novo Funcionário
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">Todos</TabsTrigger>
          <TabsTrigger value="cashiers" className="data-[state=active]:bg-blue-600">Operadores de Caixa</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Nome</TableHead>
                <TableHead className="text-slate-300">Cargo</TableHead>
                <TableHead className="text-slate-300">Departamento</TableHead>
                <TableHead className="text-slate-300">Contrato</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Operador</TableHead>
                <TableHead className="text-slate-300 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">{emp.full_name}</TableCell>
                  <TableCell className="text-slate-300">{emp.position}</TableCell>
                  <TableCell className="text-slate-300">{emp.department_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      emp.contract_type === "clt" ? "bg-blue-500/20 text-blue-400" :
                      emp.contract_type === "pj" ? "bg-purple-500/20 text-purple-400" :
                      emp.contract_type === "intern" ? "bg-yellow-500/20 text-yellow-400" :
                      emp.contract_type === "casual" ? "bg-orange-500/20 text-orange-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {CONTRACT_TYPES[emp.contract_type]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${emp.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {STATUS_TYPES[emp.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {emp.is_cashier && (
                      <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400">
                        {emp.cashier_code || "Sim"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(emp)} className="text-slate-400 hover:text-white">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteItem(emp)} className="text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); resetForm(); }}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingItem ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Nome Completo *</Label>
                <Input value={form.full_name} onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label className="text-slate-300">CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm(p => ({ ...p, cpf: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Data de Nascimento</Label>
                <Input type="date" value={form.birth_date} onChange={(e) => setForm(p => ({ ...p, birth_date: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Data de Admissão *</Label>
                <Input type="date" value={form.hire_date} onChange={(e) => setForm(p => ({ ...p, hire_date: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
            </div>

            {/* Work Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Departamento *</Label>
                <Select value={form.department_id} onValueChange={handleDeptChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Cargo *</Label>
                <Input value={form.position} onChange={(e) => setForm(p => ({ ...p, position: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Salário</Label>
                <Input type="number" step="0.01" value={form.salary} onChange={(e) => setForm(p => ({ ...p, salary: parseFloat(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Tipo de Contrato</Label>
                <Select value={form.contract_type} onValueChange={(v) => setForm(p => ({ ...p, contract_type: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {noINSS && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">⚠️ Estagiário e Avulso não pagam INSS</p>
              </div>
            )}

            {/* Cashier Info */}
            <div className="border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-slate-300">É Operador de Caixa?</Label>
                  <p className="text-xs text-slate-500">Marque se este funcionário opera caixa</p>
                </div>
                <Switch checked={form.is_cashier} onCheckedChange={(v) => setForm(p => ({ ...p, is_cashier: v }))} />
              </div>

              {form.is_cashier && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Código do Operador</Label>
                    <Input value={form.cashier_code} onChange={(e) => setForm(p => ({ ...p, cashier_code: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Loja</Label>
                    <Select value={form.store_id} onValueChange={handleStoreChange}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Bank Info */}
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-white font-medium mb-3">Dados Bancários</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Banco</Label>
                  <Input value={form.bank_name} onChange={(e) => setForm(p => ({ ...p, bank_name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Agência</Label>
                  <Input value={form.bank_agency} onChange={(e) => setForm(p => ({ ...p, bank_agency: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Conta</Label>
                  <Input value={form.bank_account} onChange={(e) => setForm(p => ({ ...p, bank_account: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="border-slate-600">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir o funcionário "{deleteItem?.full_name}"?</AlertDialogDescription>
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