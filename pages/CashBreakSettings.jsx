import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Receipt, Save } from "lucide-react";

export default function CashBreakSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: configs = [] } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => api.entities.SystemConfig.list()
  });

  const [config, setConfig] = useState({
    name: "default",
    voucher_lost_penalty: 5,
    voucher_lost_penalty_additional: 5
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
          <h1 className="text-2xl font-bold text-white">Configuração de Quebra de Caixa</h1>
          <p className="text-slate-400">Configure multas e penalidades</p>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg"><Receipt className="h-5 w-5 text-red-400" /></div>
            <div>
              <CardTitle className="text-white">Multas por Comprovante Perdido</CardTitle>
              <CardDescription className="text-slate-400">Valores descontados automaticamente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-300">Multa por Comprovante Perdido (1º)</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400">R$</span>
                <Input type="number" step="0.01" value={config.voucher_lost_penalty} onChange={(e) => setConfig(p => ({ ...p, voucher_lost_penalty: parseFloat(e.target.value) || 0 }))} className="bg-slate-900 border-slate-600 text-white" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Valor descontado ao perder o 1º comprovante</p>
            </div>
            <div>
              <Label className="text-slate-300">Multa Adicional (cada comprovante a mais)</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400">R$</span>
                <Input type="number" step="0.01" value={config.voucher_lost_penalty_additional} onChange={(e) => setConfig(p => ({ ...p, voucher_lost_penalty_additional: parseFloat(e.target.value) || 0 }))} className="bg-slate-900 border-slate-600 text-white" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Valor adicionado para cada comprovante perdido além do primeiro</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <h4 className="text-white font-medium mb-2">Regras de Desconto:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• <span className="text-green-400">Dinheiro:</span> Desconta apenas a diferença (falta/sobra)</li>
              <li>• <span className="text-blue-400">Cartões (Crédito, Débito, Alimentação, Pix):</span> Desconta R$ {config.voucher_lost_penalty} automaticamente + valor adicional por comprovante perdido</li>
              <li>• <span className="text-red-400">POS:</span> Desconta R$ {config.voucher_lost_penalty} + valor do comprovante se não foi pago</li>
              <li>• <span className="text-yellow-400">Cliente a Prazo:</span> Tratado como dinheiro</li>
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