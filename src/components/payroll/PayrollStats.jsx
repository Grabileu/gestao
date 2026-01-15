import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";

export default function PayrollStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Total de Folhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Aprovadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-400">{stats?.approved || 0}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-yellow-400">{stats?.pending || 0}</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total Líquido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-400">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats?.totalNet || 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
