import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44SupabaseClient";
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
  const [loadingEmployees, setLoadingEmployees] = useState(false);

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
    async function fetchEmployees() {
      if (!formData.store_id) {
        setFilteredCashiers([]);
        return;
      }
      setLoadingEmployees(true);
      // Busca departamento CAIXAS
      let deptId = null;
      if (Array.isArray(stores) && stores.length > 0 && stores[0].departments) {
        const dept = stores[0].departments.find(d => d.name && d.name.toLowerCase() === "caixas");
        if (dept) deptId = dept.id;
      }
      // Se não achar pelo stores, busca pelo supabase
      if (!deptId) {
        const { data: depts } = await supabase.from("department").select("id, name");
        const dept = depts?.find(d => d.name && d.name.toLowerCase() === "caixas");
        if (dept) deptId = dept.id;
      }
      if (!deptId) {
        setFilteredCashiers([]);
        setLoadingEmployees(false);
        return;
      }
      // Busca funcionários ativos do departamento CAIXAS e da loja selecionada
      let { data: employees, error } = await supabase
        .from("employee")
        .select("id, full_name, store_id, status, department_id")
        .eq("department_id", deptId)
        .eq("store_id", formData.store_id)
        .eq("status", "active");
      employees = employees || [];
      // Se estiver editando, garante que o funcionário salvo está na lista
      if (cashBreak && cashBreak.cashier_id && !employees.find(e => String(e.id) === String(cashBreak.cashier_id))) {
        // Busca o funcionário pelo id
        const { data: emp } = await supabase
          .from("employee")
          .select("id, full_name, store_id, status, department_id")
          .eq("id", cashBreak.cashier_id)
          .single();
        if (emp) employees.push(emp);
      }
      setFilteredCashiers(
        employees.map(e => ({ id: e.id, name: e.full_name }))
      );
      setLoadingEmployees(false);
    }
    fetchEmployees();
  }, [formData.store_id, cashBreak]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      let next = { ...prev, [field]: value };
      if (field === "store_id") {
        const store = stores.find(s => String(s.id) === String(value));
        next = {
          ...next,
          store_id: value,
          store_name: store?.name || "",
          cashier_id: "",
          cashier_name: ""
        };
      }
      if (field === "cashier_id") {
        const cashier = cashiers.find(c => String(c.id) === String(value));
        next = {
          ...next,
          cashier_id: value,
          cashier_name: cashier?.name || ""
        };
      }
      // Corrige textarea de observações
      if (field === "observations") {
        next.observations = value;
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
    // Busca o funcionário selecionado na lista de filteredCashiers
    const selectedEmployee = filteredCashiers.find(e => String(e.id) === String(formData.cashier_id));

    let amount = formData.amount ? parseFloat(formData.amount) : 0;
    // Se for comprovante perdido, sempre R$5 para todas as formas de pagamento exceto dinheiro
    const formasDesconta5 = [
      "credit", "debit", "food", "pix", "pos", "client_credit", "other"
    ];
    if (formasDesconta5.includes(formData.payment_method)) {
      amount = 5;
    }

    // Corrige campos de data vazios para null
    const fixDate = (val) => val === "" ? null : val;
    const data = {
      ...formData,
      amount,
      store_name: store?.name || "",
      cashier_name: selectedEmployee?.name || "",
      date: fixDate(formData.date),
      payment_date: fixDate(formData.payment_date)
    };

    console.log('[DEBUG - CashBreakForm] Payload final enviado para CashBreak:', data);

    try {
      if (cashBreak?.id) {
        await base44.entities.CashBreak.update(cashBreak.id, data);
        console.log('[DEBUG] CashBreak atualizado com sucesso');
      } else {
        await base44.entities.CashBreak.create(data);
        console.log('[DEBUG] CashBreak criado com sucesso');
      }

      onSave();
    } catch (err) {
      console.error('[ERRO - CashBreakForm] Falha ao salvar quebra de caixa:', err);
      alert('Erro ao salvar quebra de caixa: ' + (err?.message || 'Verifique o console'));
    } finally {
      setSaving(false);
    }
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
                {/* Sempre mostra a loja salva, mesmo se inativa */}
                {(() => {
                  let storeList = stores.filter(s => s.status === 'active');
                  // Garante que a loja selecionada esteja na lista e no topo
                  if (formData.store_id) {
                    let selected = storeList.find(s => String(s.id) === String(formData.store_id));
                    if (!selected) {
                      selected = stores.find(s => String(s.id) === String(formData.store_id));
                      if (!selected && formData.store_name) selected = { id: formData.store_id, code: '', name: formData.store_name };
                      if (selected) storeList = [selected, ...storeList];
                    } else {
                      // Move para o topo
                      storeList = [selected, ...storeList.filter(s => String(s.id) !== String(formData.store_id))];
                    }
                  }
                  // Remove duplicatas
                  const seen = new Set();
                  storeList = storeList.filter(s => {
                    if (seen.has(String(s.id))) return false;
                    seen.add(String(s.id));
                    return true;
                  });
                  return storeList.map(store => (
                    <SelectItem key={store.id} value={String(store.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                      {store.code ? `${store.code} - ` : ''}{store.name}
                    </SelectItem>
                  ));
                })()}
              </SelectContent>
            </Select>
          </div>

          {/* Operador de Caixa */}
          <div className="space-y-2">
            <Label className="text-slate-300">Operador de Caixa *</Label>
            <Select 
              value={formData.cashier_id} 
              onValueChange={(v) => handleChange("cashier_id", v)}
              disabled={!formData.store_id || loadingEmployees}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue 
                  placeholder={
                    !formData.store_id 
                      ? "Selecione uma loja primeiro" 
                      : loadingEmployees
                        ? "Carregando funcionários..."
                        : filteredCashiers.length === 0 
                          ? "Nenhum funcionário do departamento CAIXAS nesta loja" 
                          : "Selecione o funcionário"
                  } 
                />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                {/* Sempre mostra o funcionário salvo, mesmo se não estiver no filtro */}
                {(() => {
                  let cashierList = filteredCashiers;
                  // Garante que o funcionário selecionado esteja no topo
                  if (formData.cashier_id) {
                    let selected = filteredCashiers.find(c => String(c.id) === String(formData.cashier_id));
                    if (!selected) selected = { id: formData.cashier_id, name: formData.cashier_name || "Funcionário salvo" };
                    cashierList = [selected, ...filteredCashiers.filter(c => String(c.id) !== String(formData.cashier_id))];
                  }
                  // Remove duplicatas
                  const seen = new Set();
                  cashierList = cashierList.filter(c => {
                    if (seen.has(String(c.id))) return false;
                    seen.add(String(c.id));
                    return true;
                  });
                  return cashierList.map(cashier => (
                    <SelectItem key={cashier.id} value={String(cashier.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                      {cashier.name}
                    </SelectItem>
                  ));
                })()}
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
                <SelectItem value="credit" className="text-white hover:bg-slate-700 cursor-pointer">Cartão Crédito</SelectItem>
                <SelectItem value="debit" className="text-white hover:bg-slate-700 cursor-pointer">Cartão Débito</SelectItem>
                <SelectItem value="food" className="text-white hover:bg-slate-700 cursor-pointer">Cartão Alimentação</SelectItem>
                <SelectItem value="pix" className="text-white hover:bg-slate-700 cursor-pointer">Pix</SelectItem>
                <SelectItem value="pos" className="text-white hover:bg-slate-700 cursor-pointer">POS</SelectItem>
                <SelectItem value="client_credit" className="text-white hover:bg-slate-700 cursor-pointer">Cliente a Prazo</SelectItem>
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