import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44SupabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Clock, Percent, Receipt, Calculator, Umbrella, AlertCircle, Calendar, DollarSign, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function HRConfig() {
  const queryClient = useQueryClient();
  
  const { data: configs = [] } = useQuery({
    queryKey: ["hr-config"],
    queryFn: () => base44.entities.HRConfig.list()
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => base44.entities.Department.list()
  });

  // Extrair todos os cargos únicos de todos os departamentos
  const allRoles = Array.from(new Set(
    departments.flatMap(dept => Array.isArray(dept.positions) ? dept.positions : [])
  )).sort();

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
    thirteenth_single_installment: false,
    thirteenth_single_installment_month: 12,
    thirteenth_first_installment_month: 11,
    thirteenth_second_installment_month: 12,
    // Impostos
    inss_enabled: true,
    inss_percent: 11,
    inss_threshold: 5000,
    irrf_enabled: true,
    irrf_percent: 15,
    irrf_threshold: 5000,
    fgts_percent: 8,
    fgts_enabled: true,
    // Benefícios
    vt_enabled: true,
    vt_discount_percent: 6,
    va_enabled: true,
    va_value: 0,
    va_discount_percent: 0,
    vr_enabled: true,
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
      await base44.entities.HRConfig.update(configs[0].id, formData);
    } else {
      await base44.entities.HRConfig.create(formData);
    }
    queryClient.invalidateQueries({ queryKey: ["hr-config"] });
    setSaving(false);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações de RH</h1>
          <p className="text-slate-400">Configure todos os parâmetros de cálculos trabalhistas</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <TooltipProvider>
      <Tabs defaultValue="jornada" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="jornada" className="data-[state=active]:bg-blue-600">Jornada</TabsTrigger>
          <TabsTrigger value="dsr" className="data-[state=active]:bg-blue-600">Faltas e DSR</TabsTrigger>
          <TabsTrigger value="ferias" className="data-[state=active]:bg-blue-600">Férias</TabsTrigger>
          <TabsTrigger value="decimo-terceiro" className="data-[state=active]:bg-blue-600">13º Salário</TabsTrigger>
          <TabsTrigger value="adicionais" className="data-[state=active]:bg-blue-600">Adicionais</TabsTrigger>
          <TabsTrigger value="impostos" className="data-[state=active]:bg-blue-600">Impostos</TabsTrigger>
          <TabsTrigger value="beneficios" className="data-[state=active]:bg-blue-600">Benefícios</TabsTrigger>
          <TabsTrigger value="contratos" className="data-[state=active]:bg-blue-600">Contratos</TabsTrigger>
        </TabsList>
        {/* Faltas e DSR */}
        <TabsContent value="dsr">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Faltas e DSR</h2>
              <p className="text-slate-400">Configuração de descontos de faltas e descanso semanal remunerado</p>
            </div>

            {/* Descontar DSR em caso de falta */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Descontar DSR em caso de falta</Label>
                    <span className="text-xs text-slate-400">- Lei 605/49, art. 7º</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Faltas injustificadas retiram o direito ao DSR.</p>
                </div>
                <Switch checked={formData.dsr_discount_on_absence} onCheckedChange={(v) => updateField("dsr_discount_on_absence", v)} />
              </div>
            </div>

            {/* Descontar DSR em caso de atraso */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Descontar DSR em caso de atraso</Label>
                    <span className="text-xs text-slate-400">- CLT e convenções coletivas</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Atrasos podem ser considerados faltas.</p>
                </div>
                <Switch checked={formData.dsr_discount_on_late} onCheckedChange={(v) => updateField("dsr_discount_on_late", v)} />
              </div>
              {formData.dsr_discount_on_late && (
                <div className="pt-2 border-t border-slate-700">
                  <Label className="text-xs text-slate-400 block mb-2">Limite de minutos de atraso</Label>
                  <Input type="number" value={formData.dsr_late_limit_minutes || 0} onChange={e => updateField("dsr_late_limit_minutes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" placeholder="10" />
                </div>
              )}
            </div>

            {/* DSR sobre horas extras */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">DSR sobre horas extras</Label>
                    <span className="text-xs text-slate-400">- Súmula 172 TST</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Horas extras integram o cálculo do DSR.</p>
                </div>
                <Switch checked={formData.dsr_include_overtime} onCheckedChange={(v) => updateField("dsr_include_overtime", v)} />
              </div>
            </div>

            {/* DSR em feriados */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">DSR em feriados</Label>
                    <span className="text-xs text-slate-400">- Lei 605/49</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">DSR é devido também em semanas com feriado.</p>
                </div>
                <Switch checked={formData.dsr_on_holiday} onCheckedChange={(v) => updateField("dsr_on_holiday", v)} />
              </div>
            </div>

            {/* Tipo de cálculo do DSR */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Tipo de cálculo do DSR</Label>
                <p className="text-xs text-slate-400">- CLT art. 130-A</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Selecione os tipos de cálculo permitidos.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={!!formData.dsr_calc_automatico} onCheckedChange={v => updateField('dsr_calc_automatico', v)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">Automático</span>
                </label>
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={!!formData.dsr_calc_manual} onCheckedChange={v => updateField('dsr_calc_manual', v)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">Manual</span>
                </label>
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={!!formData.dsr_calc_proporcional} onCheckedChange={v => updateField('dsr_calc_proporcional', v)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">Proporcional</span>
                </label>
              </div>
            </div>

            {/* Escalas de trabalho */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Escalas de trabalho permitidas</Label>
                <p className="text-xs text-slate-400">- CLT art. 67</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Selecione as escalas aplicáveis na empresa.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={!!formData.dsr_work_5x2} onCheckedChange={v => updateField('dsr_work_5x2', v)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">5x2</span>
                </label>
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={!!formData.dsr_work_6x1} onCheckedChange={v => updateField('dsr_work_6x1', v)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">6x1</span>
                </label>
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={!!formData.dsr_work_12x36} onCheckedChange={v => updateField('dsr_work_12x36', v)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">12x36</span>
                </label>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Jornada */}
        <TabsContent value="jornada">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Jornada de Trabalho</h2>
              <p className="text-slate-400">Configuração de carga horária, escalas, banco de horas, extras e tolerâncias</p>
            </div>

            {/* Carga horária semanal */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Carga horária semanal</Label>
                <p className="text-xs text-slate-400">- CLT art. 58</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Informe a carga horária semanal padrão da empresa.</p>
              </div>
              <Input type="number" min={1} max={60} value={formData.carga_horaria_semanal || 44} onChange={e => updateField("carga_horaria_semanal", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
            </div>

            {/* Escalas de trabalho */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Escalas de trabalho permitidas</Label>
                <p className="text-xs text-slate-400">- CLT art. 67</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Selecione as escalas aplicáveis na empresa.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={formData.escala_tipo?.includes("5x2")} onCheckedChange={v => {
                    let val = formData.escala_tipo || [];
                    if (v) val = [...val, "5x2"];
                    else val = val.filter(x => x !== "5x2");
                    updateField("escala_tipo", val);
                  }} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">5x2</span>
                </label>
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={formData.escala_tipo?.includes("6x1")} onCheckedChange={v => {
                    let val = formData.escala_tipo || [];
                    if (v) val = [...val, "6x1"];
                    else val = val.filter(x => x !== "6x1");
                    updateField("escala_tipo", val);
                  }} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">6x1</span>
                </label>
                <label className="flex items-center gap-2 text-white px-3 py-2 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                  <Checkbox checked={formData.escala_tipo?.includes("12x36")} onCheckedChange={v => {
                    let val = formData.escala_tipo || [];
                    if (v) val = [...val, "12x36"];
                    else val = val.filter(x => x !== "12x36");
                    updateField("escala_tipo", val);
                  }} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm">12x36</span>
                </label>
              </div>
            </div>

            {/* Controle de ponto */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Controle de ponto</Label>
                    <span className="text-xs text-slate-400">- Lei 6.019/74</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Obrigatório para empresas com mais de 20 funcionários.</p>
                </div>
                <Switch checked={formData.controle_ponto || false} onCheckedChange={v => updateField("controle_ponto", v)} />
              </div>
            </div>

            {/* Banco de horas */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Banco de horas</Label>
                    <span className="text-xs text-slate-400">- Lei 9.601/98</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Necessário acordo ou convenção coletiva.</p>
                </div>
                <Switch checked={formData.banco_horas === true} onCheckedChange={v => updateField("banco_horas", v)} />
              </div>
            </div>

            {/* Horas extras */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Permite horas extras</Label>
                    <span className="text-xs text-slate-400">- CLT art. 59</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Máximo 2 horas diárias, salvo acordo coletivo.</p>
                </div>
                <Switch checked={formData.permite_horas_extras === true} onCheckedChange={v => updateField("permite_horas_extras", v)} />
              </div>
              {formData.permite_horas_extras && (
                <div className="pt-3 border-t border-slate-700 space-y-3">
                  <div>
                    <Label className="text-xs text-slate-400 block mb-2">Limite diário de horas extras</Label>
                    <Input type="number" min={0} max={12} value={formData.limite_horas_extras_dia || 2} onChange={e => updateField("limite_horas_extras_dia", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 block mb-2">Limite mensal de horas extras</Label>
                    <Input type="number" min={0} max={60} value={formData.limite_horas_extras_mes || 40} onChange={e => updateField("limite_horas_extras_mes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Tolerância de atraso */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Tolerância de atraso</Label>
                <p className="text-xs text-slate-400">- Convenção coletiva</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Tempo de tolerância para atrasos sem desconto (em minutos).</p>
              </div>
              <Input type="number" min={0} value={formData.late_tolerance_minutes || 0} onChange={e => updateField("late_tolerance_minutes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
            </div>

            {/* Tolerância saída antecipada */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Tolerância saída antecipada</Label>
                <p className="text-xs text-slate-400">- Convenção coletiva</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Tempo de tolerância para saída antes do horário (em minutos).</p>
              </div>
              <Input type="number" min={0} value={formData.early_leave_tolerance_minutes || 0} onChange={e => updateField("early_leave_tolerance_minutes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
            </div>
          </div>
        </TabsContent>

        {/* Férias */}
        <TabsContent value="ferias">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Férias</h2>
              <p className="text-slate-400">Configuração de dias de férias e abono</p>
            </div>

            {/* Dias de férias */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Dias de férias por período</Label>
                <p className="text-xs text-slate-400">- CLT art. 130</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Número padrão de dias de férias anuais.</p>
              </div>
              <Input type="number" value={formData.vacation_days} onChange={(e) => updateField("vacation_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
            </div>

            {/* 1/3 constitucional */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">1/3 constitucional (%)</Label>
                <p className="text-xs text-slate-400">- CF art. 7º, XVII</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Adicional obrigatório sobre as férias.</p>
              </div>
              <Input type="number" step="0.01" value={formData.vacation_bonus_percent} onChange={(e) => updateField("vacation_bonus_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
            </div>

            {/* Máximo de dias para vender */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Máximo de dias para vender</Label>
                <p className="text-xs text-slate-400">- CLT art. 143</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Limite de dias de férias que podem ser vendidos.</p>
              </div>
              <Input type="number" value={formData.max_vacation_sell_days} onChange={(e) => updateField("max_vacation_sell_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
            </div>

            {/* Dias antecedência para pagamento */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <Label className="text-slate-200 font-medium">Dias de antecedência para pagamento</Label>
                <p className="text-xs text-slate-400">- CLT art. 145</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">Quantos dias antes o empregado deve receber as férias.</p>
              </div>
              <Input type="number" value={formData.vacation_anticipation_days} onChange={(e) => updateField("vacation_anticipation_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
            </div>
          </div>
        </TabsContent>

        {/* 13º Salário */}
        <TabsContent value="decimo-terceiro">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">13º Salário</h2>
              <p className="text-slate-400">Configuração de pagamento do 13º salário</p>
            </div>

            {/* Tipo de pagamento */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Pagar em parcela única</Label>
                    <span className="text-xs text-slate-400">- CLT art. 487</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Se desabilitado, será pago em duas parcelas.</p>
                </div>
                <Switch checked={formData.thirteenth_single_installment} onCheckedChange={(v) => updateField("thirteenth_single_installment", v)} />
              </div>
            </div>

            {formData.thirteenth_single_installment ? (
              <>
                {/* 13º - Parcela única */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div>
                    <Label className="text-slate-200 font-medium">Mês de pagamento</Label>
                    <p className="text-xs text-slate-400">- CLT art. 487</p>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Mês em que o 13º será pago.</p>
                  </div>
                  <Input type="number" min="1" max="12" value={formData.thirteenth_single_installment_month} onChange={(e) => updateField("thirteenth_single_installment_month", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
              </>
            ) : (
              <>
                {/* 13º - 1ª parcela */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div>
                    <Label className="text-slate-200 font-medium">13º - 1ª parcela</Label>
                    <p className="text-xs text-slate-400">- CLT art. 487</p>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Mês de pagamento da primeira parcela.</p>
                  </div>
                  <Input type="number" min="1" max="12" value={formData.thirteenth_first_installment_month} onChange={(e) => updateField("thirteenth_first_installment_month", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>

                {/* 13º - 2ª parcela */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div>
                    <Label className="text-slate-200 font-medium">13º - 2ª parcela</Label>
                    <p className="text-xs text-slate-400">- CLT art. 487</p>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Mês de pagamento da segunda parcela.</p>
                  </div>
                  <Input type="number" min="1" max="12" value={formData.thirteenth_second_installment_month} onChange={(e) => updateField("thirteenth_second_installment_month", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Adicionais */}
        <TabsContent value="adicionais">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Adicionais</CardTitle>
                  <CardDescription className="text-slate-400">Noturno, periculosidade e insalubridade</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Adicional Noturno */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-slate-200 font-medium">Adicional Noturno</Label>
                        <span className="text-xs text-slate-400">- CLT art. 73</span>
                      </div>
                    </div>
                    <div className="w-28 relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                      <Input type="number" placeholder="0" value={formData.night_shift_percent} onChange={(e) => updateField("night_shift_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600 text-right pl-7" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 block mb-3">Selecione os cargos com direito:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {allRoles.length > 0 ? (
                        allRoles.map(role => (
                          <label key={role} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-700/50">
                            <input 
                              type="checkbox" 
                              checked={(formData.night_shift_roles || []).includes(role)}
                              onChange={(e) => {
                                const roles = formData.night_shift_roles || [];
                                const updated = e.target.checked 
                                  ? [...roles, role]
                                  : roles.filter(r => r !== role);
                                updateField('night_shift_roles', updated);
                              }}
                              className="w-4 h-4 rounded border-slate-600"
                            />
                            <span className="text-xs text-slate-300">{role}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 col-span-full">Nenhum cargo cadastrado</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Periculosidade */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-slate-200 font-medium">Periculosidade</Label>
                        <span className="text-xs text-slate-400">- CLT art. 193</span>
                      </div>
                    </div>
                    <div className="w-28 relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                      <Input type="number" placeholder="0" value={formData.hazard_pay_percent} onChange={(e) => updateField("hazard_pay_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600 text-right pl-7" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 block mb-3">Selecione os cargos com direito:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {allRoles.length > 0 ? (
                        allRoles.map(role => (
                          <label key={role} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-700/50">
                            <input 
                              type="checkbox" 
                              checked={(formData.hazard_pay_roles || []).includes(role)}
                              onChange={(e) => {
                                const roles = formData.hazard_pay_roles || [];
                                const updated = e.target.checked 
                                  ? [...roles, role]
                                  : roles.filter(r => r !== role);
                                updateField('hazard_pay_roles', updated);
                              }}
                              className="w-4 h-4 rounded border-slate-600"
                            />
                            <span className="text-xs text-slate-300">{role}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 col-span-full">Nenhum cargo cadastrado</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Insalubridade */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-slate-200 font-medium">Insalubridade</Label>
                        <span className="text-xs text-slate-400">- CLT art. 189</span>
                      </div>
                    </div>
                    <div className="w-28 relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                      <Input type="number" placeholder="0" value={formData.unhealthy_pay_percent} onChange={(e) => updateField("unhealthy_pay_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600 text-right pl-7" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 block mb-3">Selecione os cargos com direito:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {allRoles.length > 0 ? (
                        allRoles.map(role => (
                          <label key={role} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-700/50">
                            <input 
                              type="checkbox" 
                              checked={(formData.unhealthy_pay_roles || []).includes(role)}
                              onChange={(e) => {
                                const roles = formData.unhealthy_pay_roles || [];
                                const updated = e.target.checked 
                                  ? [...roles, role]
                                  : roles.filter(r => r !== role);
                                updateField('unhealthy_pay_roles', updated);
                              }}
                              className="w-4 h-4 rounded border-slate-600"
                            />
                            <span className="text-xs text-slate-300">{role}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 col-span-full">Nenhum cargo cadastrado</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quebra de Caixa */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-slate-200 font-medium">Quebra de Caixa</Label>
                        <span className="text-xs text-slate-400">- CLT art. 457, § 1º</span>
                      </div>
                    </div>
                    <div className="w-28 relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                      <Input type="number" placeholder="0" value={formData.cash_break_percent || ''} onChange={(e) => updateField("cash_break_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600 text-right pl-7" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 block mb-3">Selecione os cargos com direito:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {allRoles.length > 0 ? (
                        allRoles.map(role => (
                          <label key={role} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-700/50">
                            <input 
                              type="checkbox" 
                              checked={(formData.cash_break_roles || []).includes(role)}
                              onChange={(e) => {
                                const roles = formData.cash_break_roles || [];
                                const updated = e.target.checked 
                                  ? [...roles, role]
                                  : roles.filter(r => r !== role);
                                updateField('cash_break_roles', updated);
                              }}
                              className="w-4 h-4 rounded border-slate-600"
                            />
                            <span className="text-xs text-slate-300">{role}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 col-span-full">Nenhum cargo cadastrado</p>
                      )}
                    </div>
                  </div>
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
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Calculator className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Impostos e Encargos</CardTitle>
                  <CardDescription className="text-slate-400">Configuração de descontos e contribuições • Aplicado apenas para funcionários em regime CLT</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* INSS */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-slate-200 font-medium">INSS</Label>
                      <span className="text-xs text-slate-400">- Lei 8.212/91</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Instituto Nacional de Seguridade Social</p>
                  </div>
                  <Switch checked={formData.inss_enabled} onCheckedChange={(v) => updateField("inss_enabled", v)} />
                </div>
                {formData.inss_enabled && (
                  <div>
                    <Label className="text-xs text-slate-400 block mb-2">Percentual (%)</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.inss_percent || ''} 
                        onChange={(e) => updateField("inss_percent", parseFloat(e.target.value))} 
                        className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* IRRF */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-slate-200 font-medium">IRRF</Label>
                      <span className="text-xs text-slate-400">- Lei 7.713/88</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Imposto de Renda Retido na Fonte</p>
                  </div>
                  <Switch checked={formData.irrf_enabled} onCheckedChange={(v) => updateField("irrf_enabled", v)} />
                </div>
                {formData.irrf_enabled && (
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-400 block mb-2">A partir de (R$)</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">R$</span>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={formData.irrf_threshold || ''} 
                          onChange={(e) => updateField("irrf_threshold", parseFloat(e.target.value))} 
                          className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                        />
                      </div>
                    </div>
                    <div className="w-32">
                      <Label className="text-xs text-slate-400 block mb-2">Percentual (%)</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={formData.irrf_percent || ''} 
                          onChange={(e) => updateField("irrf_percent", parseFloat(e.target.value))} 
                          className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FGTS */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-slate-200 font-medium">FGTS</Label>
                      <span className="text-xs text-slate-400">- Lei 8.036/90</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Fundo de Garantia do Tempo de Serviço</p>
                  </div>
                  <Switch checked={formData.fgts_enabled} onCheckedChange={(v) => updateField("fgts_enabled", v)} />
                </div>
                {formData.fgts_enabled && (
                  <div className="w-32 relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formData.fgts_percent} 
                      onChange={(e) => updateField("fgts_percent", parseFloat(e.target.value))} 
                      className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefícios */}
        <TabsContent value="beneficios">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Benefícios</h2>
              <p className="text-slate-400">Configuração de vale transporte, alimentação e refeição</p>
            </div>

            {/* Vale Transporte */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Vale Transporte</Label>
                    <span className="text-xs text-slate-400">- Lei 7.418/1985</span>
                  </div>
                </div>
                <Switch checked={formData.vt_enabled} onCheckedChange={(v) => updateField("vt_enabled", v)} />
              </div>
              {formData.vt_enabled && (
                <div>
                  <Label className="text-xs text-slate-400 block mb-2">Desconto (%)</Label>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                    <Input 
                      type="number" 
                      min="0"
                      max="100"
                      placeholder="0" 
                      value={formData.vt_discount_percent || ''} 
                      onChange={(e) => updateField("vt_discount_percent", parseFloat(e.target.value))} 
                      className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Vale Alimentação */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Vale Alimentação</Label>
                    <span className="text-xs text-slate-400">- Lei 6.321/1976</span>
                  </div>
                </div>
                <Switch checked={formData.va_enabled} onCheckedChange={(v) => updateField("va_enabled", v)} />
              </div>
              {formData.va_enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-400 block mb-2">Valor (R$)</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">R$</span>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0,00" 
                        value={formData.va_value || ''} 
                        onChange={(e) => updateField("va_value", parseFloat(e.target.value))} 
                        className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 block mb-2">Desconto (%)</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                      <Input 
                        type="number" 
                        min="0"
                        max="100"
                        placeholder="0" 
                        value={formData.va_discount_percent || ''} 
                        onChange={(e) => updateField("va_discount_percent", parseFloat(e.target.value))} 
                        className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vale Refeição */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-200 font-medium">Vale Refeição</Label>
                    <span className="text-xs text-slate-400">- Lei 6.321/1976</span>
                  </div>
                </div>
                <Switch checked={formData.vr_enabled} onCheckedChange={(v) => updateField("vr_enabled", v)} />
              </div>
              {formData.vr_enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-400 block mb-2">Valor (R$)</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">R$</span>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0,00" 
                        value={formData.vr_value || ''} 
                        onChange={(e) => updateField("vr_value", parseFloat(e.target.value))} 
                        className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 block mb-2">Desconto (%)</Label>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400">%</span>
                      <Input 
                        type="number" 
                        min="0"
                        max="100"
                        placeholder="0" 
                        value={formData.vr_discount_percent || ''} 
                        onChange={(e) => updateField("vr_discount_percent", parseFloat(e.target.value))} 
                        className="text-white bg-slate-900 border-slate-600 text-right pl-7" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Contratos */}
        <TabsContent value="contratos">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Contratos</CardTitle>
                  <CardDescription className="text-slate-400">Experiência e aviso prévio</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-slate-300">Período de Experiência (dias)</Label>
                  <Input type="number" value={formData.probation_period_days} onChange={(e) => updateField("probation_period_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
                <div>
                  <Label className="text-slate-300">Aviso Prévio (dias)</Label>
                  <Input type="number" value={formData.notice_period_days} onChange={(e) => updateField("notice_period_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </TooltipProvider>
    </div>
  );
}