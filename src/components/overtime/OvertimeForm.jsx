import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44SupabaseClient";
import { AlertCircle, Search, X } from "lucide-react";
import DatePickerInput from "@/components/vacations/DatePickerInput";

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
  const [validationError, setValidationError] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  // Ordenar funcionários alfabeticamente e filtrar ativos
  const sortedEmployees = employees
    .filter(e => e.status === "active")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Filtrar por busca
  const filteredEmployees = sortedEmployees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchEmployee.toLowerCase())
  );

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
    setSearchEmployee(""); // Reseta a busca quando abre
    setShowEmployeeList(false); // Fecha a lista
    setValidationError("");
  }, [overtime, open]);

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => String(e.id) === String(employeeId));
    setFormData(prev => ({
      ...prev,
      employee_id: employeeId,
      employee_name: employee?.full_name || ""
    }));
    setShowEmployeeList(false);
    setSearchEmployee("");
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
    if (!formData.hours) {
      setValidationError("Horas é obrigatório");
      return;
    }
    
    setValidationError("");
    setLoading(true);
    
    const dataToSave = {
      ...formData,
      hours: parseFloat(formData.hours) || 0
    };

    if (overtime?.id) {
      await base44.entities.Overtime.update(overtime.id, dataToSave);
    } else {
      await base44.entities.Overtime.create(dataToSave);
    }
    
    setLoading(false);
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {overtime ? "Editar Hora Extra" : "Nova Hora Extra"}
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
          <div className="col-span-2">
              <Label className="text-slate-300 mb-2 block">Funcionário *</Label>
              <div className="relative">
                {/* Input que mostra selecionado */}
                <button
                  type="button"
                  onClick={() => setShowEmployeeList(!showEmployeeList)}
                  className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-white text-left flex items-center justify-between hover:border-slate-500"
                >
                  <span className={formData.employee_name ? "text-white" : "text-slate-400"}>
                    {formData.employee_name || "Selecione um funcionário"}
                  </span>
                  {formData.employee_name && (
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, employee_id: "", employee_name: "" }));
                        setSearchEmployee("");
                      }}
                    />
                  )}
                </button>

                {/* Dropdown com busca */}
                {showEmployeeList && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-md z-50 shadow-lg">
                    <div className="p-2 border-b border-slate-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                          autoFocus
                          type="text"
                          placeholder="Pesquisar funcionário..."
                          value={searchEmployee}
                          onChange={(e) => setSearchEmployee(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white pl-10"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(emp => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => handleEmployeeChange(String(emp.id))}
                            className="w-full text-left px-3 py-2 hover:bg-slate-700 text-white text-sm"
                          >
                            {emp.full_name}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          Nenhum funcionário encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300">Data *</Label>
              <DatePickerInput
                value={formData.date || ""}
                onChange={(val) => handleDateChange(val)}
                onEnter={() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");
                  handleDateChange(`${year}-${month}-${day}`);
                }}
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
                <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                  <SelectItem value="50" className="text-white hover:bg-slate-700 cursor-pointer">Hora Extra 50%</SelectItem>
                  <SelectItem value="100" className="text-white hover:bg-slate-700 cursor-pointer">Hora Extra 100%</SelectItem>
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
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}