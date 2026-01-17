import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function StoreForm({ open, onClose, store, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    manager: "",
    status: "active"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({ ...store });
    } else {
      setFormData({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        manager: "",
        status: "active"
      });
    }
  }, [store, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    
    if (store?.id) {
      await base44.entities.Store.update(store.id, formData);
    } else {
      await base44.entities.Store.create(formData);
    }
    
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {store ? "Editar Loja" : "Nova Loja"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Código *</Label>
              <Input
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Ex: L001"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="active" className="text-white hover:bg-slate-700">Ativa</SelectItem>
                  <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Nome da loja"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Gerente</Label>
            <Input
              value={formData.manager}
              onChange={(e) => handleChange("manager", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Nome do gerente"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Endereço</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Endereço da loja"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Estado</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="UF"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !formData.name || !formData.code} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {store ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}