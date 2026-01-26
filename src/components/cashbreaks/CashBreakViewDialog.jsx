import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { typeColors, typeLabels, statusColors, statusLabels, shiftLabels } from "./CashBreakTable";
import { User, Store, Calendar, CreditCard, FileText, BadgeDollarSign, ClipboardList, Info, StickyNote } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
export default function CashBreakViewDialog({ open, onClose, cashBreak }) {
  if (!cashBreak) return null;

  const InfoItem = ({ icon: Icon, label, value, badge }) => (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-slate-800/50">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        {badge ? badge : <p className="text-white">{value || "-"}</p>}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes da Quebra de Caixa</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={Calendar} label="Data" value={cashBreak.date ? format(new Date(cashBreak.date), "dd/MM/yyyy", { locale: ptBR }) : "-"} />
            <InfoItem icon={Store} label="Loja" value={cashBreak.store_name} />
            <InfoItem icon={User} label="Funcionário" value={cashBreak.cashier_name || cashBreak.employee_name} />
            <InfoItem icon={CreditCard} label="Forma de Pagamento" value={
              cashBreak.payment_method === 'cash' ? 'Dinheiro' :
              cashBreak.payment_method === 'credit' ? 'Cartão Crédito' :
              cashBreak.payment_method === 'debit' ? 'Cartão Débito' :
              cashBreak.payment_method === 'food' ? 'Cartão Alimentação' :
              cashBreak.payment_method === 'pix' ? 'Pix' :
              cashBreak.payment_method === 'pos' ? 'POS' :
              cashBreak.payment_method === 'client_credit' ? 'Cliente a Prazo' :
              cashBreak.payment_method === 'other' ? 'Outro' : '-'
            } />
            <InfoItem icon={FileText} label="Tipo" badge={<Badge className={typeColors[cashBreak.type]}>{typeLabels[cashBreak.type]}</Badge>} />
            <InfoItem icon={BadgeDollarSign} label="Valor" value={`R$ ${Number(cashBreak.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            {cashBreak.voucher_lost_value > 0 && (
              <InfoItem icon={BadgeDollarSign} label="Valor do comprovante perdido" value={`R$ ${Number(cashBreak.voucher_lost_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            )}
            {/* Número do Vale removido */}
            <InfoItem icon={BadgeDollarSign} label="Status do Vale" badge={<Badge className={statusColors[cashBreak.voucher_status]}>{statusLabels[cashBreak.voucher_status]}</Badge>} />
            {cashBreak.voucher_status === 'delivered' && (
              <InfoItem icon={Calendar} label="Data de Entrega" value={cashBreak.payment_date ? format(new Date(cashBreak.payment_date), "dd/MM/yyyy", { locale: ptBR }) : "-"} />
            )}
          </div>

          <Separator className="bg-slate-700" />

          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={Info} label="Motivo" value={cashBreak.reason} />
            <InfoItem icon={StickyNote} label="Observações" value={cashBreak.observations} />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
