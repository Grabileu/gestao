import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeForm({ onSubmit, isLoading, initialData = null }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      cpf: formData.get("cpf"),
      department: formData.get("department"),
      position: formData.get("position"),
      salary: formData.get("salary"),
      status: formData.get("status")
    };
    onSubmit?.(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Funcionário" : "Novo Funcionário"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <Input
              name="name"
              placeholder="Digite o nome completo"
              defaultValue={initialData?.name || ""}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="email@example.com"
                defaultValue={initialData?.email || ""}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <Input
                name="phone"
                placeholder="(00) 00000-0000"
                defaultValue={initialData?.phone || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <Input
                name="cpf"
                placeholder="000.000.000-00"
                defaultValue={initialData?.cpf || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <Input
                name="department"
                placeholder="Selecione o departamento"
                defaultValue={initialData?.department || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <Input
                name="position"
                placeholder="Ex: Desenvolvedor"
                defaultValue={initialData?.position || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salário
              </label>
              <Input
                name="salary"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={initialData?.salary || ""}
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
              <option value="suspended">Suspenso</option>
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
