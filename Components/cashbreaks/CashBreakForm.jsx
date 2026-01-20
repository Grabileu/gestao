import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

const shiftOptions = [
  { value: "morning", label: "Manhã" },
  { value: "afternoon", label: "Tarde" },
  { value: "night", label: "Noite" }
];

const typeOptions = [
  { value: "shortage", label: "Falta (Quebra)" },
  { value: "surplus", label: "Sobra" }
];

const statusOptions = [
  { value: "not_delivered", label: "Não entregue" },
  { value: "delivered", label: "Entregue" },
  { value: "discounted", label: "Descontado" }
];

export default function CashBreakForm({ open, onClose, cashBreak, stores, cashiers, onSave }) {
  const [formData, setFormData] = useState({
    date: "",
    store_id: "",
    store_name: "",
    cashier_id: "",
    cashier_name: "",
    type: "shortage",
    amount: "",
    reason: "",
    voucher_number: "",
    voucher_status: "",
    payment_date: "",
    observations: "",
    shift: "",
    payment_method: "cash" // novo campo
  });
  const [saving, setSaving] = useState(false);
  const [filteredCashiers, setFilteredCashiers] = useState([]);

  useEffect(() => {
    if (cashBreak) {
      setFormData({ ...cashBreak, amount: cashBreak.amount?.toString() || "" });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: today,
        store_id: "",
        store_name: "",
        cashier_id: "",
        cashier_name: "",
        type: "shortage",
        amount: "",
        reason: "",
        voucher_number: "",
        voucher_status: "",
        payment_date: "",
        observations: "",
        shift: "",
        payment_method: "cash"
      });
    }
  }, [cashBreak, open]);

  useEffect(() => {
    if (formData.store_id) {
      const filtered = cashiers.filter(c => c.store_id === formData.store_id && c.status === 'active');
      setFilteredCashiers(filtered);
    } else {
      setFilteredCashiers([]);
    }
  }, [formData.store_id, cashiers]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      let next = { ...prev, [field]: value };
      if (field === "store_id") {
        const store = stores.find(s => s.id === value);
        next = {
          ...next,
          store_id: value,
          store_name: store?.name || "",
          cashier_id: "",
          cashier_name: ""
        };
      }
      if (field === "cashier_id") {
        const cashier = cashiers.find(c => c.id === value);
        next = {
          ...next,
          cashier_id: value,
          cashier_name: cashier?.name || ""
        };
      }
      // Se mudar o método de pagamento, atualiza status do vale
      if (field === "payment_method") {
        if (value === "cash") {
          next.voucher_status = "";
        } else {
          next.voucher_status = "not_delivered";
        }
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    // Busca os nomes corretos antes de salvar
    const store = stores.find(s => String(s.id) === String(formData.store_id));
    const cashier = cashiers.find(c => String(c.id) === String(formData.cashier_id));
    let amount = formData.amount ? parseFloat(formData.amount) : 0;
    // Se for comprovante perdido, sempre R$5
    if (formData.payment_method !== "cash") {
      amount = 5;
    }
    const data = {
      ...formData,
      amount,
      store_name: store?.name || "",
      cashier_name: cashier?.name || ""
    };
    if (cashBreak?.id) {
      await base44.entities.CashBreak.update(cashBreak.id, data);
    } else {
      await base44.entities.CashBreak.create(data);
    }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {cashBreak ? "Editar Quebra de Caixa" : "Registrar Quebra de Caixa"}
          </DialogTitle>
        </DialogHeader>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data */}
          <div className="space-y-2">
            <Label className="text-slate-300">Data *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          {/* Loja */}
          <div className="space-y-2">
            <Label className="text-slate-300">Loja *</Label>
            <Select value={formData.store_id} onValueChange={(v) => handleChange("store_id", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                {stores.filter(s => s.status === 'active').map(store => (
                  <SelectItem key={store.id} value={String(store.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                    {store.code} - {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Operador de Caixa */}
          <div className="space-y-2">
            <Label className="text-slate-300">Operador de Caixa *</Label>
            <Select 
              value={formData.cashier_id} 
              onValueChange={(v) => handleChange("cashier_id", v)}
              disabled={!formData.store_id}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder={formData.store_id ? "Selecione o operador" : "Selecione uma loja primeiro"} />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                {filteredCashiers.map(cashier => (
                  <SelectItem key={cashier.id} value={String(cashier.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label className="text-slate-300">Forma de Pagamento *</Label>
            <Select value={formData.payment_method} onValueChange={(v) => handleChange("payment_method", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="cash" className="text-white hover:bg-slate-700 cursor-pointer">Dinheiro</SelectItem>
                <SelectItem value="debit" className="text-white hover:bg-slate-700 cursor-pointer">Cartão Débito</SelectItem>
                <SelectItem value="credit" className="text-white hover:bg-slate-700 cursor-pointer">Cartão Crédito</SelectItem>
                <SelectItem value="pix" className="text-white hover:bg-slate-700 cursor-pointer">Pix</SelectItem>
                <SelectItem value="other" className="text-white hover:bg-slate-700 cursor-pointer">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo (apenas para dinheiro) */}
          {formData.payment_method === "cash" && (
            <div className="space-y-2">
              <Label className="text-slate-300">Tipo *</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  {typeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-slate-700 cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Valor do comprovante perdido (apenas para cartão/pix/outros) */}
          {formData.payment_method !== "cash" && (
            <div className="space-y-2">
              <Label className="text-slate-300">Valor do comprovante perdido</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="0.00"
              />
            </div>
          )}

          {/* Valor (R$) - só para dinheiro */}
          {formData.payment_method === "cash" && (
            <div className="space-y-2">
              <Label className="text-slate-300">Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="0.00"
              />
            </div>
          )}

          {/* Número do Vale */}
          <div className="space-y-2">
            <Label className="text-slate-300">Número do Vale</Label>
            <Input
              value={formData.voucher_number}
              onChange={(e) => handleChange("voucher_number", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Ex: V001234"
            />
          </div>

          {/* Status do Vale (apenas para cartão/pix/outros) */}
          {formData.payment_method !== "cash" && (
            <div className="space-y-2">
              <Label className="text-slate-300">Status do Vale</Label>
              <Select value={formData.voucher_status} onValueChange={(v) => handleChange("voucher_status", v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-slate-700 cursor-pointer">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.voucher_status === "paid" && (
            <div className="space-y-2">
              <Label className="text-slate-300">Data do Pagamento</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleChange("payment_date", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-300">Motivo</Label>
            <Input
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Motivo da quebra de caixa"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-300">Observações</Label>
            <Textarea
              value={formData.observations}
              onChange={(e) => handleChange("observations", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white min-h-20"
              placeholder="Observações adicionais..."
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !formData.date || !formData.store_id || !formData.cashier_id || !formData.amount} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {cashBreak ? "Salvar" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}