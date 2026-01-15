import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/api/apiClient";

export default function OvertimeForm({ open, onClose, overtime, employees, onSave }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    date: "",
    hours: "",
    type: "50",
    reason: "",
    month_reference: "",
    status: "pending",
    observations: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (overtime) {
      setFormData({
        ...overtime,
        hours: overtime.hours?.toString() || ""
      });
    } else {
      setFormData({
        employee_id: "",
        employee_name: "",
        date: "",
        hours: "",
        type: "50",
        reason: "",
        month_reference: "",
        status: "pending",
        observations: ""
      });
    }
  }, [overtime, open]);

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
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
    setLoading(true);
    
    const dataToSave = {
      ...formData,
      hours: parseFloat(formData.hours) || 0
    };

    if (overtime?.id) {
      await api.entities.Overtime.update(overtime.id, dataToSave);
    } else {
      await api.entities.Overtime.create(dataToSave);
    }
    
    setLoading(false);
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {overtime ? "Editar Hora Extra" : "Nova Hora Extra"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-slate-300">Funcionário *</Label>
              <Select value={formData.employee_id} onValueChange={handleEmployeeChange}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === "active").map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
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
              <Label className="text-slate-300">Horas *</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label className="text-slate-300">Tipo *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">Hora Extra 50%</SelectItem>
                  <SelectItem value="100">Hora Extra 100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
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
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600">
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