import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
          <TabsTrigger value="faltas" className="data-[state=active]:bg-blue-600">Faltas</TabsTrigger>
          <TabsTrigger value="dsr" className="data-[state=active]:bg-blue-600">DSR</TabsTrigger>
          <TabsTrigger value="ferias" className="data-[state=active]:bg-blue-600">Férias</TabsTrigger>
          <TabsTrigger value="adicionais" className="data-[state=active]:bg-blue-600">Adicionais</TabsTrigger>
          <TabsTrigger value="impostos" className="data-[state=active]:bg-blue-600">Impostos</TabsTrigger>
          <TabsTrigger value="beneficios" className="data-[state=active]:bg-blue-600">Benefícios</TabsTrigger>
          <TabsTrigger value="contratos" className="data-[state=active]:bg-blue-600">Contratos</TabsTrigger>
        </TabsList>
        {/* DSR */}
        <TabsContent value="dsr">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Configurações de DSR</CardTitle>
                  <CardDescription className="text-slate-400">Descanso Semanal Remunerado</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div>
                    <Label className="flex items-center gap-1 text-slate-300">Descontar DSR em caso de falta?
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent className="text-white bg-slate-900">Lei 605/49, art. 7º e CLT art. 131</TooltipContent>
                      </Tooltip>
                    </Label>
                    <p className="mt-1 text-xs text-slate-500">Faltas injustificadas retiram o direito ao DSR.</p>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_discount_on_absence ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_discount_on_absence" value="sim" checked={formData.dsr_discount_on_absence === true} onChange={() => updateField("dsr_discount_on_absence", true)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Sim
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_discount_on_absence === false ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_discount_on_absence" value="nao" checked={formData.dsr_discount_on_absence === false} onChange={() => updateField("dsr_discount_on_absence", false)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Não
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div>
                    <Label className="flex items-center gap-1 text-slate-300">Descontar DSR em caso de atraso?
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent className="text-white bg-slate-900">CLT e convenções coletivas</TooltipContent>
                      </Tooltip>
                    </Label>
                    <p className="mt-1 text-xs text-slate-500">Atrasos podem ser considerados faltas, conforme política da empresa.</p>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_discount_on_late ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_discount_on_late" value="sim" checked={formData.dsr_discount_on_late === true} onChange={() => updateField("dsr_discount_on_late", true)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Sim
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_discount_on_late === false ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_discount_on_late" value="nao" checked={formData.dsr_discount_on_late === false} onChange={() => updateField("dsr_discount_on_late", false)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Não
                      </label>
                    </div>
                  </div>
                </div>
                {formData.dsr_discount_on_late && (
                  <div className="p-4 rounded-lg bg-slate-900">
                    <Label className="flex items-center gap-1 text-slate-300">Limite de minutos de atraso para desconto do DSR
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent className="text-white bg-slate-900">Convenções coletivas</TooltipContent>
                      </Tooltip>
                    </Label>
                    <p className="mb-2 text-xs text-slate-500">Convenções coletivas podem definir tolerância (ex: até 10 minutos).</p>
                    <Input type="number" value={formData.dsr_late_limit_minutes || 0} onChange={e => updateField("dsr_late_limit_minutes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                )}
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="flex items-center gap-1 text-slate-300">Tipo de cálculo do DSR
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent className="text-white bg-slate-900">CLT art. 130-A</TooltipContent>
                    </Tooltip>
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">Selecione os tipos de cálculo permitidos para o DSR.</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_calc_automatico ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <Checkbox checked={!!formData.dsr_calc_automatico} onCheckedChange={v => updateField('dsr_calc_automatico', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                      Automático (baseado em faltas/atrasos)
                    </label>
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_calc_manual ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <Checkbox checked={!!formData.dsr_calc_manual} onCheckedChange={v => updateField('dsr_calc_manual', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                      Manual (RH informa)
                    </label>
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_calc_proporcional ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <Checkbox checked={!!formData.dsr_calc_proporcional} onCheckedChange={v => updateField('dsr_calc_proporcional', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                      Proporcional (para jornada parcial)
                    </label>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="flex items-center gap-1 text-slate-300">Escala de trabalho para cálculo do DSR
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent className="text-white bg-slate-900">CLT art. 67</TooltipContent>
                    </Tooltip>
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">Selecione as escalas permitidas para o cálculo do DSR.</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_work_5x2 ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <Checkbox checked={!!formData.dsr_work_5x2} onCheckedChange={v => updateField('dsr_work_5x2', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                      5x2
                    </label>
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_work_6x1 ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <Checkbox checked={!!formData.dsr_work_6x1} onCheckedChange={v => updateField('dsr_work_6x1', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                      6x1
                    </label>
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_work_12x36 ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <Checkbox checked={!!formData.dsr_work_12x36} onCheckedChange={v => updateField('dsr_work_12x36', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                      12x36
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div className="w-full">
                    <Label className="flex items-center gap-1 text-slate-300">DSR sobre horas extras
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent className="text-white bg-slate-900">Súmula 172 do TST</TooltipContent>
                      </Tooltip>
                    </Label>
                    <p className="mt-1 text-xs text-slate-500">Horas extras integram o cálculo do DSR.</p>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_include_overtime === true ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_include_overtime" value="sim" checked={formData.dsr_include_overtime === true} onChange={() => updateField("dsr_include_overtime", true)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Sim
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_include_overtime === false ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_include_overtime" value="nao" checked={formData.dsr_include_overtime === false} onChange={() => updateField("dsr_include_overtime", false)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Não
                      </label>
                    </div>
                    {formData.dsr_include_overtime === true && (
                      <div className="flex flex-wrap gap-4 mt-2">
                        <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_overtime_50 ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                          <Checkbox checked={!!formData.dsr_overtime_50} onCheckedChange={v => updateField('dsr_overtime_50', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                          Horas extras 50%
                        </label>
                        <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_overtime_100 ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                          <Checkbox checked={!!formData.dsr_overtime_100} onCheckedChange={v => updateField('dsr_overtime_100', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                          Horas extras 100%
                        </label>
                        <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_overtime_night ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                          <Checkbox checked={!!formData.dsr_overtime_night} onCheckedChange={v => updateField('dsr_overtime_night', v)} className="w-4 h-4 mr-2 accent-blue-500" />
                          Adicional noturno
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div className="w-full">
                    <Label className="flex items-center gap-1 text-slate-300">DSR em feriados
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent className="text-white bg-slate-900">Lei 605/49</TooltipContent>
                      </Tooltip>
                    </Label>
                    <p className="mt-1 text-xs text-slate-500">DSR é devido também em semanas com feriado.</p>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_on_holiday === true ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_on_holiday" value="sim" checked={formData.dsr_on_holiday === true} onChange={() => updateField("dsr_on_holiday", true)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Sim
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_on_holiday === false ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="dsr_on_holiday" value="nao" checked={formData.dsr_on_holiday === false} onChange={() => updateField("dsr_on_holiday", false)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Não
                      </label>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="flex items-center gap-1 text-slate-300">Regras para banco de horas
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent className="text-white bg-slate-900">Acordo/convenção coletiva</TooltipContent>
                    </Tooltip>
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">Depende de acordo/convenção coletiva.</p>
                  <div className="flex gap-4 mt-2">
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_bank_hours_rule === 'desconta' ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <input type="radio" name="dsr_bank_hours_rule" value="desconta" checked={formData.dsr_bank_hours_rule === 'desconta'} onChange={() => updateField('dsr_bank_hours_rule', 'desconta')} className="w-4 h-4 mr-2 accent-blue-500" />
                      Horas negativas no banco descontam DSR
                    </label>
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.dsr_bank_hours_rule === 'nao_desconta' ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <input type="radio" name="dsr_bank_hours_rule" value="nao_desconta" checked={formData.dsr_bank_hours_rule === 'nao_desconta'} onChange={() => updateField('dsr_bank_hours_rule', 'nao_desconta')} className="w-4 h-4 mr-2 accent-blue-500" />
                      Não descontam
                    </label>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="text-slate-300">Observações</Label>
                  <Input value={formData.dsr_obs || ""} onChange={e => updateField("dsr_obs", e.target.value)} className="text-white bg-slate-900 border-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jornada */}
        <TabsContent value="jornada">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Configuração de Jornada</CardTitle>
                  <CardDescription className="text-slate-400">Jornada, escala, banco de horas, extras e tolerâncias</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div className="w-full">
                    <Label className="flex items-center gap-1 text-slate-300">Tipo de Jornada
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent className="text-white bg-slate-900">Diária, semanal ou mensal</TooltipContent>
                      </Tooltip>
                    </Label>
                    <p className="mt-1 text-xs text-slate-500">Escolha o tipo de jornada do colaborador.</p>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.jornada_tipo === "diaria" ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="jornada_tipo" value="diaria" checked={formData.jornada_tipo === "diaria"} onChange={e => updateField("jornada_tipo", e.target.value)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Diária
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${(formData.jornada_tipo === "semanal" || !formData.jornada_tipo) ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="jornada_tipo" value="semanal" checked={formData.jornada_tipo === "semanal" || !formData.jornada_tipo} onChange={e => updateField("jornada_tipo", e.target.value)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Semanal
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.jornada_tipo === "mensal" ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="jornada_tipo" value="mensal" checked={formData.jornada_tipo === "mensal"} onChange={e => updateField("jornada_tipo", e.target.value)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Mensal
                      </label>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="flex items-center gap-1 text-slate-300">
                    {formData.jornada_tipo === 'diaria' ? 'Carga horária diária' : formData.jornada_tipo === 'mensal' ? 'Carga horária mensal' : 'Carga horária semanal'}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent className="text-white bg-slate-900">CLT art. 58</TooltipContent>
                    </Tooltip>
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">
                    {formData.jornada_tipo === 'diaria' ? 'Informe a carga horária diária padrão.' : formData.jornada_tipo === 'mensal' ? 'Informe a carga horária mensal padrão.' : 'Informe a carga horária semanal padrão.'}
                  </p>
                  <Input type="number" min={1} max={60} value={formData.carga_horaria_semanal || 44} onChange={e => updateField("carga_horaria_semanal", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="flex items-center gap-1 text-slate-300">Tipo de Escala
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent className="text-white bg-slate-900">Ex: 5x2, 6x1, 12x36, personalizada</TooltipContent>
                    </Tooltip>
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">Selecione uma ou mais escalas de trabalho.</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.escala_tipo?.includes("5x2") ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <input type="checkbox" value="5x2" checked={formData.escala_tipo?.includes("5x2")} onChange={e => {
                        let val = formData.escala_tipo || [];
                        if (e.target.checked) val = [...val, "5x2"];
                        else val = val.filter(v => v !== "5x2");
                        updateField("escala_tipo", val);
                      }} className="w-4 h-4 mr-2 accent-blue-500" />
                      5x2
                    </label>
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.escala_tipo?.includes("6x1") ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <input type="checkbox" value="6x1" checked={formData.escala_tipo?.includes("6x1")} onChange={e => {
                        let val = formData.escala_tipo || [];
                        if (e.target.checked) val = [...val, "6x1"];
                        else val = val.filter(v => v !== "6x1");
                        updateField("escala_tipo", val);
                      }} className="w-4 h-4 mr-2 accent-blue-500" />
                      6x1
                    </label>
                    <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.escala_tipo?.includes("12x36") ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                      <input type="checkbox" value="12x36" checked={formData.escala_tipo?.includes("12x36")} onChange={e => {
                        let val = formData.escala_tipo || [];
                        if (e.target.checked) val = [...val, "12x36"];
                        else val = val.filter(v => v !== "12x36");
                        updateField("escala_tipo", val);
                      }} className="w-4 h-4 mr-2 accent-blue-500" />
                      12x36
                    </label>
                    {/* label removido: personalizada */}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div>
                    <Label className="text-slate-300">Controle de Ponto?</Label>
                    <p className="mt-1 text-xs text-slate-500">Obrigatório para empresas com mais de 20 funcionários.</p>
                  </div>
                  <Switch checked={formData.controle_ponto || false} onCheckedChange={v => updateField("controle_ponto", v)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div className="w-full">
                    <Label className="text-slate-300">Permite banco de horas?</Label>
                    <p className="mt-1 text-xs text-slate-500">Necessário acordo coletivo.</p>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.banco_horas === true ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="banco_horas" value="true" checked={formData.banco_horas === true} onChange={() => updateField("banco_horas", true)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Sim
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${!formData.banco_horas ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="banco_horas" value="false" checked={!formData.banco_horas} onChange={() => updateField("banco_horas", false)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Não
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900">
                  <div className="w-full">
                    <Label className="flex items-center gap-1 text-slate-300">Permite horas extras?
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                        </TooltipTrigger>
                        <TooltipContent className="text-white bg-slate-900">CLT art. 59: máximo de 2 horas extras por dia, salvo acordo coletivo.</TooltipContent>
                      </Tooltip>
                    </Label>
                    <p className="mt-1 text-xs text-slate-500">Limite de 2h diárias, salvo acordo.</p>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${formData.permite_horas_extras === true ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="permite_horas_extras" value="true" checked={formData.permite_horas_extras === true} onChange={() => updateField("permite_horas_extras", true)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Sim
                      </label>
                      <label className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer transition-all duration-200 shadow-sm mb-2 mr-2 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 ${!formData.permite_horas_extras ? 'bg-blue-900/60 font-bold ring-2 ring-blue-500' : 'hover:bg-slate-800'}`}>
                        <input type="radio" name="permite_horas_extras" value="false" checked={!formData.permite_horas_extras} onChange={() => updateField("permite_horas_extras", false)} className="w-4 h-4 mr-2 accent-blue-500" />
                        Não
                      </label>
                    </div>
                  </div>
                </div>
                {formData.permite_horas_extras && (
                  <>
                    <div className="p-4 rounded-lg bg-slate-900">
                      <Label className="flex items-center gap-1 text-slate-300">Limite de horas extras por dia
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                          </TooltipTrigger>
                          <TooltipContent className="text-white bg-slate-900">CLT art. 59</TooltipContent>
                        </Tooltip>
                      </Label>
                      <p className="mb-2 text-xs text-slate-500">Informe o limite diário de horas extras.</p>
                      <Input type="number" min={0} max={12} value={formData.limite_horas_extras_dia || 2} onChange={e => updateField("limite_horas_extras_dia", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900">
                      <Label className="flex items-center gap-1 text-slate-300">Limite de horas extras por mês
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                          </TooltipTrigger>
                          <TooltipContent className="text-white bg-slate-900">Acordo coletivo</TooltipContent>
                        </Tooltip>
                      </Label>
                      <p className="mb-2 text-xs text-slate-500">Informe o limite mensal de horas extras.</p>
                      <Input type="number" min={0} max={60} value={formData.limite_horas_extras_mes || 40} onChange={e => updateField("limite_horas_extras_mes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                    </div>
                  </>
                )}
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="flex items-center gap-1 text-slate-300">Tolerância de Atraso (minutos)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent className="text-white bg-slate-900">Convenção coletiva</TooltipContent>
                    </Tooltip>
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">Tempo de tolerância para atrasos sem desconto.</p>
                  <Input type="number" min={0} value={formData.late_tolerance_minutes || 0} onChange={e => updateField("late_tolerance_minutes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="flex items-center gap-1 text-slate-300">Tolerância Saída Antecipada (minutos)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-pointer"><Info className="inline w-4 h-4 text-blue-400" /></span>
                      </TooltipTrigger>
                      <TooltipContent className="text-white bg-slate-900">Convenção coletiva</TooltipContent>
                    </Tooltip>
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">Tempo de tolerância para saída antes do horário.</p>
                  <Input type="number" min={0} value={formData.early_leave_tolerance_minutes || 0} onChange={e => updateField("early_leave_tolerance_minutes", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
                <div className="p-4 rounded-lg bg-slate-900">
                  <Label className="text-slate-300">Observações</Label>
                  <Input value={formData.jornada_obs || ""} onChange={e => updateField("jornada_obs", e.target.value)} className="text-white bg-slate-900 border-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faltas */}
        <TabsContent value="faltas">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Configurações de Faltas</CardTitle>
                  <CardDescription className="text-slate-400">Descontos e atestados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
                    <div>
                      <Label className="text-slate-300">Descontar Faltas</Label>
                      <p className="text-xs text-slate-500">Desconta automaticamente as faltas do salário</p>
                    </div>
                    <Switch checked={formData.absence_discount_enabled} onCheckedChange={(v) => updateField("absence_discount_enabled", v)} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
                    <div>
                      <Label className="text-slate-300">Descontar DSR na Falta</Label>
                      <p className="text-xs text-slate-500">Desconta o descanso semanal remunerado junto com a falta</p>
                    </div>
                    <Switch checked={formData.absence_discount_dsr} onCheckedChange={(v) => updateField("absence_discount_dsr", v)} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
                    <div>
                      <Label className="text-slate-300">Descontar Atestados</Label>
                      <p className="text-xs text-slate-500">Desconta os dias de atestado médico</p>
                    </div>
                    <Switch checked={formData.medical_certificate_discount} onCheckedChange={(v) => updateField("medical_certificate_discount", v)} />
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-800">
                    <Label className="text-slate-300">Dias de Atestado sem Desconto</Label>
                    <p className="mb-2 text-xs text-slate-500">Após esses dias, INSS assume</p>
                    <Input type="number" value={formData.max_medical_days_no_discount} onChange={(e) => updateField("max_medical_days_no_discount", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
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
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Umbrella className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Configurações de Férias</CardTitle>
                  <CardDescription className="text-slate-400">Dias, abono e 13º salário</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Dias de Férias por Período</Label>
                    <Input type="number" value={formData.vacation_days} onChange={(e) => updateField("vacation_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                  <div>
                    <Label className="text-slate-300">1/3 Constitucional (%)</Label>
                    <Input type="number" step="0.01" value={formData.vacation_bonus_percent} onChange={(e) => updateField("vacation_bonus_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Máximo de Dias para Vender</Label>
                    <Input type="number" value={formData.max_vacation_sell_days} onChange={(e) => updateField("max_vacation_sell_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Dias Antecedência para Pagar Férias</Label>
                    <Input type="number" value={formData.vacation_anticipation_days} onChange={(e) => updateField("vacation_anticipation_days", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">13º Salário</h3>
                  <div>
                    <Label className="text-slate-300">Mês da 1ª Parcela</Label>
                    <Input type="number" min="1" max="12" value={formData.thirteenth_first_installment_month} onChange={(e) => updateField("thirteenth_first_installment_month", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Mês da 2ª Parcela</Label>
                    <Input type="number" min="1" max="12" value={formData.thirteenth_second_installment_month} onChange={(e) => updateField("thirteenth_second_installment_month", parseInt(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
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
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Adicionais</CardTitle>
                  <CardDescription className="text-slate-400">Noturno, periculosidade e insalubridade</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-slate-300">Adicional Noturno (%)</Label>
                  <Input type="number" value={formData.night_shift_percent} onChange={(e) => updateField("night_shift_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
                <div>
                  <Label className="text-slate-300">Periculosidade (%)</Label>
                  <Input type="number" value={formData.hazard_pay_percent} onChange={(e) => updateField("hazard_pay_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                </div>
                <div>
                  <Label className="text-slate-300">Insalubridade (%)</Label>
                  <Input type="number" value={formData.unhealthy_pay_percent} onChange={(e) => updateField("unhealthy_pay_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
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
                  <CardDescription className="text-slate-400">INSS, IRRF e FGTS</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
                  <div>
                    <Label className="text-slate-300">Calcular INSS</Label>
                    <p className="text-xs text-slate-500">Tabela progressiva automática</p>
                  </div>
                  <Switch checked={formData.inss_enabled} onCheckedChange={(v) => updateField("inss_enabled", v)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
                  <div>
                    <Label className="text-slate-300">Calcular IRRF</Label>
                    <p className="text-xs text-slate-500">Tabela progressiva automática</p>
                  </div>
                  <Switch checked={formData.irrf_enabled} onCheckedChange={(v) => updateField("irrf_enabled", v)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
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
                  <Input type="number" value={formData.fgts_percent} onChange={(e) => updateField("fgts_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
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
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Receipt className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Benefícios</CardTitle>
                  <CardDescription className="text-slate-400">Vale transporte e refeição</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Vale Transporte</h3>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800">
                    <Label className="text-slate-300">Desconto VT Ativo</Label>
                    <Switch checked={formData.vt_enabled} onCheckedChange={(v) => updateField("vt_enabled", v)} />
                  </div>
                  {formData.vt_enabled && (
                    <div>
                      <Label className="text-slate-300">Desconto VT (%)</Label>
                      <Input type="number" value={formData.vt_discount_percent} onChange={(e) => updateField("vt_discount_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-white">Vale Refeição</h3>
                  <div>
                    <Label className="text-slate-300">Valor VR (R$)</Label>
                    <Input type="number" step="0.01" value={formData.vr_value} onChange={(e) => updateField("vr_value", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Desconto VR (%)</Label>
                    <Input type="number" value={formData.vr_discount_percent} onChange={(e) => updateField("vr_discount_percent", parseFloat(e.target.value))} className="text-white bg-slate-900 border-slate-600" />
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