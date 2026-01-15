import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CashBreakForm({ onSubmit, isLoading, initialData = null }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      employee: formData.get("employee"),
      store: formData.get("store"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      reason: formData.get("reason")
    };
    onSubmit?.(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Pausa de Caixa" : "Nova Pausa de Caixa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funcionário
            </label>
            <Input
              name="employee"
              placeholder="Selecione o funcionário"
              defaultValue={initialData?.employee || ""}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loja
            </label>
            <Input
              name="store"
              placeholder="Selecione a loja"
              defaultValue={initialData?.store || ""}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <Input
                name="date"
                type="date"
                defaultValue={initialData?.date || ""}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo
              </label>
              <Select name="reason" defaultValue={initialData?.reason || ""}>
                <option value="">Selecione o motivo</option>
                <option value="lunch">Almoço</option>
                <option value="break">Intervalo</option>
                <option value="rest">Descanso</option>
                <option value="other">Outro</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Início
              </label>
              <Input
                name="startTime"
                type="time"
                defaultValue={initialData?.startTime || ""}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Término
              </label>
              <Input
                name="endTime"
                type="time"
                defaultValue={initialData?.endTime || ""}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
