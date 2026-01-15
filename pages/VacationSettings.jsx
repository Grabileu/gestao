import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Umbrella, Save } from "lucide-react";

export default function VacationSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: configs = [] } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => api.entities.SystemConfig.list()
  });

  const [config, setConfig] = useState({
    name: "default",
    vacation_days: 30,
    vacation_bonus_enabled: true,
    vacation_sell_max_days: 10
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuração de Férias e Abonos</h1>
          <p className="text-slate-400">Configure regras de férias</p>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg"><Umbrella className="h-5 w-5 text-green-400" /></div>
            <div>
              <CardTitle className="text-white">Férias</CardTitle>
              <CardDescription className="text-slate-400">Configurações gerais de férias</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Dias de Férias por Período Aquisitivo</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="number" value={config.vacation_days} onChange={(e) => setConfig(p => ({ ...p, vacation_days: parseInt(e.target.value) || 0 }))} className="bg-slate-900 border-slate-600 text-white w-24" />
              <span className="text-slate-400">dias</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-slate-800 rounded-lg">
            <div>
              <Label className="text-slate-300">1/3 Constitucional</Label>
              <p className="text-xs text-slate-500">Pagar adicional de 1/3 sobre as férias</p>
            </div>
            <Switch checked={config.vacation_bonus_enabled} onCheckedChange={(v) => setConfig(prev => ({ ...prev, vacation_bonus_enabled: v }))} />
          </div>

          <div>
            <Label className="text-slate-300">Máximo de Dias para Vender (Abono Pecuniário)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="number" value={config.vacation_sell_max_days} onChange={(e) => setConfig(p => ({ ...p, vacation_sell_max_days: parseInt(e.target.value) || 0 }))} className="bg-slate-900 border-slate-600 text-white w-24" />
              <span className="text-slate-400">dias</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Funcionário pode vender até esse número de dias de férias</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <h4 className="text-white font-medium mb-2">Cálculo de Férias:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• <span className="text-white">Férias:</span> {config.vacation_days} dias de descanso</li>
              {config.vacation_bonus_enabled && <li>• <span className="text-green-400">1/3 Constitucional:</span> Adicional de 33,33% sobre o salário das férias</li>}
              <li>• <span className="text-blue-400">Abono:</span> Pode vender até {config.vacation_sell_max_days} dias</li>
              <li>• <span className="text-yellow-400">Período:</span> A cada 12 meses trabalhados</li>
            </ul>
          </div>
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