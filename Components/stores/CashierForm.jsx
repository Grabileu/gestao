import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function CashierForm({ open, onClose, cashier, stores, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    store_id: "",
    store_name: "",
    status: "active"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cashier) {
      setFormData({ ...cashier });
    } else {
      setFormData({
        name: "",
        code: "",
        store_id: "",
        store_name: "",
        status: "active"
      });
    }
  }, [cashier, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "store_id") {
      const store = stores.find(s => s.id === value);
      setFormData(prev => ({ 
        ...prev, 
        store_id: value, 
        store_name: store?.name || ""
      }));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    
    if (cashier?.id) {
      await base44.entities.Cashier.update(cashier.id, formData);
    } else {
      await base44.entities.Cashier.create(formData);
    }
    
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {cashier ? "Editar Operador" : "Novo Operador de Caixa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Nome do operador"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Código/Matrícula</Label>
              <Input
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Ex: OP001"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="active" className="text-white hover:bg-slate-700">Ativo</SelectItem>
                  <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Loja *</Label>
            <Select value={formData.store_id} onValueChange={(v) => handleChange("store_id", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {stores.filter(s => s.status === 'active').map(store => (
                  <SelectItem key={store.id} value={store.id} className="text-white hover:bg-slate-700">
                    {store.code} - {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !formData.name || !formData.store_id} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {cashier ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}