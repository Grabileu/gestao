import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import moment from "moment";

const typeLabels = {
  absence: { label: "Falta", color: "bg-red-500/20 text-red-400" },
  medical_certificate: { label: "Atestado", color: "bg-yellow-500/20 text-yellow-400" },
  justified: { label: "Justificada", color: "bg-blue-500/20 text-blue-400" }
};

const statusLabels = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Aprovado", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-400" }
};

export default function AbsenceTable({ absences, onEdit, onDelete }) {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-slate-800/50">
            <TableHead className="text-slate-300">Data</TableHead>
            <TableHead className="text-slate-300">Funcionário</TableHead>
            <TableHead className="text-slate-300">Tipo</TableHead>
            <TableHead className="text-slate-300">Dias</TableHead>
            <TableHead className="text-slate-300">Desconta</TableHead>
            <TableHead className="text-slate-300">Motivo</TableHead>
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
                  {absence.days_off || 1}
                </TableCell>
                <TableCell className="text-white">
                  {absence.discount_salary ? "Sim" : "Não"}
                </TableCell>
                <TableCell className="text-slate-300 max-w-[200px] truncate">
                  {absence.reason || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(absence)} className="text-slate-400 hover:text-white">
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
  );
}