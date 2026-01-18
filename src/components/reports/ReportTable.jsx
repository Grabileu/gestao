import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

const contractLabels = {
  clt: "CLT",
  pj: "PJ",
  temporary: "Temp",
  intern: "Estag"
};

export default function ReportTable({ employees }) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              <TableHead className="text-slate-400">Nome</TableHead>
              <TableHead className="text-slate-400">Email</TableHead>
              <TableHead className="text-slate-400">Departamento</TableHead>
              <TableHead className="text-slate-400">Cargo</TableHead>
              <TableHead className="text-slate-400">Contrato</TableHead>
              <TableHead className="text-slate-400">Admissão</TableHead>
              <TableHead className="text-slate-400">Salário</TableHead>
              <TableHead className="text-slate-400">Cidade</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                  Nenhum funcionário encontrado com os filtros aplicados
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="border-slate-700/50 hover:bg-slate-800/50">
                  <TableCell className="text-white font-medium">{employee.full_name}</TableCell>
                  <TableCell className="text-slate-300">{employee.email}</TableCell>
                  <TableCell className="text-slate-300">{employee.department_name || "-"}</TableCell>
                  <TableCell className="text-slate-300">{employee.position}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {contractLabels[employee.contract_type] || employee.contract_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {employee.hire_date && employee.hire_date.split('T')[0].split('-').reverse().join('/')}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {employee.salary ? `R$ ${employee.salary.toLocaleString('pt-BR')}` : "-"}
                  </TableCell>
                  <TableCell className="text-slate-300">{employee.city || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[employee.status]}>
                      {statusLabels[employee.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}