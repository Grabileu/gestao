import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Store, Receipt, Umbrella, Gift, AlertCircle, Settings as SettingsIcon, Plus, Pencil, Trash2 } from "lucide-react";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => api.entities.SystemConfig.list()
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.entities.Store.list()
  });

  const [config, setConfig] = useState({
    name: "default",
    voucher_lost_penalty: 5,
    voucher_lost_penalty_additional: 5,
    basket_bonus_value: 100,
    basket_bonus_enabled: true,
    basket_lose_on_absence: true,
    basket_lose_on_medical: true,
    basket_lose_on_late: true,
    absence_discount_per_day: 0,
    absence_discount_dsr: true,
    medical_discount_enabled: false,
    medical_max_days_no_discount: 15,
    vacation_days: 30,
    vacation_bonus_enabled: true,
    vacation_sell_max_days: 10
  });

  const [saving, setSaving] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [deleteStore, setDeleteStore] = useState(null);
  const [storeForm, setStoreForm] = useState({ name: "", code: "", address: "", city: "", state: "", manager: "", status: "active" });

  useEffect(() => {
    if (configs.length > 0) {
      setConfig(prev => ({ ...prev, ...configs[0] }));
    }
  }, [configs]);

  const handleSaveConfig = async () => {
    setSaving(true);
    if (configs.length > 0 && configs[0].id) {
      await api.entities.SystemConfig.update(configs[0].id, config);
    } else {
      await api.entities.SystemConfig.create(config);
    }
    queryClient.invalidateQueries({ queryKey: ["system-config"] });
    setSaving(false);
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    if (editingStore?.id) {
      await api.entities.Store.update(editingStore.id, storeForm);
    } else {
      await api.entities.Store.create(storeForm);
    }
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    setShowStoreForm(false);
    setEditingStore(null);
    setStoreForm({ name: "", code: "", address: "", city: "", state: "", manager: "", status: "active" });
  };

  const handleDeleteStore = async () => {
    await api.entities.Store.delete(deleteStore.id);
    queryClient.invalidateQueries({ queryKey: ["stores"] });
    setDeleteStore(null);
  };

  const SwitchField = ({ label, desc, field }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-slate-800 rounded-lg">
      <div>
        <Label className="text-slate-300">{label}</Label>
        {desc && <p className="text-xs text-slate-500">{desc}</p>}
      </div>
      <Switch checked={config[field]} onCheckedChange={(v) => setConfig(prev => ({ ...prev, [field]: v }))} />
    </div>
  );

  const NumberField = ({ label, field, step = 1, suffix = "" }) => (
    <div>
      <Label className="text-slate-300">{label}</Label>
      <div className="flex items-center gap-2">
        <Input type="number" step={step} value={config[field]} onChange={(e) => setConfig(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))} className="bg-slate-900 border-slate-600 text-white" />
        {suffix && <span className="text-slate-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações do Sistema</h1>
          <p className="text-slate-400">Configure todas as opções do GUF System</p>
        </div>
      </div>

      <Tabs defaultValue="lojas" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="lojas" className="data-[state=active]:bg-blue-600">Lojas</TabsTrigger>
          <TabsTrigger value="caixa" className="data-[state=active]:bg-blue-600">Quebra de Caixa</TabsTrigger>
          <TabsTrigger value="faltas" className="data-[state=active]:bg-blue-600">Faltas</TabsTrigger>
          <TabsTrigger value="ferias" className="data-[state=active]:bg-blue-600">Férias</TabsTrigger>
          <TabsTrigger value="cesta" className="data-[state=active]:bg-blue-600">Cesta Bonificação</TabsTrigger>
        </TabsList>

        {/* Lojas */}
        <TabsContent value="lojas">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg"><Store className="h-5 w-5 text-blue-400" /></div>
                <div>
                  <CardTitle className="text-white">Lojas</CardTitle>
                  <CardDescription className="text-slate-400">Gerencie as lojas do sistema</CardDescription>
                </div>
              </div>
              <Button onClick={() => setShowStoreForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />Nova Loja
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Código</TableHead>
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Cidade</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id} className="border-slate-700">
                      <TableCell className="text-white font-mono">{store.code}</TableCell>
                      <TableCell className="text-white">{store.name}</TableCell>
                      <TableCell className="text-slate-300">{store.city}/{store.state}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded text-xs ${store.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{store.status === "active" ? "Ativa" : "Inativa"}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => { setStoreForm(store); setEditingStore(store); setShowStoreForm(true); }} className="text-slate-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteStore(store)} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quebra de Caixa */}
        <TabsContent value="caixa">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg"><Receipt className="h-5 w-5 text-red-400" /></div>
                <div>
                  <CardTitle className="text-white">Quebra de Caixa</CardTitle>
                  <CardDescription className="text-slate-400">Configurações de multas por comprovantes perdidos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumberField label="Multa por Comprovante Perdido" field="voucher_lost_penalty" step={0.01} suffix="R$" />
              <NumberField label="Multa Adicional (cada comprovante a mais)" field="voucher_lost_penalty_additional" step={0.01} suffix="R$" />
              <p className="text-xs text-slate-500">Para cartões (crédito, débito, alimentação, POS, Pix), será descontado automaticamente R$ {config.voucher_lost_penalty} por comprovante perdido.</p>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveConfig} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </TabsContent>

        {/* Faltas */}
        <TabsContent value="faltas">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg"><AlertCircle className="h-5 w-5 text-yellow-400" /></div>
                <div>
                  <CardTitle className="text-white">Faltas e Atestados</CardTitle>
                  <CardDescription className="text-slate-400">Configurações de descontos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SwitchField label="Descontar DSR na Falta" desc="Perde o descanso semanal remunerado" field="absence_discount_dsr" />
              <SwitchField label="Descontar Atestados" desc="Desconta dias de atestado médico" field="medical_discount_enabled" />
              <NumberField label="Dias de Atestado sem Desconto (INSS)" field="medical_max_days_no_discount" suffix="dias" />
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveConfig} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </TabsContent>

        {/* Férias */}
        <TabsContent value="ferias">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg"><Umbrella className="h-5 w-5 text-green-400" /></div>
                <div>
                  <CardTitle className="text-white">Férias</CardTitle>
                  <CardDescription className="text-slate-400">Configurações de férias</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumberField label="Dias de Férias" field="vacation_days" suffix="dias" />
              <SwitchField label="1/3 Constitucional" desc="Pagar adicional de 1/3 nas férias" field="vacation_bonus_enabled" />
              <NumberField label="Máximo de Dias para Vender (Abono)" field="vacation_sell_max_days" suffix="dias" />
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveConfig} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </TabsContent>

        {/* Cesta Bonificação */}
        <TabsContent value="cesta">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg"><Gift className="h-5 w-5 text-pink-400" /></div>
                <div>
                  <CardTitle className="text-white">Cesta de Bonificação</CardTitle>
                  <CardDescription className="text-slate-400">Bonificação para funcionários sem faltas/atrasos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SwitchField label="Cesta de Bonificação Ativa" desc="Habilita a cesta de bonificação" field="basket_bonus_enabled" />
              {config.basket_bonus_enabled && (
                <>
                  <NumberField label="Valor da Cesta" field="basket_bonus_value" step={0.01} suffix="R$" />
                  <SwitchField label="Perde Cesta se Tiver Falta" field="basket_lose_on_absence" />
                  <SwitchField label="Perde Cesta se Tiver Atestado" field="basket_lose_on_medical" />
                  <SwitchField label="Perde Cesta se Tiver Atraso" field="basket_lose_on_late" />
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveConfig} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Store Form */}
      <Dialog open={showStoreForm} onOpenChange={() => { setShowStoreForm(false); setEditingStore(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingStore ? "Editar Loja" : "Nova Loja"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Código *</Label>
                <Input value={storeForm.code} onChange={(e) => setStoreForm(p => ({ ...p, code: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
              <div>
                <Label className="text-slate-300">Nome *</Label>
                <Input value={storeForm.name} onChange={(e) => setStoreForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" required />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Endereço</Label>
              <Input value={storeForm.address} onChange={(e) => setStoreForm(p => ({ ...p, address: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Cidade</Label>
                <Input value={storeForm.city} onChange={(e) => setStoreForm(p => ({ ...p, city: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Estado</Label>
                <Input value={storeForm.state} onChange={(e) => setStoreForm(p => ({ ...p, state: e.target.value }))} className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Status</Label>
              <Select value={storeForm.status} onValueChange={(v) => setStoreForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowStoreForm(false)} className="border-slate-600">Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Store */}
      <AlertDialog open={!!deleteStore} onOpenChange={() => setDeleteStore(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Deseja excluir a loja "{deleteStore?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStore} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}