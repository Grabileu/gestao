import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CashierCard({ cashier, onEdit, onDelete }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-white">{cashier.name}</h4>
            <p className="text-sm text-slate-400">{cashier.email}</p>
          </div>
          <Badge variant={cashier.status === "active" ? "success" : "secondary"}>
            {cashier.status === "active" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <p className="text-sm text-slate-400 mb-3">Loja: {cashier.store}</p>
        <div className="flex gap-2 text-sm">
          <button onClick={() => onEdit?.(cashier)} className="text-blue-400 hover:text-blue-300">
            Editar
          </button>
          <button onClick={() => onDelete?.(cashier.id)} className="text-red-400 hover:text-red-300">
            Deletar
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
