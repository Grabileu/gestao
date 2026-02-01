import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "/src/components/ui/dialog";
import { Button } from "/src/components/ui/button";
import { Input } from "/src/components/ui/input";
import { Label } from "/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/src/components/ui/select";
import { Textarea } from "/src/components/ui/textarea";
import { Checkbox } from "/src/components/ui/checkbox";
import { base44 } from "/src/api/base44SupabaseClient";
import DatePickerInput from "/src/components/vacations/DatePickerInput";
import { AlertCircle, Search, X } from "lucide-react";

const absenceTypes = [
  { value: "absence", label: "Falta" },
  { value: "medical_certificate", label: "Atestado Médico" },
  { value: "justified", label: "Falta Justificada" },
  { value: "delay", label: "Atraso" }
];

const shiftLabels = {
  morning: "Manhã",
  afternoon: "Tarde",
  night: "Noite"
};

const shiftRegex = /(^|\n)Turno:\s*(Manhã|Tarde|Noite)\s*/i;

function extractShift(observations = "") {
  const match = observations.match(shiftRegex);
  if (!match) return "";
  const label = match[2]?.toLowerCase();
  if (label === "manhã" || label === "manha") return "morning";
  if (label === "tarde") return "afternoon";
  if (label === "noite") return "night";
  return "";
}

function normalizeObservations(observations = "", shift = "") {
  const cleaned = observations.replace(shiftRegex, "\n").trim();
  if (!shift) return cleaned;
  const prefix = `Faltou pela ${shiftLabels[shift]}`;
  return cleaned ? `${prefix}\n${cleaned}` : prefix;
}

export default function AbsenceForm({ open, onClose, absence, employees, onSave }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    date: "",
    type: "absence",
    hours: "",
    shift: "",
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
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Ordenar funcionários alfabeticamente e filtrar ativos
  const sortedEmployees = employees
    .filter(e => e.status === "active")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Filtrar por busca
  const filteredEmployees = sortedEmployees.filter(emp =>
    emp.full_name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  useEffect(() => {
    if (absence) {
      setFormData({
        ...absence,
        hours: absence.hours || "",
        days_off: absence.days_off || 1,
        discount_salary: absence.type === "medical_certificate" ? false : absence.discount_salary,
        shift: extractShift(absence.observations)
      });
    } else {
      setFormData({
        employee_id: "",
        employee_name: "",
        date: "",
        type: "absence",
        hours: "",
        shift: "",
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
    setEmployeeSearch("");
    setShowEmployeeList(false);
    setValidationError("");
  }, [absence, open]);
  // Sempre que o tipo for medical_certificate, nunca desconta do salário
  useEffect(() => {
    if (formData.type === "medical_certificate" && formData.discount_salary) {
      setFormData(prev => ({ ...prev, discount_salary: false }));
    }
  }, [formData.type]);

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => String(e.id) === String(employeeId));
    setFormData(prev => ({
      ...prev,
      employee_id: employeeId,
      employee_name: employee?.full_name || ""
    }));
    setShowEmployeeList(false);
    setEmployeeSearch("");
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
    
    try {
      const { shift, ...rest } = formData;
      const dataToSave = {
        ...rest,
        observations: normalizeObservations(formData.observations, shift),
        hours: formData.hours ? parseFloat(formData.hours) : null,
        days_off: parseInt(formData.days_off) || 1
      };

      console.log("Dados a salvar:", dataToSave);

      let result;
      if (absence?.id) {
        result = await base44.entities.Absence.update(absence.id, dataToSave);
        console.log("Atualização bem-sucedida:", result);
      } else {
        result = await base44.entities.Absence.create(dataToSave);
        console.log("Criação bem-sucedida:", result);
      }

      if (result?.error) {
        throw new Error(result.message || "Erro ao salvar falta/atestado");
      }

      if (!result) {
        console.warn("Nenhum registro retornado no save. Buscando lista para localizar o novo item...");
        const all = await base44.entities.Absence.list();
        const matches = all.filter(a => (
          String(a.employee_id) === String(dataToSave.employee_id) &&
          String(a.date) === String(dataToSave.date) &&
          String(a.type) === String(dataToSave.type)
        ));
        result = matches.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))[0] || null;
        console.log("Registro encontrado após busca:", result);
      }
      
      setLoading(false);
      console.log("Chamando onSave...");
      onSave(result);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar falta/atestado:", error);
      console.error("Erro completo:", JSON.stringify(error, null, 2));
      setValidationError(`Erro ao salvar: ${error.message || JSON.stringify(error)}`);
      setLoading(false);
    }
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
                        setEmployeeSearch("");
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
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
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
            
            <div className="flex gap-2 items-end">
              <div style={{ minWidth: 0, flex: '1 1 0%' }}>
                <Label className="text-slate-300">Tipo *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    {absenceTypes.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700 cursor-pointer">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "delay" && (
                <div style={{ width: 140 }}>
                  <Label className="text-slate-300">Horas ausente</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Horas ausente"
                    value={formData.hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              )}
            </div>
            
            {formData.type === "medical_certificate" && (
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
            )}
          </div>
          
          {/* Para atraso, mostrar apenas desconta do salário. Para outros, manter Dia inteiro + desconta */}
          {formData.type === "delay" ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="discount_salary"
                  checked={formData.discount_salary}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, discount_salary: checked }))}
                  className="border-slate-600 bg-slate-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="discount_salary" className="text-slate-300">Desconta do salário</Label>
              </div>
            </div>
          ) : formData.type !== "medical_certificate" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="full_day"
                  checked={formData.full_day}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, full_day: checked }))}
                  className="border-slate-600 bg-slate-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="full_day" className="text-slate-300">Dia inteiro</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="discount_salary"
                  checked={formData.discount_salary}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, discount_salary: checked }))}
                  className="border-slate-600 bg-slate-900 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="discount_salary" className="text-slate-300">Desconta do salário</Label>
              </div>
            </div>
          )}
          
          {!formData.full_day && (
            <div className="flex gap-4 items-end">
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
              <div className="w-1/2">
                <Label className="text-slate-300">Turno que faltou</Label>
                <Select
                  value={formData.shift || ""}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, shift: v }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    <SelectItem value="morning" className="text-white hover:bg-slate-700 cursor-pointer">Manhã</SelectItem>
                    <SelectItem value="afternoon" className="text-white hover:bg-slate-700 cursor-pointer">Tarde</SelectItem>
                    <SelectItem value="night" className="text-white hover:bg-slate-700 cursor-pointer">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}