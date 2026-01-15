import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Printer, Receipt, AlertTriangle } from "lucide-react";
import moment from "moment";

const PAYMENT_TYPES = {
  cash: "Dinheiro",
  credit: "Crédito",
  debit: "Débito",
  subsidy: "Subsídio",
  food_voucher: "Alimentação",
  pos: "POS",
  customer_credit: "Cliente a Prazo",
  pix: "Pix"
};

const CARD_TYPES = ["credit", "debit", "subsidy", "food_voucher", "pos", "pix"];

export default function CashBreaks() {
  const queryClient = useQueryClient();
  const printRef = useRef();

  const { data: cashBreaks = [] } = useQuery({
    queryKey: ["cash-breaks"],
    queryFn: () => api.entities.CashBreak.list("-date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.filter({ is_cashier: true })
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.entities.Store.list()
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => api.entities.SystemConfig.list()
  });

  const config = configs[0] || { voucher_lost_penalty: 5, voucher_lost_penalty_additional: 5 };

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState({
    date: moment().format("YYYY-MM-DD"),
    store_id: "",
    store_name: "",
    employee_id: "",
    employee_name: "",
    payment_type: "cash",
    type: "shortage",
    amount: 0,
    voucher_lost: false,
    voucher_lost_count: 1,
    voucher_lost_value: 0,
    voucher_paid: false,
    penalty_amount: 0,
    total_discount: 0,
    observations: "",
    shift: "morning"
  });

  const resetForm = () => {
    setForm({
      date: moment().format("YYYY-MM-DD"),
      store_id: "",
      store_name: "",
      employee_id: "",
      employee_name: "",
      payment_type: "cash",
      type: "shortage",
      amount: 0,
      voucher_lost: false,
      voucher_lost_count: 1,
      voucher_lost_value: 0,
      voucher_paid: false,
      penalty_amount: 0,
      total_discount: 0,
      observations: "",
      shift: "morning"
    });
    setEditingItem(null);
  };

  const isCardType = CARD_TYPES.includes(form.payment_type);
  const isPOS = form.payment_type === "pos";

  // Calculate penalty and total discount
  useEffect(() => {
    let penalty = 0;
    let total = form.amount;

    if (isCardType && form.voucher_lost) {
      // Base penalty for first voucher
      penalty = config.voucher_lost_penalty || 5;
      
      // Additional penalty for extra lost vouchers
      if (form.voucher_lost_count > 1) {
        penalty += (form.voucher_lost_count - 1) * (config.voucher_lost_penalty_additional || 5);
      }

      // For POS: if voucher value wasn't paid, add it to total
      if (isPOS && !form.voucher_paid && form.voucher_lost_value > 0) {
        total = penalty + form.voucher_lost_value;
      } else {
        total = penalty;
      }
    }

    setForm(prev => ({ ...prev, penalty_amount: penalty, total_discount: total }));
  }, [form.payment_type, form.voucher_lost, form.voucher_lost_count, form.voucher_lost_value, form.voucher_paid, form.amount, config]);

  const handleEmployeeChange = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      setForm(prev => ({
        ...prev,
        employee_id: emp.id,
        employee_name: emp.full_name,
        store_id: emp.store_id || "",
        store_name: emp.store_name || ""
      }));
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
    const dataToSave = { ...form };
    
    if (editingItem?.id) {
      await api.entities.CashBreak.update(editingItem.id, dataToSave);
    } else {
      await api.entities.CashBreak.create(dataToSave);
    }
    queryClient.invalidateQueries({ queryKey: ["cash-breaks"] });
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async () => {
    await api.entities.CashBreak.delete(deleteItem.id);
    queryClient.invalidateQueries({ queryKey: ["cash-breaks"] });
    setDeleteItem(null);
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      date: item.date ? moment(item.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório de Quebras de Caixa - GUF System</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f4f4f4; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .shortage { color: red; }
            .surplus { color: green; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>GUF System - Relatório de Quebras de Caixa</h1>
          <p>Data: ${moment().format("DD/MM/YYYY HH:mm")}</p>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Loja</th>
                <th>Operador</th>
                <th>Finalizadora</th>
                <th>Tipo</th>
                <th class="text-right">Valor</th>
                <th class="text-right">Multa</th>
                <th class="text-right">Total Desc.</th>
              </tr>
            </thead>
            <tbody>
              ${cashBreaks.map(item => `
                <tr>
                  <td>${moment(item.date).format("DD/MM/YYYY")}</td>
                  <td>${item.store_name || "-"}</td>
                  <td>${item.employee_name || "-"}</td>
                  <td>${PAYMENT_TYPES[item.payment_type] || item.payment_type}</td>
                  <td class="${item.type === 'shortage' ? 'shortage' : 'surplus'}">${item.type === "shortage" ? "Falta" : "Sobra"}</td>
                  <td class="text-right">R$ ${(item.amount || 0).toFixed(2)}</td>
                  <td class="text-right">R$ ${(item.penalty_amount || 0).toFixed(2)}</td>
                  <td class="text-right">R$ ${(item.total_discount || 0).toFixed(2)}</td>
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quebra de Caixa</h1>
          <p className="text-slate-400">Controle de diferenças de caixa dos operadores</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="border-slate-600 text-slate-300">
            <Printer className="h-4 w-4 mr-2" />Imprimir
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />Nova Quebra
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div ref={printRef}>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Data</TableHead>
                  <TableHead className="text-slate-300">Loja</TableHead>
                  <TableHead className="text-slate-300">Operador</TableHead>
                  <TableHead className="text-slate-300">Finalizadora</TableHead>
                  <TableHead className="text-slate-300">Tipo</TableHead>
                  <TableHead className="text-slate-300 text-right">Valor</TableHead>
                  <TableHead className="text-slate-300 text-right">Multa</TableHead>
                  <TableHead className="text-slate-300 text-right">Total Desc.</TableHead>
                  <TableHead className="text-slate-300 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashBreaks.map((item) => (
                  <TableRow key={item.id} className="border-slate-700">
                    <TableCell className="text-white">{moment(item.date).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className="text-slate-300">{item.store_name}</TableCell>
                    <TableCell className="text-white">{item.employee_name}</TableCell>
                    <TableCell className="text-slate-300">{PAYMENT_TYPES[item.payment_type]}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${item.type === "shortage" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                        {item.type === "shortage" ? "Falta" : "Sobra"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-white">R$ {(item.amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-yellow-400">R$ {(item.penalty_amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-red-400 font-semibold">R$ {(item.total_discount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-white">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteItem(item)} className="text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); resetForm(); }}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingItem ? "Editar Quebra" : "Nova Quebra de Caixa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Data *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label className="text-slate-300">Turno</Label>
                <Select value={form.shift} onValueChange={(v) => setForm(p => ({ ...p, shift: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="night">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Operador *</Label>
                <Select value={form.employee_id} onValueChange={handleEmployeeChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Finalizadora *</Label>
                <Select value={form.payment_type} onValueChange={(v) => setForm(p => ({ ...p, payment_type: v, voucher_lost: false, voucher_lost_count: 1, voucher_lost_value: 0, voucher_paid: false }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shortage">Falta</SelectItem>
                    <SelectItem value="surplus">Sobra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Valor da Diferença (R$) *</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} className="bg-slate-800 border-slate-600 text-white" required />
            </div>

            {/* Card-specific fields */}
            {isCardType && (
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Comprovante Perdido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Perdeu comprovante?</Label>
                    <Switch checked={form.voucher_lost} onCheckedChange={(v) => setForm(p => ({ ...p, voucher_lost: v }))} />
                  </div>

                  {form.voucher_lost && (
                    <>
                      <div>
                        <Label className="text-slate-300">Quantidade de Comprovantes Perdidos</Label>
                        <Input type="number" min="1" value={form.voucher_lost_count} onChange={(e) => setForm(p => ({ ...p, voucher_lost_count: parseInt(e.target.value) || 1 }))} className="bg-slate-700 border-slate-600 text-white" />
                        <p className="text-xs text-slate-500 mt-1">Multa: R$ {config.voucher_lost_penalty} + R$ {config.voucher_lost_penalty_additional} por comprovante adicional</p>
                      </div>

                      {isPOS && (
                        <>
                          <div>
                            <Label className="text-slate-300">Valor do Comprovante Perdido (R$)</Label>
                            <Input type="number" step="0.01" value={form.voucher_lost_value} onChange={(e) => setForm(p => ({ ...p, voucher_lost_value: parseFloat(e.target.value) || 0 }))} className="bg-slate-700 border-slate-600 text-white" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-slate-300">O valor foi pago?</Label>
                              <p className="text-xs text-slate-500">Se não foi pago, o valor será descontado</p>
                            </div>
                            <Switch checked={form.voucher_paid} onCheckedChange={(v) => setForm(p => ({ ...p, voucher_paid: v }))} />
                          </div>
                        </>
                      )}

                      <div>
                        <Label className="text-slate-300">Observações (obrigatório) *</Label>
                        <Textarea value={form.observations} onChange={(e) => setForm(p => ({ ...p, observations: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" placeholder="Descreva os detalhes do comprovante perdido..." required={form.voucher_lost} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-300">Total a Descontar:</span>
                  <span className="text-red-400 font-bold">R$ {form.total_discount.toFixed(2)}</span>
                </div>
                {isCardType && form.voucher_lost && (
                  <p className="text-xs text-slate-400 mt-2">
                    Multa: R$ {form.penalty_amount.toFixed(2)}
                    {isPOS && !form.voucher_paid && form.voucher_lost_value > 0 && ` + Valor não pago: R$ ${form.voucher_lost_value.toFixed(2)}`}
                  </p>
                )}
              </CardContent>
            </Card>

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
            <AlertDialogDescription className="text-slate-400">Deseja excluir esta quebra de caixa?</AlertDialogDescription>
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