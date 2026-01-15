import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/api/apiClient";
import { Loader2 } from "lucide-react";

export default function DepartmentForm({ open, onClose, department, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
    budget: "",
    status: "active"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({ ...department, budget: department.budget?.toString() || "" });
    } else {
      setFormData({
        name: "",
        description: "",
        manager: "",
        budget: "",
        status: "active"
      });
    }
  }, [department, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const data = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null
    };
    
    if (department?.id) {
      await api.entities.Department.update(department.id, data);
    } else {
      await api.entities.Department.create(data);
    }
    
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {department ? "Editar Departamento" : "Novo Departamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Nome do departamento"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white min-h-20"
              placeholder="Descrição do departamento..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Gerente</Label>
            <Input
              value={formData.manager}
              onChange={(e) => handleChange("manager", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Nome do gerente responsável"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Orçamento</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange("budget", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="0.00"
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
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !formData.name} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {department ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}