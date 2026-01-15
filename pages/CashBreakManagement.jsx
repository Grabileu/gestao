import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Pencil, Trash2, Receipt, Printer, AlertCircle } from "lucide-react";
import moment from "moment";

const paymentTypeLabels = {
  cash: { label: "Dinheiro", color: "bg-green-500/20 text-green-400" },
  credit: { label: "Crédito", color: "bg-blue-500/20 text-blue-400" },
  debit: { label: "Débito", color: "bg-purple-500/20 text-purple-400" },
  subsidy: { label: "Subsídio", color: "bg-pink-500/20 text-pink-400" },
  food_voucher: { label: "Alimentação", color: "bg-orange-500/20 text-orange-400" },
  pos: { label: "POS", color: "bg-red-500/20 text-red-400" },
  customer_credit: { label: "Cliente a Prazo", color: "bg-yellow-500/20 text-yellow-400" },
  pix: { label: "Pix", color: "bg-cyan-500/20 text-cyan-400" }
};

const typeLabels = {
  shortage: { label: "Falta", color: "bg-red-500/20 text-red-400" },
  surplus: { label: "Sobra", color: "bg-green-500/20 text-green-400" }
};

export default function CashBreakManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingBreak, setEditingBreak] = useState(null);
  const [deleteBreak, setDeleteBreak] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStore, setFilterStore] = useState("all");

  const queryClient = useQueryClient();

  const { data: cashBreaks = [] } = useQuery({
    queryKey: ["cash-breaks"],
    queryFn: () => api.entities.CashBreak.list("-date")
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.entities.Employee.list()
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

  const cashiers = employees.filter(e => e.is_cashier && e.status === "active");

  const [form, setForm] = useState({
    date: moment().format("YYYY-MM-DD"),
    store_id: "",
    store_name: "",
    employee_id: "",
    employee_name: "",
    payment_type: "cash",
    type: "shortage",
    amount: "",
    voucher_lost: false,
    voucher_lost_count: 1,
    voucher_lost_value: "",
    voucher_paid: false,
    penalty_amount: 0,
    total_discount: 0,
    reason: "",
    voucher_number: "",
    voucher_status: "pending",
    payment_date: "",
    observations: "",
    shift: "morning"
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.CashBreak.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-breaks"] });
      setDeleteBreak(null);
    }
  });

  // Calculate penalty when form changes
  useEffect(() => {
    calculatePenalty();
  }, [form.payment_type, form.voucher_lost, form.voucher_lost_count, form.voucher_lost_value, form.voucher_paid, form.amount, form.type]);

  const calculatePenalty = () => {
    // Finalizadoras que cobram multa por comprovante perdido
    const isCardOrPos = ["credit", "debit", "subsidy", "food_voucher", "pos", "customer_credit", "pix"].includes(form.payment_type);
    let penaltyAmount = 0;
    let totalDiscount = 0;

    if (form.type === "shortage") {
      if (form.payment_type === "cash") {
        // DINHEIRO: registra diferença exata, sem desconto automático de multa
        // O valor informado é o próprio desconto (falta no caixa)
        totalDiscount = parseFloat(form.amount) || 0;
        penaltyAmount = 0; // Não há multa, apenas a diferença
      } else if (isCardOrPos && form.voucher_lost) {
        // CARTÃO/POS com comprovante perdido
        // Multa base + multa adicional por cada comprovante extra
        penaltyAmount = config.voucher_lost_penalty || 5;
        if (form.voucher_lost_count > 1) {
          penaltyAmount += (form.voucher_lost_count - 1) * (config.voucher_lost_penalty_additional || 5);
        }

        // Regra especial para POS: se valor não foi pago, desconta o valor total do comprovante
        if (form.payment_type === "pos" && !form.voucher_paid) {
          totalDiscount = penaltyAmount + (parseFloat(form.voucher_lost_value) || 0);
        } else {
          // Para outros cartões ou POS com valor pago: apenas a multa
          totalDiscount = penaltyAmount;
        }
      } else if (isCardOrPos) {
        // CARTÃO/POS sem marcar "comprovante perdido" 
        // Desconto automático de R$5 por perda de comprovante
        penaltyAmount = config.voucher_lost_penalty || 5;
        totalDiscount = penaltyAmount;
      }
    } else {
      // SOBRA: não há desconto
      penaltyAmount = 0;
      totalDiscount = 0;
    }

    setForm(prev => ({
      ...prev,
      penalty_amount: penaltyAmount,
      total_discount: totalDiscount
    }));
  };

  const handleEmployeeChange = (empId) => {
    const emp = employees.find(e => e.id === empId);
    setForm(prev => ({
      ...prev,
      employee_id: empId,
      employee_name: emp?.full_name || "",
      store_id: emp?.store_id || prev.store_id,
      store_name: emp?.store_name || prev.store_name
    }));
  };

  const handleStoreChange = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    setForm(prev => ({
      ...prev,
      store_id: storeId,
      store_name: store?.name || ""
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      amount: parseFloat(form.amount) || 0,
      voucher_lost_value: parseFloat(form.voucher_lost_value) || 0
    };
    
    if (editingBreak?.id) {
      await api.entities.CashBreak.update(editingBreak.id, data);
    } else {
      await api.entities.CashBreak.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ["cash-breaks"] });
    setShowForm(false);
    setEditingBreak(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      date: moment().format("YYYY-MM-DD"),
      store_id: "", store_name: "", employee_id: "", employee_name: "",
      payment_type: "cash", type: "shortage", amount: "", voucher_lost: false,
      voucher_lost_count: 1, voucher_lost_value: "", voucher_paid: false,
      penalty_amount: 0, total_discount: 0, reason: "", voucher_number: "",
      voucher_status: "pending", payment_date: "", observations: "", shift: "morning"
    });
  };

  const handleEdit = (brk) => {
    // Preservar data exatamente como está no banco (sem conversão de timezone)
    setForm({
      ...brk,
      date: brk.date ? brk.date.split('T')[0] : moment().format("YYYY-MM-DD"),
      amount: brk.amount?.toString() || "",
      voucher_lost_value: brk.voucher_lost_value?.toString() || ""
    });
    setEditingBreak(brk);
    setShowForm(true);
  };

  const filteredBreaks = cashBreaks.filter(b => {
    const matchesSearch = b.employee_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStore = filterStore === "all" || b.store_id === filterStore;
    return matchesSearch && matchesStore;
  });

  const formatCurrency = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  const handlePrint = () => window.print();

  const isCardPayment = ["credit", "debit", "subsidy", "food_voucher", "pos", "customer_credit", "pix"].includes(form.payment_type);

  return (
    <div className="p-6 space-y-6 print-content">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quebras de Caixa</h1>
          <p className="text-slate-400">Registre faltas e sobras dos operadores</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="border-slate-600 text-slate-300">
            <Printer className="h-4 w-4 mr-2" />Imprimir
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />Nova Quebra
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar operador..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-slate-900 border-slate-600 text-white" />
          </div>
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Loja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Lojas</SelectItem>
              {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Data</TableHead>
              <TableHead className="text-slate-300">Operador</TableHead>
              <TableHead className="text-slate-300">Loja</TableHead>
              <TableHead className="text-slate-300">Finalizadora</TableHead>
              <TableHead className="text-slate-300">Tipo</TableHead>
              <TableHead className="text-slate-300">Valor</TableHead>
              <TableHead className="text-slate-300">Desconto</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBreaks.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">Nenhuma quebra registrada</TableCell></TableRow>
            ) : (
              filteredBreaks.map((brk) => (
                <TableRow key={brk.id} className="border-slate-700">
                  <TableCell className="text-white">{moment(brk.date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell className="text-white">{brk.employee_name}</TableCell>
                  <TableCell className="text-slate-300">{brk.store_name}</TableCell>
                  <TableCell><Badge className={paymentTypeLabels[brk.payment_type]?.color}>{paymentTypeLabels[brk.payment_type]?.label}</Badge></TableCell>
                  <TableCell><Badge className={typeLabels[brk.type]?.color}>{typeLabels[brk.type]?.label}</Badge></TableCell>
                  <TableCell className="text-white">{formatCurrency(brk.amount)}</TableCell>
                  <TableCell className="text-red-400 font-bold">{formatCurrency(brk.total_discount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(brk)} className="text-slate-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteBreak(brk)} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditingBreak(null); resetForm(); }}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingBreak ? "Editar Quebra" : "Nova Quebra de Caixa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
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
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {cashiers.map(c => <SelectItem key={c.id} value={c.id}>{c.cashier_code} - {c.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Loja</Label>
                <Select value={form.store_id} onValueChange={handleStoreChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Finalizadora *</Label>
                <Select value={form.payment_type} onValueChange={(v) => setForm(p => ({ ...p, payment_type: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="subsidy">Subsídio</SelectItem>
                    <SelectItem value="food_voucher">Alimentação</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                    <SelectItem value="customer_credit">Cliente a Prazo</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shortage">Falta</SelectItem>
                    <SelectItem value="surplus">Sobra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Valor (R$) *</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
            </div>

            {/* Comprovante Perdido (apenas para cartões) */}
            {isCardPayment && form.type === "shortage" && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <Label className="text-red-400 font-semibold">Comprovante Perdido?</Label>
                      <p className="text-xs text-slate-500">Multa de R$ {config.voucher_lost_penalty} por comprovante</p>
                    </div>
                  </div>
                  <Switch checked={form.voucher_lost} onCheckedChange={(v) => setForm(p => ({ ...p, voucher_lost: v }))} />
                </div>

                {form.voucher_lost && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Qtd. Comprovantes Perdidos</Label>
                        <Input type="number" min="1" value={form.voucher_lost_count} onChange={(e) => setForm(p => ({ ...p, voucher_lost_count: parseInt(e.target.value) || 1 }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                      <div>
                        <Label className="text-slate-300">Valor do Comprovante</Label>
                        <Input type="number" step="0.01" placeholder="Ex: 19.99" value={form.voucher_lost_value} onChange={(e) => setForm(p => ({ ...p, voucher_lost_value: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                    </div>

                    {form.payment_type === "pos" && (
                      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div>
                          <Label className="text-slate-300">Valor do Comprovante Foi Pago?</Label>
                          <p className="text-xs text-slate-500">Se não foi pago, será descontado além da multa</p>
                        </div>
                        <Switch checked={form.voucher_paid} onCheckedChange={(v) => setForm(p => ({ ...p, voucher_paid: v }))} />
                      </div>
                    )}

                    <div>
                      <Label className="text-slate-300">Observação do Comprovante *</Label>
                      <Textarea placeholder="Descreva o valor perdido do comprovante..." value={form.observations} onChange={(e) => setForm(p => ({ ...p, observations: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Resumo do Desconto */}
            {form.type === "shortage" && (
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-white font-semibold mb-2">Resumo do Desconto</h3>
                <div className="space-y-1 text-sm">
                  {form.payment_type === "cash" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Diferença no Dinheiro (sem multa)</span>
                        <span className="text-white">{formatCurrency(form.amount)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Dinheiro: registra apenas a diferença exata</p>
                    </>
                  )}
                  {isCardPayment && form.voucher_lost && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Multa por comprovante ({form.voucher_lost_count}x)</span>
                        <span className="text-white">{formatCurrency(form.penalty_amount)}</span>
                      </div>
                      {form.payment_type === "pos" && !form.voucher_paid && form.voucher_lost_value && (
                        <div className="flex justify-between">
                          <span className="text-slate-300">+ Valor do comprovante não pago</span>
                          <span className="text-white">{formatCurrency(form.voucher_lost_value)}</span>
                        </div>
                      )}
                      {form.payment_type === "pos" && form.voucher_paid && (
                        <p className="text-xs text-green-400 mt-1">✓ Valor do comprovante foi pago - desconta apenas a multa</p>
                      )}
                    </>
                  )}
                  {isCardPayment && !form.voucher_lost && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Multa automática (cartão/POS)</span>
                        <span className="text-white">{formatCurrency(config.voucher_lost_penalty || 5)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Cartões/POS: R$ {config.voucher_lost_penalty || 5} por perda de comprovante</p>
                    </>
                  )}
                  <div className="flex justify-between font-bold border-t border-slate-600 pt-2 mt-2">
                    <span className="text-red-400">Total a Descontar</span>
                    <span className="text-red-400 text-lg">{formatCurrency(form.total_discount)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sobra - sem desconto */}
            {form.type === "surplus" && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <h3 className="text-green-400 font-semibold mb-2">Sobra de Caixa</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Valor da Sobra</span>
                  <span className="text-green-400 font-bold">{formatCurrency(form.amount)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Sobras não geram desconto ao operador</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Nº Vale</Label>
                <Input value={form.voucher_number} onChange={(e) => setForm(p => ({ ...p, voucher_number: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Status</Label>
                <Select value={form.voucher_status} onValueChange={(v) => setForm(p => ({ ...p, voucher_status: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="border-slate-600">Cancelar</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteBreak} onOpenChange={() => setDeleteBreak(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir esta quebra?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteBreak.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}