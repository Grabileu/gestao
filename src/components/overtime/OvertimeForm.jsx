import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OvertimeForm({ onSubmit, isLoading, initialData = null }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      employee: formData.get("employee"),
      date: formData.get("date"),
      hours: formData.get("hours"),
      reason: formData.get("reason"),
      approved: formData.get("approved") === "on"
    };
    onSubmit?.(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Horas Extras" : "Registrar Horas Extras"}</CardTitle>
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
                Horas
              </label>
              <Input
                name="hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0.0"
                defaultValue={initialData?.hours || ""}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo
            </label>
            <Select name="reason" defaultValue={initialData?.reason || ""}>
              <option value="">Selecione o motivo</option>
              <option value="urgent">Demanda Urgente</option>
              <option value="project">Projeto</option>
              <option value="maintenance">Manutenção</option>
              <option value="other">Outro</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="approved"
              name="approved"
              defaultChecked={initialData?.approved || false}
              className="w-4 h-4"
            />
            <label htmlFor="approved" className="text-sm font-medium text-gray-700">
              Aprovado
            </label>
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
