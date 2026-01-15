import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  on_leave: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  terminated: "bg-rose-500/20 text-rose-400 border-rose-500/30"
};

const statusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  on_leave: "Afastado",
  terminated: "Desligado"
};

export default function RecentEmployees({ employees }) {
  const recent = [...employees]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white text-lg">Últimos Cadastros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recent.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Nenhum funcionário cadastrado</p>
        ) : (
          recent.map((employee) => (
            <div key={employee.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <Avatar className="h-10 w-10 border-2 border-slate-600">
                <AvatarImage src={employee.photo_url} />
                <AvatarFallback className="bg-blue-500/20 text-blue-400">
                  {employee.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{employee.full_name}</p>
                <p className="text-slate-400 text-sm truncate">{employee.position}</p>
              </div>
              <div className="text-right">
                <Badge className={statusColors[employee.status]}>
                  {statusLabels[employee.status]}
                </Badge>
                <p className="text-slate-500 text-xs mt-1">
                  {employee.created_date && format(new Date(employee.created_date), "dd/MM/yy", { locale: ptBR })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}