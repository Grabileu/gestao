import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayrollForm({ onSubmit, isLoading, initialData = null }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      month_reference: formData.get("month_reference"),
      employee_id: formData.get("employee_id"),
      base_salary: parseFloat(formData.get("base_salary")) || 0,
      overtime_hours: parseFloat(formData.get("overtime_hours")) || 0,
      absences: parseInt(formData.get("absences")) || 0,
      status: formData.get("status")
    };
    onSubmit?.(data);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Nova Folha de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Período</label>
              <Input
                name="month_reference"
                type="month"
                defaultValue={initialData?.month_reference || ""}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Funcionário</label>
              <Input
                name="employee_id"
                placeholder="ID do funcionário"
                defaultValue={initialData?.employee_id || ""}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Salário Base</label>
              <Input
                name="base_salary"
                type="number"
                step="0.01"
                defaultValue={initialData?.base_salary || ""}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Horas Extras</label>
              <Input
                name="overtime_hours"
                type="number"
                step="0.5"
                defaultValue={initialData?.overtime_hours || ""}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Faltas</label>
              <Input
                name="absences"
                type="number"
                defaultValue={initialData?.absences || ""}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "pending"}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="pending">Pendente</option>
                <option value="approved">Aprovada</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
