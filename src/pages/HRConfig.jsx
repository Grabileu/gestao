import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Clock, Percent, Receipt, Calculator, Umbrella, AlertCircle, Calendar, DollarSign } from "lucide-react";

export default function HRConfig() {
  const queryClient = useQueryClient();
  
  const { data: configs = [] } = useQuery({
    queryKey: ["hr-config"],
    queryFn: () => api.entities.HRConfig.list()
  });

  const [formData, setFormData] = useState({
    name: "default",
    // Jornada
    work_hours_per_day: 8,
    work_days_per_month: 22,
    // Horas extras
    overtime_50_percent: 50,
    overtime_100_percent: 100,
    // Adicionais
    night_shift_percent: 20,
    hazard_pay_percent: 30,
    unhealthy_pay_percent: 20,
    // Faltas
    absence_discount_enabled: true,
    absence_discount_dsr: true,
    medical_certificate_discount: false,
    max_medical_days_no_discount: 15,
    // Férias
    vacation_days: 30,
    vacation_bonus_percent: 33.33,
    max_vacation_sell_days: 10,
    vacation_anticipation_days: 2,
    // 13º
    thirteenth_first_installment_month: 11,
    thirteenth_second_installment_month: 12,
    // Impostos
    inss_enabled: true,
    irrf_enabled: true,
    fgts_percent: 8,
    fgts_enabled: true,
    // Benefícios
    vt_discount_percent: 6,
    vt_enabled: true,
    vr_value: 0,
    vr_discount_percent: 0,
    // Tolerâncias
    late_tolerance_minutes: 10,
    early_leave_tolerance_minutes: 10,
    // Contratos
    probation_period_days: 90,
    notice_period_days: 30
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (configs.length > 0) {
      setFormData(prev => ({ ...prev, ...configs[0] }));
    }
  }, [configs]);

  const handleSave = async () => {
    setSaving(true);
    if (configs.length > 0 && configs[0].id) {
      await api.entities.HRConfig.update(configs[0].id, formData);
    } else {
      await api.entities.HRConfig.create(formData);
    }
    queryClient.invalidateQueries({ queryKey: ["hr-config"] });
    setSaving(false);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações de RH</h1>
          <p className="text-slate-400">Configure todos os parâmetros de cálculos trabalhistas</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <Tabs defaultValue="jornada" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="jornada" className="data-[state=active]:bg-blue-600">Jornada</TabsTrigger>
          <TabsTrigger value="faltas" className="data-[state=active]:bg-blue-600">Faltas</TabsTrigger>
          <TabsTrigger value="ferias" className="data-[state=active]:bg-blue-600">Férias</TabsTrigger>
          <TabsTrigger value="adicionais" className="data-[state=active]:bg-blue-600">Adicionais</TabsTrigger>
          <TabsTrigger value="impostos" className="data-[state=active]:bg-blue-600">Impostos</TabsTrigger>
          <TabsTrigger value="beneficios" className="data-[state=active]:bg-blue-600">Benefícios</TabsTrigger>
          <TabsTrigger value="contratos" className="data-[state=active]:bg-blue-600">Contratos</TabsTrigger>
        </TabsList>

        {/* Jornada */}
        <TabsContent value="jornada">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Jornada de Trabalho</CardTitle>
                    <CardDescription className="text-slate-400">Horas e dias de trabalho</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Horas por dia</Label>
                  <Input type="number" value={formData.work_hours_per_day} onChange={(e) => updateField("work_hours_per_day", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Dias úteis por mês</Label>
                  <Input type="number" value={formData.work_days_per_month} onChange={(e) => updateField("work_days_per_month", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Percent className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Horas Extras</CardTitle>
                    <CardDescription className="text-slate-400">Percentuais de hora extra</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Hora Extra Normal (%)</Label>
                  <Input type="number" value={formData.overtime_50_percent} onChange={(e) => updateField("overtime_50_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Hora Extra 100% (%)</Label>
                  <Input type="number" value={formData.overtime_100_percent} onChange={(e) => updateField("overtime_100_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Tolerâncias</CardTitle>
                    <CardDescription className="text-slate-400">Atrasos e saídas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Tolerância de Atraso (minutos)</Label>
                  <Input type="number" value={formData.late_tolerance_minutes} onChange={(e) => updateField("late_tolerance_minutes", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Tolerância Saída Antecipada (minutos)</Label>
                  <Input type="number" value={formData.early_leave_tolerance_minutes} onChange={(e) => updateField("early_leave_tolerance_minutes", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Faltas */}
        <TabsContent value="faltas">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Configurações de Faltas</CardTitle>
                  <CardDescription className="text-slate-400">Descontos e atestados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Descontar Faltas</Label>
                      <p className="text-xs text-slate-500">Desconta automaticamente as faltas do salário</p>
                    </div>
                    <Switch checked={formData.absence_discount_enabled} onCheckedChange={(v) => updateField("absence_discount_enabled", v)} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Descontar DSR na Falta</Label>
                      <p className="text-xs text-slate-500">Desconta o descanso semanal remunerado junto com a falta</p>
                    </div>
                    <Switch checked={formData.absence_discount_dsr} onCheckedChange={(v) => updateField("absence_discount_dsr", v)} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div>
                      <Label className="text-slate-300">Descontar Atestados</Label>
                      <p className="text-xs text-slate-500">Desconta os dias de atestado médico</p>
                    </div>
                    <Switch checked={formData.medical_certificate_discount} onCheckedChange={(v) => updateField("medical_certificate_discount", v)} />
                  </div>
                  
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <Label className="text-slate-300">Dias de Atestado sem Desconto</Label>
                    <p className="text-xs text-slate-500 mb-2">Após esses dias, INSS assume</p>
                    <Input type="number" value={formData.max_medical_days_no_discount} onChange={(e) => updateField("max_medical_days_no_discount", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Férias */}
        <TabsContent value="ferias">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Umbrella className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Configurações de Férias</CardTitle>
                  <CardDescription className="text-slate-400">Dias, abono e 13º salário</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Dias de Férias por Período</Label>
                    <Input type="number" value={formData.vacation_days} onChange={(e) => updateField("vacation_days", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">1/3 Constitucional (%)</Label>
                    <Input type="number" step="0.01" value={formData.vacation_bonus_percent} onChange={(e) => updateField("vacation_bonus_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Máximo de Dias para Vender</Label>
                    <Input type="number" value={formData.max_vacation_sell_days} onChange={(e) => updateField("max_vacation_sell_days", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Dias Antecedência para Pagar Férias</Label>
                    <Input type="number" value={formData.vacation_anticipation_days} onChange={(e) => updateField("vacation_anticipation_days", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">13º Salário</h3>
                  <div>
                    <Label className="text-slate-300">Mês da 1ª Parcela</Label>
                    <Input type="number" min="1" max="12" value={formData.thirteenth_first_installment_month} onChange={(e) => updateField("thirteenth_first_installment_month", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Mês da 2ª Parcela</Label>
                    <Input type="number" min="1" max="12" value={formData.thirteenth_second_installment_month} onChange={(e) => updateField("thirteenth_second_installment_month", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adicionais */}
        <TabsContent value="adicionais">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Adicionais</CardTitle>
                  <CardDescription className="text-slate-400">Noturno, periculosidade e insalubridade</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Adicional Noturno (%)</Label>
                  <Input type="number" value={formData.night_shift_percent} onChange={(e) => updateField("night_shift_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Periculosidade (%)</Label>
                  <Input type="number" value={formData.hazard_pay_percent} onChange={(e) => updateField("hazard_pay_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Insalubridade (%)</Label>
                  <Input type="number" value={formData.unhealthy_pay_percent} onChange={(e) => updateField("unhealthy_pay_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impostos */}
        <TabsContent value="impostos">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Calculator className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Impostos e Encargos</CardTitle>
                  <CardDescription className="text-slate-400">INSS, IRRF e FGTS</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Calcular INSS</Label>
                    <p className="text-xs text-slate-500">Tabela progressiva automática</p>
                  </div>
                  <Switch checked={formData.inss_enabled} onCheckedChange={(v) => updateField("inss_enabled", v)} />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Calcular IRRF</Label>
                    <p className="text-xs text-slate-500">Tabela progressiva automática</p>
                  </div>
                  <Switch checked={formData.irrf_enabled} onCheckedChange={(v) => updateField("irrf_enabled", v)} />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <Label className="text-slate-300">Calcular FGTS</Label>
                    <p className="text-xs text-slate-500">8% sobre remuneração</p>
                  </div>
                  <Switch checked={formData.fgts_enabled} onCheckedChange={(v) => updateField("fgts_enabled", v)} />
                </div>
              </div>
              {formData.fgts_enabled && (
                <div className="max-w-xs">
                  <Label className="text-slate-300">Percentual FGTS (%)</Label>
                  <Input type="number" value={formData.fgts_percent} onChange={(e) => updateField("fgts_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefícios */}
        <TabsContent value="beneficios">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Receipt className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Benefícios</CardTitle>
                  <CardDescription className="text-slate-400">Vale transporte e refeição</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Vale Transporte</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <Label className="text-slate-300">Desconto VT Ativo</Label>
                    <Switch checked={formData.vt_enabled} onCheckedChange={(v) => updateField("vt_enabled", v)} />
                  </div>
                  {formData.vt_enabled && (
                    <div>
                      <Label className="text-slate-300">Desconto VT (%)</Label>
                      <Input type="number" value={formData.vt_discount_percent} onChange={(e) => updateField("vt_discount_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Vale Refeição</h3>
                  <div>
                    <Label className="text-slate-300">Valor VR (R$)</Label>
                    <Input type="number" step="0.01" value={formData.vr_value} onChange={(e) => updateField("vr_value", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Desconto VR (%)</Label>
                    <Input type="number" value={formData.vr_discount_percent} onChange={(e) => updateField("vr_discount_percent", parseFloat(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contratos */}
        <TabsContent value="contratos">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Contratos</CardTitle>
                  <CardDescription className="text-slate-400">Experiência e aviso prévio</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Período de Experiência (dias)</Label>
                  <Input type="number" value={formData.probation_period_days} onChange={(e) => updateField("probation_period_days", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Aviso Prévio (dias)</Label>
                  <Input type="number" value={formData.notice_period_days} onChange={(e) => updateField("notice_period_days", parseInt(e.target.value))} className="bg-slate-900 border-slate-600 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
