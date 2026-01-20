import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import moment from "moment";

const typeLabels = {
  "50": { label: "50%", color: "bg-blue-500/20 text-blue-400" },
  "100": { label: "100%", color: "bg-purple-500/20 text-purple-400" }
};

const statusLabels = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Aprovado", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rejeitado", color: "bg-red-500/20 text-red-400" }
};

export default function OvertimeTable({ overtimes, onEdit, onDelete }) {
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-slate-800/50">
            <TableHead className="text-slate-300">Data</TableHead>
            <TableHead className="text-slate-300">Funcionário</TableHead>
            <TableHead className="text-slate-300">Horas</TableHead>
            <TableHead className="text-slate-300">Tipo</TableHead>
            <TableHead className="text-slate-300">Motivo</TableHead>
            <TableHead className="text-slate-300 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overtimes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                Nenhuma hora extra registrada
              </TableCell>
            </TableRow>
          ) : (
            overtimes.map((overtime) => (
              <TableRow key={overtime.id} className="border-slate-700 hover:bg-slate-800/30">
                <TableCell className="text-white">
                  {moment(overtime.date).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell className="text-white font-medium">
                  {overtime.employee_name}
                </TableCell>
                <TableCell className="text-white">
                  {overtime.hours}h
                </TableCell>
                <TableCell>
                  <Badge className={typeLabels[overtime.type]?.color}>
                    {typeLabels[overtime.type]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300 max-w-[200px] truncate">
                  {overtime.reason || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(overtime)} className="text-slate-400 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(overtime)} className="text-slate-400 hover:text-red-400">
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