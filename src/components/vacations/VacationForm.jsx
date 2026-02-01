import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

export default function VacationForm({ onSave, onCancel, vacation = {}, employees = [] }) {
  const [formData, setFormData] = useState({ ...vacation });
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
    setFormData({ ...vacation });
    setSearchEmployee("");
    setShowEmployeeList(false);
  }, [vacation]);

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

  return (
    <div className="bg-slate-900 p-6 rounded-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Programar Férias</h2>
      <form
        className="space-y-4"
        onSubmit={e => {
          e.preventDefault();
          if (onSave) onSave(formData);
        }}
      >
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
          <label className="block text-sm text-slate-300 mb-1">Período Aquisitivo</label>
          <input
            type="text"
            value={formData.period || ""}
            onChange={e => setFormData(prev => ({ ...prev, period: e.target.value }))}
            className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Dias</label>
            <input
              type="number"
              value={formData.days || ""}
              onChange={e => setFormData(prev => ({ ...prev, days: e.target.value }))}
              className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Início</label>
            <input
              type="date"
              value={formData.start_date || ""}
              onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Valor</label>
          <input
            type="number"
            value={formData.value || ""}
            onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
            className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Status</label>
          <select
            value={formData.status || ""}
            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
          >
            <option value="pendente">Pendente</option>
            <option value="agendada">Agendada</option>
            <option value="em_gozo">Em Gozo</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" size="default" onClick={onCancel} className="border-slate-600 text-white hover:bg-slate-700">
            Cancelar
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
        </div>
      </form>
    </div>
  );
}
