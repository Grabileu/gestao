import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Clock, Percent, Receipt, Calculator, Umbrella, Gift, AlertTriangle, Users } from "lucide-react";

export default function PayrollConfig() {
  const { data: configs = [] } = useQuery({
    queryKey: ["payroll-config"],
    queryFn: () => base44.entities.PayrollConfig.list()
  });

  const [formData, setFormData] = useState({
    name: "default",
    // Jornada
    work_hours_per_day: 8,
    work_days_per_month: 22,
    // Horas Extras
    overtime_50_percent: 50,
    overtime_100_percent: 100,
    // Adicionais
    night_shift_percent: 20,
    night_shift_enabled: false,
    hazard_pay_percent: 30,
    hazard_pay_enabled: false,
    danger_pay_percent: 30,
    danger_pay_enabled: false,
    // Faltas
    absence_discount_enabled: true,
    absence_discount_dsr: true,
    medical_certificate_discount: false,
    medical_certificate_limit_days: 15,
    late_arrival_tolerance_minutes: 10,
    late_arrival_discount: false,
    // Férias
    vacation_days_per_year: 30,
    vacation_bonus_enabled: true,
    vacation_absence_reduction: true,
    // 13º
    thirteenth_salary_enabled: true,
    thirteenth_first_installment_month: 11,
    // DSR
    dsr_enabled: true,
    dsr_sundays_per_month: 4,
    // Impostos
    inss_enabled: true,
    irrf_enabled: true,
    irrf_dependents_deduction: 189.59,
    fgts_percent: 8,
    fgts_enabled: true,
    // Benefícios
    vt_discount_percent: 6,
    vt_enabled: true,
    vt_max_discount: 0,
    vr_value_per_day: 0,
    vr_discount_percent: 0,
    health_insurance_discount: 0,
    union_contribution_enabled: false,
    union_contribution_percent: 0
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
      await base44.entities.PayrollConfig.update(configs[0].id, formData);
    } else {
      await base44.entities.PayrollConfig.create(formData);
    }
    setSaving(false);
  };

  const SwitchField = ({ label, desc, field }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <Label className="text-slate-300">{label}</Label>
        {desc && <p className="text-xs text-slate-500">{desc}</p>}
      </div>
      <Switch
        checked={formData[field]}
        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [field]: checked }))}
      />
    </div>
  );

  const NumberField = ({ label, field, step = 1, suffix = "" }) => (
    <div>
      <Label className="text-slate-300">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step={step}
          value={formData[field]}
          onChange={(e) => setFormData(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
          className="bg-slate-900 border-slate-600 text-white"
        />
        {suffix && <span className="text-slate-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações de Folha</h1>
          <p className="text-slate-400">Configure todos os parâmetros para cálculo da folha de pagamento</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <Tabs defaultValue="jornada" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="jornada" className="data-[state=active]:bg-slate-700">Jornada</TabsTrigger>
          <TabsTrigger value="extras" className="data-[state=active]:bg-slate-700">Horas Extras</TabsTrigger>
          <TabsTrigger value="adicionais" className="data-[state=active]:bg-slate-700">Adicionais</TabsTrigger>
          <TabsTrigger value="faltas" className="data-[state=active]:bg-slate-700">Faltas</TabsTrigger>
          <TabsTrigger value="ferias" className="data-[state=active]:bg-slate-700">Férias/13º</TabsTrigger>
          <TabsTrigger value="impostos" className="data-[state=active]:bg-slate-700">Impostos</TabsTrigger>
          <TabsTrigger value="beneficios" className="data-[state=active]:bg-slate-700">Benefícios</TabsTrigger>
        </TabsList>

        {/* Jornada */}
        <TabsContent value="jornada">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg"><Clock className="h-5 w-5 text-blue-400" /></div>
                <div>
                  <CardTitle className="text-white">Jornada de Trabalho</CardTitle>
                  <CardDescription className="text-slate-400">Configure a jornada padrão dos funcionários</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberField label="Horas por dia" field="work_hours_per_day" suffix="horas" />
              <NumberField label="Dias úteis por mês" field="work_days_per_month" suffix="dias" />
              <SwitchField label="Calcular DSR" desc="Descanso Semanal Remunerado" field="dsr_enabled" />
              {formData.dsr_enabled && (
                <NumberField label="Domingos/Feriados por mês" field="dsr_sundays_per_month" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Horas Extras */}
        <TabsContent value="extras">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg"><Percent className="h-5 w-5 text-purple-400" /></div>
                <div>
                  <CardTitle className="text-white">Horas Extras</CardTitle>
                  <CardDescription className="text-slate-400">Percentuais de adicional para hora extra</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberField label="Hora Extra Normal" field="overtime_50_percent" suffix="%" />
              <NumberField label="Hora Extra 100% (dom/feriado)" field="overtime_100_percent" suffix="%" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adicionais */}
        <TabsContent value="adicionais">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
                <div>
                  <CardTitle className="text-white">Adicionais</CardTitle>
                  <CardDescription className="text-slate-400">Noturno, Insalubridade e Periculosidade</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg">
                <SwitchField label="Adicional Noturno" desc="22h às 5h" field="night_shift_enabled" />
                {formData.night_shift_enabled && (
                  <NumberField label="Percentual Noturno" field="night_shift_percent" suffix="%" />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg">
                <SwitchField label="Insalubridade" desc="Atividades insalubres" field="hazard_pay_enabled" />
                {formData.hazard_pay_enabled && (
                  <NumberField label="Percentual Insalubridade" field="hazard_pay_percent" suffix="%" />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg">
                <SwitchField label="Periculosidade" desc="Atividades perigosas" field="danger_pay_enabled" />
                {formData.danger_pay_enabled && (
                  <NumberField label="Percentual Periculosidade" field="danger_pay_percent" suffix="%" />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faltas */}
        <TabsContent value="faltas">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg"><Receipt className="h-5 w-5 text-red-400" /></div>
                <div>
                  <CardTitle className="text-white">Faltas e Atrasos</CardTitle>
                  <CardDescription className="text-slate-400">Configure descontos de faltas e atestados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SwitchField label="Descontar faltas" desc="Desconta o dia de falta do salário" field="absence_discount_enabled" />
              {formData.absence_discount_enabled && (
                <SwitchField label="Desconta DSR na falta" desc="Perde o descanso remunerado quando falta" field="absence_discount_dsr" />
              )}
              <SwitchField label="Descontar atestados" desc="Desconta dias de atestado médico" field="medical_certificate_discount" />
              <NumberField label="Limite dias atestado (INSS)" field="medical_certificate_limit_days" suffix="dias" />
              <div className="border-t border-slate-700 pt-4">
                <SwitchField label="Descontar atrasos" desc="Desconta minutos de atraso" field="late_arrival_discount" />
                {formData.late_arrival_discount && (
                  <NumberField label="Tolerância de atraso" field="late_arrival_tolerance_minutes" suffix="minutos" />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Férias e 13º */}
        <TabsContent value="ferias">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <NumberField label="Dias de férias por ano" field="vacation_days_per_year" suffix="dias" />
                <SwitchField label="Pagar 1/3 de férias" desc="Adicional constitucional" field="vacation_bonus_enabled" />
                <SwitchField label="Reduzir férias por faltas" desc="CLT Art. 130" field="vacation_absence_reduction" />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg"><Gift className="h-5 w-5 text-pink-400" /></div>
                  <div>
                    <CardTitle className="text-white">13º Salário</CardTitle>
                    <CardDescription className="text-slate-400">Configurações do décimo terceiro</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SwitchField label="Calcular 13º salário" field="thirteenth_salary_enabled" />
                {formData.thirteenth_salary_enabled && (
                  <NumberField label="Mês 1ª parcela" field="thirteenth_first_installment_month" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Impostos */}
        <TabsContent value="impostos">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg"><Calculator className="h-5 w-5 text-orange-400" /></div>
                <div>
                  <CardTitle className="text-white">Impostos e Contribuições</CardTitle>
                  <CardDescription className="text-slate-400">INSS, IRRF e FGTS</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg">
                <SwitchField label="Calcular INSS" desc="Tabela progressiva" field="inss_enabled" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg">
                <SwitchField label="Calcular IRRF" desc="Imposto de renda" field="irrf_enabled" />
                {formData.irrf_enabled && (
                  <NumberField label="Dedução por dependente" field="irrf_dependents_deduction" step={0.01} suffix="R$" />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg">
                <SwitchField label="Calcular FGTS" desc="Fundo de garantia" field="fgts_enabled" />
                {formData.fgts_enabled && (
                  <NumberField label="Percentual FGTS" field="fgts_percent" suffix="%" />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg">
                <SwitchField label="Contribuição Sindical" field="union_contribution_enabled" />
                {formData.union_contribution_enabled && (
                  <NumberField label="Percentual Sindical" field="union_contribution_percent" step={0.01} suffix="%" />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefícios */}
        <TabsContent value="beneficios">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg"><Users className="h-5 w-5 text-cyan-400" /></div>
                <div>
                  <CardTitle className="text-white">Benefícios</CardTitle>
                  <CardDescription className="text-slate-400">VT, VR, Plano de Saúde</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                <h3 className="text-white font-medium">Vale Transporte</h3>
                <SwitchField label="Desconto VT ativo" field="vt_enabled" />
                {formData.vt_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberField label="Desconto VT" field="vt_discount_percent" suffix="%" />
                    <NumberField label="Limite desconto (0=sem limite)" field="vt_max_discount" step={0.01} suffix="R$" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                <h3 className="text-white font-medium">Vale Refeição</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberField label="Valor VR por dia" field="vr_value_per_day" step={0.01} suffix="R$" />
                  <NumberField label="Desconto VR" field="vr_discount_percent" suffix="%" />
                </div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <NumberField label="Desconto Plano de Saúde" field="health_insurance_discount" step={0.01} suffix="R$" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}