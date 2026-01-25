  // Função para formatar horas e minutos de forma amigável
  function formatHorasMinutos(valor) {
    if (!valor) return "-";
    let horas = 0, minutos = 0;
    if (typeof valor === 'string' && valor.includes(':')) {
      // Aceita string "1:30"
      const [h, m] = valor.split(':').map(Number);
      horas = h;
      minutos = m;
    } else if (!isNaN(Number(valor))) {
      // Aceita decimal: 1.10 = 1h10, 2.45 = 2h45
      const num = Number(valor).toString().replace(',', '.');
      const [h, m] = num.split('.');
      horas = Number(h);
      minutos = m ? Number(m.padEnd(2, '0')) : 0;
      if (minutos > 59) minutos = 59; // Limite máximo para minutos
    }
    let partes = [];
    if (horas > 0) partes.push(horas + (horas === 1 ? ' hora' : ' horas'));
    if (minutos > 0) partes.push(minutos + (minutos === 1 ? ' minuto' : ' minutos'));
    return partes.length ? partes.join(' e ') : '0 minutos';
  }
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "/src/components/ui/table";
import { Badge } from "/src/components/ui/badge";
import { Button } from "/src/components/ui/button";
import { Pencil, Trash2, Eye, User, Calendar, FileText, StickyNote, BadgeDollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "/src/components/ui/dialog";
import { Separator } from "/src/components/ui/separator";
import moment from "moment";

const typeLabels = {
  absence: { label: "Falta", color: "bg-red-500/20 text-red-400" },
  medical_certificate: { label: "Atestado", color: "bg-yellow-500/20 text-yellow-400" },
  justified: { label: "Justificada", color: "bg-blue-500/20 text-blue-400" },
  delay: { label: "Atraso", color: "bg-orange-500/20 text-orange-400" }
};

const statusLabels = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Aprovado", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-400" }
};

export default function AbsenceTable({ absences, onEdit, onDelete }) {
  const [viewAbsence, setViewAbsence] = React.useState(null);

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-slate-800/50">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              <TableHead className="text-slate-300">Data</TableHead>
              <TableHead className="text-slate-300">Funcionário</TableHead>
              <TableHead className="text-slate-300">Tipo</TableHead>
              <TableHead className="text-slate-300">Desconta</TableHead>
              <TableHead className="text-slate-300">Motivo</TableHead>
              <TableHead className="text-slate-300">Observação</TableHead>
              <TableHead className="text-slate-300 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                  Nenhuma falta/atestado registrado
                </TableCell>
              </TableRow>
            ) : (
              absences.map((absence) => (
                <TableRow key={absence.id} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell className="text-white">
                    {moment(absence.date).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {absence.employee_name}
                  </TableCell>
                  <TableCell>
                    <Badge className={typeLabels[absence.type]?.color}>
                      {typeLabels[absence.type]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    {absence.discount_salary ? "Sim" : "Não"}
                  </TableCell>
                  <TableCell className="text-slate-300 max-w-50 truncate">
                    {absence.reason || "-"}
                  </TableCell>
                  <TableCell className="text-slate-300 max-w-50 truncate">
                    {absence.observations || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => setViewAbsence(absence)} className="text-slate-400 hover:text-blue-400" title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onEdit(absence)} className="text-slate-400 hover:text-white" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDelete(absence)} className="text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewAbsence} onOpenChange={() => setViewAbsence(null)}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-700 text-white p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Detalhes da Ocorrência</DialogTitle>
          </DialogHeader>
          {viewAbsence && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Calendar} label="Data" value={moment(viewAbsence.date).format("DD/MM/YYYY")} />
                <InfoItem icon={User} label="Funcionário" value={viewAbsence.employee_name} />
                <InfoItem icon={FileText} label="Tipo" value={typeLabels[viewAbsence.type]?.label} />
                <InfoItem icon={BadgeDollarSign} label="Desconta do salário" value={viewAbsence.discount_salary ? "Sim" : "Não"} />
                <InfoItem icon={FileText} label="Motivo" value={viewAbsence.reason} />
                <InfoItem icon={StickyNote} label="Observações" value={viewAbsence.observations} />
                {viewAbsence.type === 'delay' && (
                  <InfoItem icon={FileText} label="Horas ausente" value={formatHorasMinutos(viewAbsence.hours)} />
                )}
                {viewAbsence.type === 'medical_certificate' && (
                  <>
                    <InfoItem icon={FileText} label="CID" value={viewAbsence.cid} />
                    <InfoItem icon={User} label="Médico" value={viewAbsence.doctor_name} />
                    <InfoItem icon={FileText} label="CRM" value={viewAbsence.crm} />
                    <InfoItem icon={FileText} label="Dias de afastamento" value={viewAbsence.days_off} />
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}