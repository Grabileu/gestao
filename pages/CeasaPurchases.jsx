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
import { Plus, Search, Eye, Trash2, ShoppingCart, X } from "lucide-react";
import moment from "moment";

const unitLabels = { kg: "Kg", unit: "Un", box: "Cx", dozen: "Dz" };
const paymentLabels = { cash: "Dinheiro", pix: "PIX", credit: "Crédito", debit: "Débito", invoice: "Boleto" };

export default function CeasaPurchases() {
  const [showForm, setShowForm] = useState(false);
  const [viewPurchase, setViewPurchase] = useState(null);
  const [deletePurchase, setDeletePurchase] = useState(null);
  const [filters, setFilters] = useState({ search: "", month: "", supplier: "all" });

  const queryClient = useQueryClient();

  const { data: purchases = [] } = useQuery({
    queryKey: ["ceasa-purchases"],
    queryFn: () => api.entities.CeasaPurchase.list("-date")
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["ceasa-suppliers"],
    queryFn: () => api.entities.CeasaSupplier.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["ceasa-products"],
    queryFn: () => api.entities.CeasaProduct.list()
  });

  const [form, setForm] = useState({
    date: moment().format("YYYY-MM-DD"),
    supplier_id: "",
    supplier_name: "",
    items: [],
    total_amount: 0,
    payment_method: "cash",
    paid: true,
    observations: ""
  });

  const [newItem, setNewItem] = useState({ product_id: "", product_name: "", quantity: "", unit_type: "kg", unit_price: "", total_price: 0 });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.CeasaPurchase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ceasa-purchases"] });
      setDeletePurchase(null);
    }
  });

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setForm(prev => ({ ...prev, supplier_id: supplierId, supplier_name: supplier?.name || "", items: [] }));
    setNewItem({ product_id: "", product_name: "", quantity: "", unit_type: "kg", unit_price: "", total_price: 0 });
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewItem(prev => ({
        ...prev,
        product_id: productId,
        product_name: product.name,
        unit_type: product.unit_type,
        unit_price: product.default_price?.toString() || ""
      }));
    }
  };

  const calculateItemTotal = () => {
    const qty = parseFloat(newItem.quantity) || 0;
    const price = parseFloat(newItem.unit_price) || 0;
    return qty * price;
  };

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.quantity || !newItem.unit_price) return;
    
    const itemTotal = calculateItemTotal();
    const item = { ...newItem, quantity: parseFloat(newItem.quantity), unit_price: parseFloat(newItem.unit_price), total_price: itemTotal };
    
    const newItems = [...form.items, item];
    const totalAmount = newItems.reduce((sum, i) => sum + i.total_price, 0);
    
    setForm(prev => ({ ...prev, items: newItems, total_amount: totalAmount }));
    setNewItem({ product_id: "", product_name: "", quantity: "", unit_type: "kg", unit_price: "", total_price: 0 });
  };

  const handleRemoveItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    const totalAmount = newItems.reduce((sum, i) => sum + i.total_price, 0);
    setForm(prev => ({ ...prev, items: newItems, total_amount: totalAmount }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) return;
    
    await api.entities.CeasaPurchase.create(form);
    queryClient.invalidateQueries({ queryKey: ["ceasa-purchases"] });
    setShowForm(false);
    setForm({
      date: moment().format("YYYY-MM-DD"),
      supplier_id: "",
      supplier_name: "",
      items: [],
      total_amount: 0,
      payment_method: "cash",
      paid: true,
      observations: ""
    });
  };

  const filteredPurchases = purchases.filter(p => {
    const searchMatch = !filters.search || p.supplier_name?.toLowerCase().includes(filters.search.toLowerCase());
    const monthMatch = !filters.month || p.date?.startsWith(filters.month);
    const supplierMatch = filters.supplier === "all" || p.supplier_id === filters.supplier;
    return searchMatch && monthMatch && supplierMatch;
  });

  const supplierProducts = products.filter(p => p.supplier_id === form.supplier_id && p.status === "active");

  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const formatCurrency = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Compras CEASA</h1>
          <p className="text-slate-400">Registre as compras realizadas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Compra
        </Button>
      </div>

      {/* Stats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total em Compras (período)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalPurchases)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar..."
                  value={filters.search}
                  onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <Input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters(p => ({ ...p, month: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div className="w-[200px]">
              <Select value={filters.supplier} onValueChange={(v) => setFilters(p => ({ ...p, supplier: v }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white"><SelectValue placeholder="Fornecedor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos fornecedores</SelectItem>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Data</TableHead>
              <TableHead className="text-slate-300">Fornecedor</TableHead>
              <TableHead className="text-slate-300">Itens</TableHead>
              <TableHead className="text-slate-300">Pagamento</TableHead>
              <TableHead className="text-slate-300">Total</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">Nenhuma compra registrada</TableCell></TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id} className="border-slate-700">
                  <TableCell className="text-white">{moment(purchase.date).format("DD/MM/YYYY")}</TableCell>
                  <TableCell className="text-white font-medium">{purchase.supplier_name}</TableCell>
                  <TableCell className="text-slate-300">{purchase.items?.length || 0} itens</TableCell>
                  <TableCell className="text-slate-300">{paymentLabels[purchase.payment_method]}</TableCell>
                  <TableCell className="text-green-400 font-bold">{formatCurrency(purchase.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={purchase.paid ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                      {purchase.paid ? "Pago" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setViewPurchase(purchase)} className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeletePurchase(purchase)} className="text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Purchase Form */}
      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Compra</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Data *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label className="text-slate-300">Fornecedor *</Label>
                <Select value={form.supplier_id} onValueChange={handleSupplierChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.filter(s => s.status === "active").map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Items */}
            {form.supplier_id && (
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                <Label className="text-slate-300">Adicionar Item</Label>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2">
                    <Select value={newItem.product_id} onValueChange={handleProductChange}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Produto" /></SelectTrigger>
                      <SelectContent>
                        {supplierProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input type="number" step="0.01" placeholder="Qtd" value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Input type="number" step="0.01" placeholder="Preço" value={newItem.unit_price} onChange={(e) => setNewItem(p => ({ ...p, unit_price: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Button type="button" onClick={handleAddItem} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {newItem.product_id && newItem.quantity && newItem.unit_price && (
                  <p className="text-sm text-slate-400">Subtotal: {formatCurrency(calculateItemTotal())} ({unitLabels[newItem.unit_type]})</p>
                )}
              </div>
            )}

            {/* Items List */}
            {form.items.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Produto</TableHead>
                      <TableHead className="text-slate-300">Qtd</TableHead>
                      <TableHead className="text-slate-300">Preço Unit.</TableHead>
                      <TableHead className="text-slate-300">Total</TableHead>
                      <TableHead className="text-slate-300"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.items.map((item, index) => (
                      <TableRow key={index} className="border-slate-700">
                        <TableCell className="text-white">{item.product_name}</TableCell>
                        <TableCell className="text-slate-300">{item.quantity} {unitLabels[item.unit_type]}</TableCell>
                        <TableCell className="text-slate-300">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-green-400">{formatCurrency(item.total_price)}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-300">
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-slate-700 bg-slate-800">
                      <TableCell colSpan={3} className="text-white font-bold">TOTAL</TableCell>
                      <TableCell colSpan={2} className="text-green-400 font-bold text-lg">{formatCurrency(form.total_amount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Forma de Pagamento</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm(p => ({ ...p, payment_method: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="invoice">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={form.paid} onChange={(e) => setForm(p => ({ ...p, paid: e.target.checked }))} className="rounded" />
                  Pago
                </label>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Observações</Label>
              <Textarea value={form.observations} onChange={(e) => setForm(p => ({ ...p, observations: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-600">Cancelar</Button>
              <Button type="submit" disabled={form.items.length === 0} className="bg-green-600 hover:bg-green-700">Salvar Compra</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Purchase */}
      <Dialog open={!!viewPurchase} onOpenChange={() => setViewPurchase(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes da Compra</DialogTitle>
          </DialogHeader>
          {viewPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">Data</p>
                  <p className="text-white font-bold">{moment(viewPurchase.date).format("DD/MM/YYYY")}</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">Fornecedor</p>
                  <p className="text-white font-bold">{viewPurchase.supplier_name}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Produto</TableHead>
                      <TableHead className="text-slate-300">Qtd</TableHead>
                      <TableHead className="text-slate-300">Preço</TableHead>
                      <TableHead className="text-slate-300">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewPurchase.items?.map((item, index) => (
                      <TableRow key={index} className="border-slate-700">
                        <TableCell className="text-white">{item.product_name}</TableCell>
                        <TableCell className="text-slate-300">{item.quantity} {unitLabels[item.unit_type]}</TableCell>
                        <TableCell className="text-slate-300">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-green-400">{formatCurrency(item.total_price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 flex justify-between items-center">
                <span className="text-green-400 font-semibold">Total da Compra</span>
                <span className="text-green-400 font-bold text-xl">{formatCurrency(viewPurchase.total_amount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletePurchase} onOpenChange={() => setDeletePurchase(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir esta compra?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deletePurchase.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}