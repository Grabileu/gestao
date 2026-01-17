import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

const typeColors = {
  shortage: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  surplus: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
};

const typeLabels = {
  shortage: "Falta",
  surplus: "Sobra"
};

const statusColors = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30"
};

const statusLabels = {
  pending: "Pendente",
  paid: "Pago",
  cancelled: "Cancelado"
};

const shiftLabels = {
  morning: "Manhã",
  afternoon: "Tarde",
  night: "Noite"
};

export default function CashBreakTable({ cashBreaks, onEdit, onRefresh }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.CashBreak.delete(deleteId);
    setDeleteId(null);
    setDeleting(false);
    onRefresh();
  };

  const handleMarkAsPaid = async (item) => {
    await base44.entities.CashBreak.update(item.id, {
      ...item,
      voucher_status: "paid",
      payment_date: new Date().toISOString().split('T')[0]
    });
    onRefresh();
  };

  return (
    <>
      <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              <TableHead className="text-slate-400">Data</TableHead>
              <TableHead className="text-slate-400">Loja</TableHead>
              <TableHead className="text-slate-400">Operador</TableHead>
              <TableHead className="text-slate-400">Turno</TableHead>
              <TableHead className="text-slate-400">Tipo</TableHead>
              <TableHead className="text-slate-400">Valor</TableHead>
              <TableHead className="text-slate-400">Vale</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashBreaks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                  Nenhuma quebra de caixa encontrada
                </TableCell>
              </TableRow>
            ) : (
              cashBreaks.map((item) => (
                <TableRow key={item.id} className="border-slate-700/50 hover:bg-slate-800/50">
                  <TableCell className="text-white font-medium">
                    {item.date && format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-slate-300">{item.store_name || "-"}</TableCell>
                  <TableCell className="text-slate-300">{item.cashier_name || "-"}</TableCell>
                  <TableCell className="text-slate-300">{shiftLabels[item.shift] || "-"}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[item.type]}>
                      {typeLabels[item.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${item.type === 'shortage' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    R$ {item.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-slate-300">{item.voucher_number || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[item.voucher_status]}>
                      {statusLabels[item.voucher_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        {item.voucher_status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(item)} className="text-emerald-400 hover:bg-slate-700 cursor-pointer">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Pago
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(item)} className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-rose-400 hover:bg-slate-700 cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir esta quebra de caixa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-rose-600 hover:bg-rose-700">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}