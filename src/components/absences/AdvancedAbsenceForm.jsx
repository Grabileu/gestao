import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AbsenceForm({ onSubmit, isLoading, initialData = null }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      employee_id: formData.get("employee_id"),
      date: formData.get("date"),
      type: formData.get("type"),
      description: formData.get("description"),
      justification: formData.get("justification"),
      status: formData.get("status")
    };
    onSubmit?.(data);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{initialData ? "Editar Ausência" : "Registrar Ausência"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-white mb-2">Data</label>
              <Input
                name="date"
                type="date"
                defaultValue={initialData?.date || ""}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tipo</label>
              <select
                name="type"
                defaultValue={initialData?.type || ""}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                required
              >
                <option value="">Selecione</option>
                <option value="falta">Falta</option>
                <option value="atraso">Atraso</option>
                <option value="atestado">Atestado Médico</option>
                <option value="abono">Abono</option>
              </select>
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
                <option value="rejected">Rejeitada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Descrição</label>
            <textarea
              name="description"
              placeholder="Descrição da ausência"
              defaultValue={initialData?.description || ""}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 resize-vertical h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Justificativa</label>
            <textarea
              name="justification"
              placeholder="Justificativa da ausência"
              defaultValue={initialData?.justification || ""}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 resize-vertical h-20"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
