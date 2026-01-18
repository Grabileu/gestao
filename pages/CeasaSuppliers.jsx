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
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";

export default function CeasaSuppliers() {
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteSupplier, setDeleteSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [showProducts, setShowProducts] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const queryClient = useQueryClient();

  const { data: suppliers = [] } = useQuery({
    queryKey: ["ceasa-suppliers"],
    queryFn: () => base44.entities.CeasaSupplier.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["ceasa-products"],
    queryFn: () => base44.entities.CeasaProduct.list()
  });

  const [supplierForm, setSupplierForm] = useState({
    name: "", contact_name: "", phone: "", email: "", address: "", status: "active", observations: ""
  });

  const [productForm, setProductForm] = useState({
    name: "", supplier_id: "", supplier_name: "", price_type: "per_box", default_price: "", box_weight_kg: "", category: "fruit", status: "active"
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CeasaSupplier.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ceasa-suppliers"] });
      setDeleteSupplier(null);
    }
  });

  const handleEditSupplier = (supplier) => {
    setSupplierForm(supplier);
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (editingSupplier?.id) {
      await base44.entities.CeasaSupplier.update(editingSupplier.id, supplierForm);
    } else {
      await base44.entities.CeasaSupplier.create(supplierForm);
    }
    queryClient.invalidateQueries({ queryKey: ["ceasa-suppliers"] });
    setShowForm(false);
    setEditingSupplier(null);
    setSupplierForm({ name: "", contact_name: "", phone: "", email: "", address: "", status: "active", observations: "" });
  };

  const handleShowProducts = (supplier) => {
    setShowProducts(supplier);
    setProductForm(prev => ({ ...prev, supplier_id: supplier.id, supplier_name: supplier.name }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const data = { 
      ...productForm, 
      default_price: 0,
      box_weight_kg: productForm.price_type === "per_box" ? parseFloat(productForm.box_weight_kg) || 0 : null
    };
    if (editingProduct?.id) {
      await base44.entities.CeasaProduct.update(editingProduct.id, data);
    } else {
      await base44.entities.CeasaProduct.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ["ceasa-products"] });
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({ name: "", supplier_id: showProducts?.id || "", supplier_name: showProducts?.name || "", price_type: "per_box", default_price: "", box_weight_kg: "", category: "fruit", status: "active" });
  };

  const handleDeleteProduct = async (product) => {
    await base44.entities.CeasaProduct.delete(product.id);
    queryClient.invalidateQueries({ queryKey: ["ceasa-products"] });
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const supplierProducts = products.filter(p => p.supplier_id === showProducts?.id);

  const priceTypeLabels = { per_box: "Por Caixa (quantidade fixa)", per_unit: "Por Unidade", per_kg: "Por Kg (legado)", per_dozen: "Por Dúzia (legado)" };
  const categoryLabels = { fruit: "Fruta", vegetable: "Legume", greens: "Verdura", other: "Outro" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Fornecedores CEASA</h1>
          <p className="text-slate-400">Gerencie os fornecedores e seus produtos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Nome</TableHead>
              <TableHead className="text-slate-300">Contato</TableHead>
              <TableHead className="text-slate-300">Telefone</TableHead>
              <TableHead className="text-slate-300">Endereço/Box</TableHead>
              <TableHead className="text-slate-300">Produtos</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  Nenhum fornecedor cadastrado
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">{supplier.name}</TableCell>
                  <TableCell className="text-slate-300">{supplier.contact_name || "-"}</TableCell>
                  <TableCell className="text-slate-300">{supplier.phone || "-"}</TableCell>
                  <TableCell className="text-slate-300">{supplier.address || "-"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleShowProducts(supplier)} className="border-slate-600 text-slate-300">
                      <Package className="h-4 w-4 mr-1" />
                      {products.filter(p => p.supplier_id === supplier.id).length}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge className={supplier.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {supplier.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEditSupplier(supplier)} className="text-slate-400 hover:text-white">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteSupplier(supplier)} className="text-slate-400 hover:text-red-400">
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

      {/* Supplier Form */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditingSupplier(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSupplier} className="space-y-4">
            <div>
              <Label className="text-slate-300">Nome *</Label>
              <Input value={supplierForm.name} onChange={(e) => setSupplierForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Contato</Label>
                <Input value={supplierForm.contact_name} onChange={(e) => setSupplierForm(p => ({ ...p, contact_name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Telefone</Label>
                <Input value={supplierForm.phone} onChange={(e) => setSupplierForm(p => ({ ...p, phone: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Endereço/Box</Label>
              <Input value={supplierForm.address} onChange={(e) => setSupplierForm(p => ({ ...p, address: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Observações</Label>
              <Textarea value={supplierForm.observations} onChange={(e) => setSupplierForm(p => ({ ...p, observations: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Modal */}
      <Dialog open={!!showProducts} onOpenChange={() => setShowProducts(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Produtos - {showProducts?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={() => { setProductForm(p => ({ ...p, supplier_id: showProducts?.id, supplier_name: showProducts?.name })); setShowProductForm(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
            </Button>
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Produto</TableHead>
                    <TableHead className="text-slate-300">Categoria</TableHead>
                    <TableHead className="text-slate-300">Tipo de Custo</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-4">Nenhum produto</TableCell></TableRow>
                  ) : (
                    supplierProducts.map((product) => (
                      <TableRow key={product.id} className="border-slate-700">
                        <TableCell className="text-white">{product.name}</TableCell>
                        <TableCell className="text-slate-300">{categoryLabels[product.category]}</TableCell>
                        <TableCell className="text-slate-300">
                          {priceTypeLabels[product.price_type]}
                          {product.price_type === "per_box" && product.box_weight_kg && (
                            <span className="text-xs text-slate-500 block">({product.box_weight_kg}kg)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => { 
                              const safeType = product.price_type === "per_unit" ? "per_unit" : "per_box";
                              setProductForm({ ...product, price_type: safeType }); 
                              setEditingProduct(product); 
                              setShowProductForm(true); 
                            }} className="text-slate-400 hover:text-white">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteProduct(product)} className="text-slate-400 hover:text-red-400">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Form */}
      <Dialog open={showProductForm} onOpenChange={() => { setShowProductForm(false); setEditingProduct(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <Label className="text-slate-300">Nome do Produto *</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Categoria</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    <SelectItem value="fruit" className="text-white hover:bg-slate-700 cursor-pointer">Fruta</SelectItem>
                    <SelectItem value="vegetable" className="text-white hover:bg-slate-700 cursor-pointer">Legume</SelectItem>
                    <SelectItem value="greens" className="text-white hover:bg-slate-700 cursor-pointer">Verdura</SelectItem>
                    <SelectItem value="other" className="text-white hover:bg-slate-700 cursor-pointer">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Tipo de Custo *</Label>
                <Select value={productForm.price_type} onValueChange={(v) => setProductForm(p => ({ ...p, price_type: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    <SelectItem value="per_box" className="text-white hover:bg-slate-700 cursor-pointer">Por Caixa (quantidade fixa)</SelectItem>
                    <SelectItem value="per_unit" className="text-white hover:bg-slate-700 cursor-pointer">Por Unidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {productForm.price_type === "per_box" && (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                <Label className="text-slate-300">Peso da Caixa (kg)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="Ex: 20" 
                  value={productForm.box_weight_kg} 
                  onChange={(e) => setProductForm(p => ({ ...p, box_weight_kg: e.target.value }))} 
                  className="bg-slate-800 border-slate-600 text-white mt-1" 
                />
                <p className="text-xs text-slate-500 mt-1">Informe o peso médio da caixa para calcular o custo por kg</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowProductForm(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteSupplier} onOpenChange={() => setDeleteSupplier(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir o fornecedor "{deleteSupplier?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteSupplier.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}