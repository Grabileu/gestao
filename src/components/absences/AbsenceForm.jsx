import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "/src/components/ui/dialog";
import { Button } from "/src/components/ui/button";
import { Input } from "/src/components/ui/input";
import { Label } from "/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/src/components/ui/select";
import { Textarea } from "/src/components/ui/textarea";
import { Checkbox } from "/src/components/ui/checkbox";
import { base44 } from "/src/api/base44SupabaseClient";
import { AlertCircle } from "lucide-react";

const absenceTypes = [
  { value: "absence", label: "Falta" },
  { value: "medical_certificate", label: "Atestado Médico" },
  { value: "justified", label: "Falta Justificada" }
];

export default function AbsenceForm({ open, onClose, absence, employees, onSave }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    date: "",
    type: "absence",
    hours: "",
    full_day: true,
    reason: "",
    document_url: "",
    cid: "",
    doctor_name: "",
    crm: "",
    days_off: 1,
    discount_salary: true,
    month_reference: "",
    status: "pending",
    observations: ""
  });
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (absence) {
      setFormData({
        ...absence,
        hours: absence.hours || "",
        days_off: absence.days_off || 1
      });
    } else {
      setFormData({
        employee_id: "",
        employee_name: "",
        date: "",
        type: "absence",
        hours: "",
        full_day: true,
        reason: "",
        document_url: "",
        cid: "",
        doctor_name: "",
        crm: "",
        days_off: 1,
        discount_salary: true,
        month_reference: "",
        status: "pending",
        observations: ""
      });
    }
    setValidationError("");
  }, [absence, open]);

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => String(e.id) === String(employeeId));
    setFormData(prev => ({
      ...prev,
      employee_id: employeeId,
      employee_name: employee?.full_name || ""
    }));
  };

  const handleDateChange = (date) => {
    const monthRef = date ? date.substring(0, 7) : "";
    setFormData(prev => ({
      ...prev,
      date,
      month_reference: monthRef
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.employee_id) {
      setValidationError("Funcionário é obrigatório");
      return;
    }
    if (!formData.date) {
      setValidationError("Data é obrigatória");
      return;
    }
    
    setValidationError("");
    setLoading(true);
    
    const dataToSave = {
      ...formData,
      hours: formData.hours ? parseFloat(formData.hours) : null,
      days_off: parseInt(formData.days_off) || 1
    };

    if (absence?.id) {
      await base44.entities.Absence.update(absence.id, dataToSave);
    } else {
      await base44.entities.Absence.create(dataToSave);
    }
    
    setLoading(false);
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {absence ? "Editar Falta/Atestado" : "Nova Falta/Atestado"}
          </DialogTitle>
        </DialogHeader>
        
        {validationError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">{validationError}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Funcionário *</Label>
              <Select value={String(formData.employee_id)} onValueChange={handleEmployeeChange}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  {employees.filter(e => e.status === "active").map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)} className="text-white hover:bg-slate-700 cursor-pointer">{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300">Data *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Tipo *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  {absenceTypes.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700 cursor-pointer">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300">Dias de Afastamento</Label>
              <Input
                type="number"
                min="1"
                value={formData.days_off}
                onChange={(e) => setFormData(prev => ({ ...prev, days_off: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="full_day"
                checked={formData.full_day}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, full_day: checked }))}
              />
              <Label htmlFor="full_day" className="text-slate-300">Dia inteiro</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="discount_salary"
                checked={formData.discount_salary}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, discount_salary: checked }))}
              />
              <Label htmlFor="discount_salary" className="text-slate-300">Desconta do salário</Label>
            </div>
          </div>
          
          {!formData.full_day && (
            <div className="w-1/2">
              <Label className="text-slate-300">Horas de ausência</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          )}
          
          {formData.type === "medical_certificate" && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg">
              <div>
                <Label className="text-slate-300">CID</Label>
                <Input
                  value={formData.cid}
                  onChange={(e) => setFormData(prev => ({ ...prev, cid: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Ex: J11"
                />
              </div>
              <div>
                <Label className="text-slate-300">Nome do Médico</Label>
                <Input
                  value={formData.doctor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">CRM</Label>
                <Input
                  value={formData.crm}
                  onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-slate-300">Motivo</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
            />
          </div>
          
          <div>
            <Label className="text-slate-300">Observações</Label>
            <Textarea
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}