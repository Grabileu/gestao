import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepartmentForm({ onSubmit, isLoading, initialData = null }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      manager: formData.get("manager"),
      budget: formData.get("budget"),
      status: formData.get("status")
    };
    onSubmit?.(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Departamento" : "Novo Departamento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Departamento
            </label>
            <Input
              name="name"
              placeholder="Ex: Recursos Humanos"
              defaultValue={initialData?.name || ""}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              placeholder="Descreva o departamento"
              defaultValue={initialData?.description || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gerente Responsável
              </label>
              <Input
                name="manager"
                placeholder="Nome do gerente"
                defaultValue={initialData?.manager || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orçamento
              </label>
              <Input
                name="budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={initialData?.budget || ""}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={initialData?.status || "active"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
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
