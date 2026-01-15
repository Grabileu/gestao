import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StoreForm({ onSubmit, isLoading, initialData = null }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      address: formData.get("address"),
      city: formData.get("city"),
      phone: formData.get("phone"),
      manager: formData.get("manager"),
      status: formData.get("status")
    };
    onSubmit?.(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Loja" : "Nova Loja"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Loja
            </label>
            <Input
              name="name"
              placeholder="Digite o nome da loja"
              defaultValue={initialData?.name || ""}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <Input
              name="address"
              placeholder="Rua, número..."
              defaultValue={initialData?.address || ""}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <Input
                name="city"
                placeholder="Cidade"
                defaultValue={initialData?.city || ""}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gerente
            </label>
            <Input
              name="manager"
              placeholder="Nome do gerente"
              defaultValue={initialData?.manager || ""}
            />
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
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
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
