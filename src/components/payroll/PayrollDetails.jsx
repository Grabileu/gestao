import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function PayrollDetails({ payroll, employee }) {
  if (!payroll) return null;

  const details = [
    { label: "Salário Base", value: payroll.base_salary, type: "positive" },
    { label: "Horas Extras", value: payroll.overtime_amount, type: "positive" },
    { label: "VT", value: payroll.vt_discount, type: "negative" },
    { label: "INSS", value: payroll.inss_discount, type: "negative" },
    { label: "IRRF", value: payroll.irrf_discount, type: "negative" },
    { label: "Faltas", value: payroll.absence_discount, type: "negative" }
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Detalhes da Folha - {employee?.full_name}</span>
          <Badge variant={payroll.status === "approved" ? "success" : "warning"}>
            {payroll.status === "approved" ? "Aprovada" : "Pendente"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-center justify-between py-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                {detail.type === "positive" ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-slate-400">{detail.label}</span>
              </div>
              <span className={detail.type === "positive" ? "text-green-400" : "text-red-400"}>
                {formatCurrency(detail.value)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 bg-blue-500/10 rounded-lg px-3 mt-4 border border-blue-500/20">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Líquido</span>
            </div>
            <span className="text-lg font-bold text-blue-400">{formatCurrency(payroll.net_salary)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
