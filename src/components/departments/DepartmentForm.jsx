import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44SupabaseClient";
import { Loader2, Plus, X } from "lucide-react";

export default function DepartmentForm({ open, onClose, department, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
    budget: "",
    status: "active",
    positions: []
  });
  const [newPosition, setNewPosition] = useState("");
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (department) {
      setFormData({ 
        ...department, 
        budget: department.budget?.toString() || "",
        positions: Array.isArray(department.positions) ? department.positions : []
      });
    } else {
      setFormData({
        name: "",
        description: "",
        manager: "",
        budget: "",
        status: "active",
        positions: []
      });
    }
    setNewPosition("");
  }, [department, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPosition = () => {
    if (newPosition.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        positions: [...prev.positions, newPosition.trim()] 
      }));
      setNewPosition("");
    }
  };

  const handleRemovePosition = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      positions: prev.positions.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const departmentData = {
        name: formData.name,
        description: formData.description,
        manager: formData.manager,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        status: formData.status,
        positions: formData.positions
      };

      if (department?.id) {
        const { error } = await base44.entities.Department.update(department.id, departmentData);
        if (error) throw error;
      } else {
        const { data, error } = await base44.entities.Department.create(departmentData);
        if (error) throw error;
        console.log("Departamento criado:", data);
      }

      setSaving(false);
      onSave();
    } catch (err) {
      console.error("Erro ao salvar departamento:", err);
      alert("Erro ao salvar: " + (err.message || "Verifique o console para detalhes"));
      setSaving(false);
    }
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
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="active" className="text-white hover:bg-slate-700 cursor-pointer">Ativo</SelectItem>
                  <SelectItem value="inactive" className="text-white hover:bg-slate-700 cursor-pointer">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Cargos do Departamento</Label>
            <div className="flex gap-2">
              <Input
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPosition())}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Ex: Balconista, Repositor..."
              />
              <Button type="button" onClick={handleAddPosition} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.positions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.positions.map((pos, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-slate-700 text-white px-3 py-1 rounded-full text-sm">
                    <span>{pos}</span>
                    <button type="button" onClick={() => handleRemovePosition(idx)} className="hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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