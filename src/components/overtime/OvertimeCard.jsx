import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

export default function OvertimeCard({ overtime, onEdit, onDelete }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-base">{overtime.employee}</CardTitle>
            <p className="text-sm text-slate-400 mt-1">{overtime.reason}</p>
          </div>
          <Badge variant={overtime.approved ? "success" : "warning"}>
            {overtime.approved ? "Aprovado" : "Pendente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            {overtime.date}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            {overtime.hours}h extras
          </div>
        </div>
        <div className="flex gap-2 pt-3 border-t border-slate-700">
          <button onClick={() => onEdit?.(overtime)} className="text-blue-400 hover:text-blue-300 text-sm flex-1">
            Editar
          </button>
          <button onClick={() => onDelete?.(overtime.id)} className="text-red-400 hover:text-red-300 text-sm flex-1">
            Deletar
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
