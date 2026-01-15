import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EmployeeDetails({ employee, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!employee) {
    return <div className="text-center py-8 text-gray-500">Nenhum funcionário selecionado</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-medium">{employee.phone || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">CPF</p>
              <p className="font-medium">{employee.cpf || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Departamento</p>
              <p className="font-medium">{employee.department || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cargo</p>
              <p className="font-medium">{employee.position || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Salário</p>
              <p className="font-medium">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                }).format(employee.salary || 0)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <Badge variant={employee.status === "active" ? "success" : "secondary"}>
              {employee.status === "active" ? "Ativo" : employee.status === "inactive" ? "Inativo" : "Suspenso"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
