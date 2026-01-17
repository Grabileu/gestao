import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Receipt, Gift, AlertCircle } from "lucide-react";

export default function SystemSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: configs = [] } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => base44.entities.SystemConfig.list()
  });

  const config = configs[0] || {
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
  };

  const [form, setForm] = useState(config);

  React.useEffect(() => {
    if (configs.length > 0) {
      setForm(configs[0]);
    }
  }, [configs]);

  const handleSave = async () => {
    setSaving(true);
    if (config.id) {
      await base44.entities.SystemConfig.update(config.id, form);
    } else {
      await base44.entities.SystemConfig.create(form);
    }
    queryClient.invalidateQueries({ queryKey: ["system-config"] });
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações do Sistema</h1>
          <p className="text-slate-400">Configure parâmetros gerais do Sistema GUF</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <Tabs defaultValue="cashbreak" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="cashbreak" className="data-[state=active]:bg-blue-600">
            <Receipt className="h-4 w-4 mr-2" />Quebra de Caixa
          </TabsTrigger>
          <TabsTrigger value="basket" className="data-[state=active]:bg-blue-600">
            <Gift className="h-4 w-4 mr-2" />Cesta Bonificação
          </TabsTrigger>
          <TabsTrigger value="absence" className="data-[state=active]:bg-blue-600">
            <AlertCircle className="h-4 w-4 mr-2" />Faltas e Férias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashbreak">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configurações de Quebra de Caixa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-300">Multa por Comprovante Perdido (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.voucher_lost_penalty || 5}
                    onChange={(e) => setForm(p => ({ ...p, voucher_lost_penalty: parseFloat(e.target.value) || 0 }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Valor cobrado por cada comprovante perdido</p>
                </div>
                <div>
                  <Label className="text-slate-300">Multa Adicional por Múltiplas Perdas (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.voucher_lost_penalty_additional || 5}
                    onChange={(e) => setForm(p => ({ ...p, voucher_lost_penalty_additional: parseFloat(e.target.value) || 0 }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Valor adicional para cada comprovante extra perdido</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="basket">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cesta de Bonificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div>
                  <Label className="text-slate-300">Cesta de Bonificação Ativa</Label>
                  <p className="text-xs text-slate-500">Habilitar/desabilitar cesta para funcionários</p>
                </div>
                <Switch
                  checked={form.basket_bonus_enabled}
                  onCheckedChange={(v) => setForm(p => ({ ...p, basket_bonus_enabled: v }))}
                />
              </div>

              {form.basket_bonus_enabled && (
                <>
                  <div>
                    <Label className="text-slate-300">Valor da Cesta (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.basket_bonus_value || 100}
                      onChange={(e) => setForm(p => ({ ...p, basket_bonus_value: parseFloat(e.target.value) || 0 }))}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-300">Condições para Perda da Cesta</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                        <span className="text-slate-300">Perde cesta se tiver falta</span>
                        <Switch
                          checked={form.basket_lose_on_absence}
                          onCheckedChange={(v) => setForm(p => ({ ...p, basket_lose_on_absence: v }))}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                        <span className="text-slate-300">Perde cesta se tiver atestado médico</span>
                        <Switch
                          checked={form.basket_lose_on_medical}
                          onCheckedChange={(v) => setForm(p => ({ ...p, basket_lose_on_medical: v }))}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                        <span className="text-slate-300">Perde cesta se tiver atraso</span>
                        <Switch
                          checked={form.basket_lose_on_late}
                          onCheckedChange={(v) => setForm(p => ({ ...p, basket_lose_on_late: v }))}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absence">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configurações de Faltas e Férias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-300">Dias de Férias</Label>
                  <Input
                    type="number"
                    value={form.vacation_days || 30}
                    onChange={(e) => setForm(p => ({ ...p, vacation_days: parseInt(e.target.value) || 30 }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Máximo de Dias para Vender</Label>
                  <Input
                    type="number"
                    value={form.vacation_sell_max_days || 10}
                    onChange={(e) => setForm(p => ({ ...p, vacation_sell_max_days: parseInt(e.target.value) || 10 }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div>
                  <Label className="text-slate-300">1/3 de Férias (Abono)</Label>
                  <p className="text-xs text-slate-500">Habilitar pagamento de 1/3 constitucional</p>
                </div>
                <Switch
                  checked={form.vacation_bonus_enabled}
                  onCheckedChange={(v) => setForm(p => ({ ...p, vacation_bonus_enabled: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div>
                  <Label className="text-slate-300">Descontar DSR nas Faltas</Label>
                  <p className="text-xs text-slate-500">Desconta descanso semanal remunerado</p>
                </div>
                <Switch
                  checked={form.absence_discount_dsr}
                  onCheckedChange={(v) => setForm(p => ({ ...p, absence_discount_dsr: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <div>
                  <Label className="text-slate-300">Descontar Atestados</Label>
                  <p className="text-xs text-slate-500">Descontar dias de atestado médico</p>
                </div>
                <Switch
                  checked={form.medical_discount_enabled}
                  onCheckedChange={(v) => setForm(p => ({ ...p, medical_discount_enabled: v }))}
                />
              </div>

              {form.medical_discount_enabled && (
                <div>
                  <Label className="text-slate-300">Dias de Atestado sem Desconto</Label>
                  <Input
                    type="number"
                    value={form.medical_max_days_no_discount || 15}
                    onChange={(e) => setForm(p => ({ ...p, medical_max_days_no_discount: parseInt(e.target.value) || 15 }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Após esse período, INSS assume o pagamento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}