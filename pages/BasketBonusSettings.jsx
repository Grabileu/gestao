import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, Gift, CheckCircle, XCircle } from "lucide-react";

export default function BasketBonusSettings() {
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => api.entities.SystemConfig.list()
  });

  const [config, setConfig] = useState({
    basket_bonus_value: 100,
    basket_bonus_enabled: true,
    basket_lose_on_absence: true,
    basket_lose_on_medical: true,
    basket_lose_on_late: true
  });

  const [saving, setSaving] = useState(false);

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
      await api.entities.SystemConfig.create({ name: "default", ...config });
    }
    queryClient.invalidateQueries({ queryKey: ["system-config"] });
    setSaving(false);
  };

  const SwitchField = ({ label, desc, field, invert = false }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-slate-800 rounded-lg">
      <div className="flex items-center gap-3">
        {config[field] ? (
          <XCircle className="h-5 w-5 text-red-400" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-400" />
        )}
        <div>
          <Label className="text-slate-300">{label}</Label>
          {desc && <p className="text-xs text-slate-500">{desc}</p>}
        </div>
      </div>
      <Switch 
        checked={config[field]} 
        onCheckedChange={(v) => setConfig(prev => ({ ...prev, [field]: v }))} 
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cesta de Bonificação</h1>
        <p className="text-slate-400">Configure a cesta de R$ 100,00 para funcionários sem faltas/atrasos</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Gift className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <CardTitle className="text-white">Regras da Cesta de Bonificação</CardTitle>
              <CardDescription className="text-slate-400">
                Funcionário recebe a cesta se não tiver nenhuma ocorrência marcada abaixo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 bg-slate-800 rounded-lg">
            <div>
              <Label className="text-slate-300">Cesta de Bonificação Ativa</Label>
              <p className="text-xs text-slate-500">Habilita/desabilita o benefício</p>
            </div>
            <Switch 
              checked={config.basket_bonus_enabled} 
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, basket_bonus_enabled: v }))} 
            />
          </div>

          {config.basket_bonus_enabled && (
            <>
              <div>
                <Label className="text-slate-300">Valor da Cesta (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={config.basket_bonus_value} 
                  onChange={(e) => setConfig(prev => ({ ...prev, basket_bonus_value: parseFloat(e.target.value) || 0 }))} 
                  className="bg-slate-900 border-slate-600 text-white mt-1"
                />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-white font-medium mb-3">Condições para PERDER a Cesta:</h3>
                <div className="space-y-2">
                  <SwitchField 
                    label="Perde se tiver FALTA" 
                    desc="Falta não justificada no mês" 
                    field="basket_lose_on_absence" 
                  />
                  <SwitchField 
                    label="Perde se tiver ATESTADO MÉDICO" 
                    desc="Qualquer atestado médico no mês" 
                    field="basket_lose_on_medical" 
                  />
                  <SwitchField 
                    label="Perde se tiver ATRASO" 
                    desc="Qualquer atraso registrado no mês" 
                    field="basket_lose_on_late" 
                  />
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-green-400 font-medium mb-2">✓ Resumo da Regra</h4>
                <p className="text-slate-300 text-sm">
                  O funcionário receberá <strong className="text-green-400">R$ {config.basket_bonus_value.toFixed(2)}</strong> se:
                </p>
                <ul className="text-sm text-slate-400 mt-2 space-y-1">
                  {config.basket_lose_on_absence && <li>• Não tiver nenhuma falta</li>}
                  {config.basket_lose_on_medical && <li>• Não tiver nenhum atestado médico</li>}
                  {config.basket_lose_on_late && <li>• Não tiver nenhum atraso</li>}
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