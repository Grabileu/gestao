import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VacationForm({ onSave, onCancel, vacation = {}, employees = [] }) {
  const [formData, setFormData] = useState({ ...vacation });

  useEffect(() => {
    setFormData({ ...vacation });
  }, [vacation]);

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => String(e.id) === String(employeeId));
    setFormData(prev => ({
      ...prev,
      employee_id: employeeId,
      employee_name: employee?.full_name || ""
    }));
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
          <label className="block text-sm text-slate-300 mb-1">Funcionário</label>
          <Select value={String(formData.employee_id || "")} onValueChange={handleEmployeeChange}>
            <SelectTrigger className="w-44 bg-slate-800 border-slate-600 text-white">
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
