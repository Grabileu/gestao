import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, Gift, Save, AlertCircle } from "lucide-react";

export default function AbsenceSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: configs = [] } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => api.entities.SystemConfig.list()
  });

  const [config, setConfig] = useState({
    name: "default",
    absence_discount_dsr: true,
    medical_discount_enabled: false,
    medical_max_days_no_discount: 15,
    basket_bonus_value: 100,
    basket_bonus_enabled: true,
    basket_lose_on_absence: true,
    basket_lose_on_medical: true,
    basket_lose_on_late: true
  });

  useEffect(() => {
    if (configs.length > 0) {
      setConfig(prev => ({ ...prev, ...configs[0] }));
    }
  }, [configs]);

  const handleSave = async () => {
    setSaving(true);
    if (configs.length > 0 && configs[0].id) {
      await api.entities.SystemConfig.update(configs[0].id, config);
    } else {
      await api.entities.SystemConfig.create(config);
    }
    queryClient.invalidateQueries({ queryKey: ["system-config"] });
    setSaving(false);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuração de Faltas e Cesta</h1>
          <p className="text-slate-400">Configure descontos e bonificações</p>
        </div>
      </div>

      {/* Faltas */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg"><Calendar className="h-5 w-5 text-yellow-400" /></div>
            <div>
              <CardTitle className="text-white">Faltas e Atestados</CardTitle>
              <CardDescription className="text-slate-400">Configurações de descontos por faltas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField label="Descontar DSR na Falta" desc="Funcionário perde o descanso semanal remunerado ao faltar" field="absence_discount_dsr" />
          <SwitchField label="Descontar Atestados Médicos" desc="Desconta dias de atestado médico do salário" field="medical_discount_enabled" />
          
          <div>
            <Label className="text-slate-300">Dias de Atestado sem Desconto (INSS)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="number" value={config.medical_max_days_no_discount} onChange={(e) => setConfig(p => ({ ...p, medical_max_days_no_discount: parseInt(e.target.value) || 0 }))} className="bg-slate-900 border-slate-600 text-white w-24" />
              <span className="text-slate-400">dias</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Após esse período, o INSS assume o pagamento</p>
          </div>
        </CardContent>
      </Card>

      {/* Cesta Bonificação */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg"><Gift className="h-5 w-5 text-pink-400" /></div>
            <div>
              <CardTitle className="text-white">Cesta de Bonificação</CardTitle>
              <CardDescription className="text-slate-400">Bonificação para funcionários sem faltas, atestados ou atrasos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField label="Cesta de Bonificação Ativa" desc="Habilita o benefício da cesta de bonificação" field="basket_bonus_enabled" />
          
          {config.basket_bonus_enabled && (
            <>
              <div>
                <Label className="text-slate-300">Valor da Cesta</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400">R$</span>
                  <Input type="number" step="0.01" value={config.basket_bonus_value} onChange={(e) => setConfig(p => ({ ...p, basket_bonus_value: parseFloat(e.target.value) || 0 }))} className="bg-slate-900 border-slate-600 text-white w-32" />
                </div>
              </div>

              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <h4 className="text-red-400 font-medium">Condições para Perder a Cesta</h4>
                </div>
                <div className="space-y-3">
                  <SwitchField label="Perde se tiver FALTA" desc="Qualquer falta não justificada" field="basket_lose_on_absence" />
                  <SwitchField label="Perde se tiver ATESTADO" desc="Qualquer atestado médico no mês" field="basket_lose_on_medical" />
                  <SwitchField label="Perde se tiver ATRASO" desc="Qualquer atraso registrado" field="basket_lose_on_late" />
                </div>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="text-green-400 font-medium mb-2">Resumo das Regras:</h4>
                <p className="text-sm text-slate-300">
                  O funcionário <span className="text-green-400 font-bold">GANHA</span> a cesta de <span className="text-white font-bold">R$ {config.basket_bonus_value.toFixed(2)}</span> se:
                </p>
                <ul className="text-sm text-slate-400 mt-2 space-y-1">
                  {config.basket_lose_on_absence && <li>✓ Não tiver nenhuma falta no mês</li>}
                  {config.basket_lose_on_medical && <li>✓ Não tiver nenhum atestado no mês</li>}
                  {config.basket_lose_on_late && <li>✓ Não tiver nenhum atraso no mês</li>}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}