import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
  const [openDates, setOpenDates] = useState({}); // controla expansão por data
  const [openSuppliers, setOpenSuppliers] = useState({}); // controla expansão por fornecedor (chave data|supplier)

  const queryClient = useQueryClient();

  const { data: purchases = [] } = useQuery({
    queryKey: ["ceasa-purchases"],
    queryFn: () => base44.entities.CeasaPurchase.list("-date")
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["ceasa-suppliers"],
    queryFn: () => base44.entities.CeasaSupplier.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["ceasa-products"],
    queryFn: () => base44.entities.CeasaProduct.list()
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

  const [newItem, setNewItem] = useState({ product_id: "", product_name: "", quantity: "", unit_type: "kg", unit_price: "", boxes: "", price_per_box: "", cost_per_kg: "", box_weight_kg: "", total_price: 0 });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CeasaPurchase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ceasa-purchases"] });
      setDeletePurchase(null);
    }
  });

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => String(s.id) === String(supplierId));
    setForm(prev => ({ ...prev, supplier_id: supplierId, supplier_name: supplier?.name || "", items: [] }));
    setNewItem({ product_id: "", product_name: "", quantity: "", unit_type: "kg", unit_price: "", total_price: 0 });
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => String(p.id) === String(productId));
    if (product) {
      // Mapear price_type para unit_type compatível
      const unitMap = { per_kg: "kg", per_box: "box", per_unit: "unit", per_dozen: "dozen" };
      setNewItem({
        product_id: productId,
        product_name: product.name,
        price_type: product.price_type,
        box_weight_kg: product.box_weight_kg || "",
        unit_type: unitMap[product.price_type] || "kg",
        quantity: "",
        unit_price: product.default_price?.toString() || "",
        boxes: "",
        price_per_box: "",
        cost_per_kg: "",
        total_price: 0
      });
    }
  };

  const calculateItemTotal = () => {
    const product = products.find(p => String(p.id) === String(newItem.product_id));
    if (!product) return 0;

    // Cenário 1: Preço por kg (compra direto em kg)
    if (product.price_type === "per_kg") {
      const kg = parseFloat(newItem.quantity) || 0;
      const priceKg = parseFloat(newItem.unit_price) || 0;
      return kg * priceKg;
    }

    // Cenário 2: Preço por caixa COM peso fixo (ex: tomate 25kg/caixa)
    if (product.price_type === "per_box" && product.box_weight_kg) {
      const boxes = parseFloat(newItem.boxes) || 0;
      const pricePerBox = parseFloat(newItem.price_per_box) || 0;
      return boxes * pricePerBox;
    }

    // Cenário 3: Preço por caixa SEM peso fixo
    if (product.price_type === "per_box" && !product.box_weight_kg) {
      const boxes = parseFloat(newItem.boxes) || 0;
      const pricePerBox = parseFloat(newItem.price_per_box) || 0;
      return boxes * pricePerBox;
    }

    // Outros tipos (unidade, dúzia)
    const qty = parseFloat(newItem.quantity) || 0;
    const price = parseFloat(newItem.unit_price) || 0;
    return qty * price;
  };

  const handleAddItem = () => {
    if (!newItem.product_id) return;
    
    const product = products.find(p => String(p.id) === String(newItem.product_id));
    if (!product) return;

    let itemData = {};
    const itemTotal = calculateItemTotal();

    // Cenário 1: Preço por kg
    if (product.price_type === "per_kg") {
      if (!newItem.quantity || !newItem.unit_price) return;
      itemData = {
        product_id: newItem.product_id,
        product_name: newItem.product_name,
        price_type: "per_kg",
        quantity: parseFloat(newItem.quantity),
        unit_type: "kg",
        unit_price: parseFloat(newItem.unit_price),
        total_price: itemTotal
      };
    }
    
    // Cenário 2: Preço por caixa COM peso fixo
    else if (product.price_type === "per_box" && product.box_weight_kg) {
      if (!newItem.boxes || !newItem.price_per_box) return;
      const boxes = parseFloat(newItem.boxes);
      const pricePerBox = parseFloat(newItem.price_per_box);
      const boxWeight = parseFloat(product.box_weight_kg);
      const costPerKg = pricePerBox / boxWeight;
      const totalKg = boxes * boxWeight;
      
      itemData = {
        product_id: newItem.product_id,
        product_name: newItem.product_name,
        price_type: "per_box_fixed",
        boxes: boxes,
        box_weight_kg: boxWeight,
        total_kg: totalKg,
        price_per_box: pricePerBox,
        cost_per_kg: costPerKg,
        unit_type: "box",
        quantity: boxes,
        unit_price: pricePerBox,
        total_price: itemTotal
      };
    }
    
    // Cenário 3: Preço por caixa SEM peso fixo
    else if (product.price_type === "per_box") {
      if (!newItem.boxes || !newItem.price_per_box) return;
      itemData = {
        product_id: newItem.product_id,
        product_name: newItem.product_name,
        price_type: "per_box",
        boxes: parseFloat(newItem.boxes),
        unit_type: "box",
        quantity: parseFloat(newItem.boxes),
        unit_price: parseFloat(newItem.price_per_box),
        total_price: itemTotal
      };
    }
    
    // Outros tipos
    else {
      if (!newItem.quantity || !newItem.unit_price) return;
      const unitMap = { per_unit: "unit", per_dozen: "dozen" };
      itemData = {
        product_id: newItem.product_id,
        product_name: newItem.product_name,
        price_type: product.price_type,
        quantity: parseFloat(newItem.quantity),
        unit_type: unitMap[product.price_type] || "unit",
        unit_price: parseFloat(newItem.unit_price),
        total_price: itemTotal
      };
    }
    
    const newItems = [...form.items, itemData];
    const totalAmount = newItems.reduce((sum, i) => sum + i.total_price, 0);
    
    setForm(prev => ({ ...prev, items: newItems, total_amount: totalAmount }));
    setNewItem({ product_id: "", product_name: "", price_type: "", box_weight_kg: "", quantity: "", unit_type: "kg", unit_price: "", boxes: "", price_per_box: "", cost_per_kg: "", total_price: 0 });
  };

  const handleRemoveItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    const totalAmount = newItems.reduce((sum, i) => sum + i.total_price, 0);
    setForm(prev => ({ ...prev, items: newItems, total_amount: totalAmount }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) return;
    
    await base44.entities.CeasaPurchase.create(form);
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

  const supplierProducts = products.filter(p => String(p.supplier_id) === String(form.supplier_id) && p.status === "active");

  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  // Agrupa compras por data e fornecedor
  const groupedByDate = Object.values(
    filteredPurchases.reduce((acc, purchase) => {
      const dateKey = purchase.date || "sem-data";
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          total: 0,
          suppliers: {}
        };
      }

      const supplierKey = purchase.supplier_id || "sem-fornecedor";
      if (!acc[dateKey].suppliers[supplierKey]) {
        acc[dateKey].suppliers[supplierKey] = {
          supplier_id: purchase.supplier_id,
          supplier_name: purchase.supplier_name || "Sem fornecedor",
          total: 0,
          purchases: []
        };
      }

      acc[dateKey].total += purchase.total_amount || 0;
      acc[dateKey].suppliers[supplierKey].total += purchase.total_amount || 0;
      acc[dateKey].suppliers[supplierKey].purchases.push(purchase);
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const toggleDate = (dateKey) => setOpenDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));
  const toggleSupplier = (dateKey, supplierKey) => {
    const key = `${dateKey}|${supplierKey}`;
    setOpenSuppliers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCurrency = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Compras CEASA</h1>
          <p className="text-slate-400">Registre as compras realizadas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
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
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos fornecedores</SelectItem>
                  {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)} className="text-white hover:bg-slate-700 cursor-pointer">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista agrupada por data e fornecedor */}
      <div className="space-y-3">
        {groupedByDate.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center text-slate-400">Nenhuma compra registrada</div>
        ) : (
          groupedByDate.map(dateGroup => {
            const dateKey = dateGroup.date;
            const isDateOpen = openDates[dateKey];
            const suppliersArr = Object.values(dateGroup.suppliers).sort((a, b) => (a.supplier_name || '').localeCompare(b.supplier_name || ''));
            return (
              <div key={dateKey} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleDate(dateKey)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800">
                  <div className="flex items-center gap-3 text-left">
                    <div className="text-white font-semibold">{moment(dateKey).format("DD/MM/YYYY")}</div>
                    <div className="text-slate-400 text-sm">{suppliersArr.length} fornecedor(es)</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-green-400 font-bold">{formatCurrency(dateGroup.total)}</div>
                    <Badge className="bg-slate-700 text-slate-200">{isDateOpen ? "Fechar" : "Abrir"}</Badge>
                  </div>
                </button>

                {isDateOpen && (
                  <div className="border-t border-slate-700 divide-y divide-slate-700">
                    {suppliersArr.map(sup => {
                      const supKey = sup.supplier_id || sup.supplier_name;
                      const openKey = `${dateKey}|${supKey}`;
                      const isSupOpen = openSuppliers[openKey];
                      const totalItems = sup.purchases.reduce((acc, p) => acc + (p.items?.length || 0), 0);
                      return (
                        <div key={openKey} className="bg-slate-900/40">
                          <button type="button" onClick={() => toggleSupplier(dateKey, supKey)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900">
                            <div className="flex items-center gap-3 text-left">
                              <div className="text-white font-medium">{sup.supplier_name}</div>
                              <div className="text-slate-400 text-sm">{totalItems} item(ns)</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-green-400 font-bold">{formatCurrency(sup.total)}</div>
                              <Badge className="bg-slate-700 text-slate-200">{isSupOpen ? "Fechar" : "Ver produtos"}</Badge>
                            </div>
                          </button>

                          {isSupOpen && (
                            <div className="border-t border-slate-800 p-3 space-y-3">
                              {sup.purchases.map(purchase => (
                                <div key={purchase.id} className="bg-slate-800/60 rounded-lg border border-slate-700">
                                  <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-b border-slate-700">
                                    <div className="text-slate-300 text-sm">Pagamento: {paymentLabels[purchase.payment_method]}</div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={purchase.paid ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}>
                                        {purchase.paid ? "Pago" : "Pendente"}
                                      </Badge>
                                      <div className="text-green-400 font-semibold">{formatCurrency(purchase.total_amount)}</div>
                                      <Button size="icon" variant="ghost" onClick={() => setDeletePurchase(purchase)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-slate-700">
                                          <TableHead className="text-slate-300">Produto</TableHead>
                                          <TableHead className="text-slate-300">Qtd</TableHead>
                                          <TableHead className="text-slate-300">Preço Unit.</TableHead>
                                          <TableHead className="text-slate-300">Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {purchase.items?.map((item, idx) => (
                                          <TableRow key={idx} className="border-slate-700">
                                            <TableCell className="text-white">
                                              {item.product_name}
                                              {item.price_type === "per_box_fixed" && item.box_weight_kg && (
                                                <div className="text-xs text-slate-400 mt-1">
                                                  {item.total_kg?.toFixed(2)} kg total | {formatCurrency(item.cost_per_kg)}/kg
                                                </div>
                                              )}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                              {item.price_type === "per_box_fixed" || item.price_type === "per_box" 
                                                ? `${item.boxes} ${item.boxes === 1 ? "caixa" : "caixas"}`
                                                : `${item.quantity} kg`
                                              }
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                              {item.price_type === "per_box_fixed" || item.price_type === "per_box"
                                                ? formatCurrency(item.unit_price) + "/cx"
                                                : formatCurrency(item.unit_price) + "/kg"
                                              }
                                            </TableCell>
                                            <TableCell className="text-green-400">{formatCurrency(item.total_price)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
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
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    {suppliers.filter(s => s.status === "active").map(s => <SelectItem key={s.id} value={String(s.id)} className="text-white hover:bg-slate-700 cursor-pointer">{s.name}</SelectItem>)}
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
                      <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                        {supplierProducts.map(p => <SelectItem key={p.id} value={String(p.id)} className="text-white hover:bg-slate-700 cursor-pointer">{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Cenário 1: Preço por kg */}
                  {newItem.price_type === "per_kg" && (
                    <>
                      <div>
                        <Input type="number" step="0.01" placeholder="Qtd (kg)" value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                      <div>
                        <Input type="number" step="0.01" placeholder="R$/kg" value={newItem.unit_price} onChange={(e) => setNewItem(p => ({ ...p, unit_price: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                    </>
                  )}
                  
                  {/* Cenário 2: Caixa com peso fixo */}
                  {newItem.price_type === "per_box" && newItem.box_weight_kg && (
                    <>
                      <div>
                        <Input type="number" step="1" placeholder="Caixas" value={newItem.boxes} onChange={(e) => setNewItem(p => ({ ...p, boxes: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                      <div>
                        <Input type="number" step="0.01" placeholder="R$/caixa" value={newItem.price_per_box} onChange={(e) => setNewItem(p => ({ ...p, price_per_box: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                    </>
                  )}

                  {/* Cenário 3: Caixa sem peso fixo (usa R$/caixa) */}
                  {newItem.price_type === "per_box" && !newItem.box_weight_kg && (
                    <>
                      <div>
                        <Input type="number" step="1" placeholder="Caixas" value={newItem.boxes} onChange={(e) => setNewItem(p => ({ ...p, boxes: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                      <div>
                        <Input type="number" step="0.01" placeholder="R$/caixa" value={newItem.price_per_box} onChange={(e) => setNewItem(p => ({ ...p, price_per_box: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                    </>
                  )}
                  
                  {/* Outros tipos (per_unit, per_dozen) */}
                  {newItem.price_type && newItem.price_type !== "per_kg" && newItem.price_type !== "per_box" && (
                    <>
                      <div>
                        <Input type="number" step="0.01" placeholder="Qtd (kg)" value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                      <div>
                        <Input type="number" step="0.01" placeholder="Preço" value={newItem.unit_price} onChange={(e) => setNewItem(p => ({ ...p, unit_price: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <Button type="button" onClick={handleAddItem} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Mostrar informações calculadas para caixa com peso fixo */}
                {newItem.price_type === "per_box" && newItem.box_weight_kg && newItem.boxes && newItem.price_per_box && (
                  <p className="text-sm text-slate-400">
                    Peso total: {(parseFloat(newItem.boxes) * parseFloat(newItem.box_weight_kg)).toFixed(2)} kg | 
                    Custo/kg: {formatCurrency(parseFloat(newItem.price_per_box) / parseFloat(newItem.box_weight_kg))} | 
                    Subtotal: {formatCurrency(calculateItemTotal())}
                  </p>
                )}
                
                {/* Mostrar subtotal para outros cenários */}
                {((newItem.price_type === "per_kg" && newItem.quantity && newItem.unit_price) ||
                  (newItem.price_type === "per_box" && !newItem.box_weight_kg && newItem.boxes && newItem.price_per_box) ||
                  (newItem.price_type !== "per_kg" && newItem.price_type !== "per_box" && newItem.quantity && newItem.unit_price)) && (
                  <p className="text-sm text-slate-400">
                    Subtotal: {formatCurrency(calculateItemTotal())}
                  </p>
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
                        <TableCell className="text-white">
                          {item.product_name}
                          {item.price_type === "per_box_fixed" && item.box_weight_kg && (
                            <div className="text-xs text-slate-400 mt-1">
                              {item.total_kg?.toFixed(2)} kg total | {formatCurrency(item.cost_per_kg)}/kg
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {item.price_type === "per_box_fixed" || item.price_type === "per_box" 
                            ? `${item.boxes} caixas`
                            : `${item.quantity} ${item.unit_type === "unit" ? "kg" : unitLabels[item.unit_type] || ""}`
                          }
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {item.price_type === "per_box_fixed" || item.price_type === "per_box"
                            ? formatCurrency(item.unit_price) + "/cx"
                            : formatCurrency(item.unit_price)
                          }
                        </TableCell>
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
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    <SelectItem value="cash" className="text-white hover:bg-slate-700 cursor-pointer">Dinheiro</SelectItem>
                    <SelectItem value="pix" className="text-white hover:bg-slate-700 cursor-pointer">PIX</SelectItem>
                    <SelectItem value="credit" className="text-white hover:bg-slate-700 cursor-pointer">Crédito</SelectItem>
                    <SelectItem value="debit" className="text-white hover:bg-slate-700 cursor-pointer">Débito</SelectItem>
                    <SelectItem value="invoice" className="text-white hover:bg-slate-700 cursor-pointer">Boleto</SelectItem>
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancelar</Button>
              <Button type="submit" disabled={form.items.length === 0} className="bg-blue-600 hover:bg-blue-700">Salvar Compra</Button>
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
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deletePurchase.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}