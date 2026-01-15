import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function PayrollConfigForm({ initialData, onSubmit, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      work_hours_per_day: parseFloat(formData.get("work_hours_per_day")) || 8,
      work_days_per_month: parseFloat(formData.get("work_days_per_month")) || 22,
      overtime_50_percent: parseFloat(formData.get("overtime_50_percent")) || 50,
      overtime_100_percent: parseFloat(formData.get("overtime_100_percent")) || 100,
      absence_discount_enabled: formData.get("absence_discount_enabled") === "on",
      medical_certificate_discount: formData.get("medical_certificate_discount") === "on",
      inss_enabled: formData.get("inss_enabled") === "on",
      irrf_enabled: formData.get("irrf_enabled") === "on",
      vt_discount_percent: parseFloat(formData.get("vt_discount_percent")) || 6,
      vt_enabled: formData.get("vt_enabled") === "on"
    };
    onSubmit?.(data);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Configurações de Folha de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white">Horas de Trabalho por Dia</Label>
              <Input
                name="work_hours_per_day"
                type="number"
                step="0.5"
                defaultValue={initialData?.work_hours_per_day || 8}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Dias de Trabalho por Mês</Label>
              <Input
                name="work_days_per_month"
                type="number"
                defaultValue={initialData?.work_days_per_month || 22}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Adicional Horas Extras 50%</Label>
              <Input
                name="overtime_50_percent"
                type="number"
                step="0.1"
                defaultValue={initialData?.overtime_50_percent || 50}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Adicional Horas Extras 100%</Label>
              <Input
                name="overtime_100_percent"
                type="number"
                step="0.1"
                defaultValue={initialData?.overtime_100_percent || 100}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white">Percentual VT</Label>
              <Input
                name="vt_discount_percent"
                type="number"
                step="0.1"
                defaultValue={initialData?.vt_discount_percent || 6}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                name="absence_discount_enabled"
                defaultChecked={initialData?.absence_discount_enabled}
                className="w-4 h-4"
              />
              Descontar Faltas
            </label>
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                name="medical_certificate_discount"
                defaultChecked={initialData?.medical_certificate_discount}
                className="w-4 h-4"
              />
              Desconto Atestado Médico
            </label>
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                name="inss_enabled"
                defaultChecked={initialData?.inss_enabled}
                className="w-4 h-4"
              />
              Habilitar INSS
            </label>
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                name="irrf_enabled"
                defaultChecked={initialData?.irrf_enabled}
                className="w-4 h-4"
              />
              Habilitar IRRF
            </label>
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                name="vt_enabled"
                defaultChecked={initialData?.vt_enabled}
                className="w-4 h-4"
              />
              Habilitar VT
            </label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
