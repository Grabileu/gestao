import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mail, Phone, MapPin, Building2, Calendar, Wallet, User, FileText } from "lucide-react";

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
  temporary: "Temporário",
  intern: "Estagiário"
};

export default function EmployeeDetails({ employee, open, onClose }) {
  if (!employee) return null;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes do Funcionário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com foto e info básica */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/50">
            <Avatar className="h-20 w-20 border-4 border-slate-600">
              <AvatarImage src={employee.photo_url} />
              <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xl">
                {employee.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{employee.full_name}</h3>
              <p className="text-slate-400">{employee.position}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={statusColors[employee.status]}>
                  {statusLabels[employee.status]}
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {contractLabels[employee.contract_type]}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Informações de contato */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Contato</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Email" value={employee.email} />
              <InfoItem icon={Phone} label="Telefone" value={employee.phone} />
              <InfoItem icon={User} label="CPF" value={employee.cpf} />
              <InfoItem icon={Calendar} label="Nascimento" value={employee.birth_date && format(new Date(employee.birth_date), "dd/MM/yyyy", { locale: ptBR })} />
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Informações profissionais */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Profissional</h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={Building2} label="Departamento" value={employee.department_name} />
              <InfoItem icon={FileText} label="Cargo" value={employee.position} />
              <InfoItem icon={Calendar} label="Admissão" value={employee.hire_date && employee.hire_date.split('T')[0].split('-').reverse().join('/')} />
              <InfoItem icon={Wallet} label="Salário" value={employee.salary ? `R$ ${employee.salary.toLocaleString('pt-BR')}` : null} />
            </div>
          </div>

          {employee.address && (
            <>
              <Separator className="bg-slate-700" />
              <div>
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Endereço</h4>
                <InfoItem 
                  icon={MapPin} 
                  label="Endereço completo" 
                  value={`${employee.address}${employee.city ? `, ${employee.city}` : ''}${employee.state ? ` - ${employee.state}` : ''}${employee.zip_code ? ` | CEP: ${employee.zip_code}` : ''}`} 
                />
              </div>
            </>
          )}

          {employee.notes && (
            <>
              <Separator className="bg-slate-700" />
              <div>
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Observações</h4>
                <p className="text-slate-300 bg-slate-800/50 p-4 rounded-lg">{employee.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}