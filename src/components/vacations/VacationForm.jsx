import React from "react";
import { Button } from "@/components/ui/button";

export default function VacationForm({ onSave, onCancel, vacation }) {
  // Layout simples para cadastro/edição de férias
  return (
    <div className="bg-slate-900 p-6 rounded-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Programar Férias</h2>
      <form
        className="space-y-4"
        onSubmit={e => {
          e.preventDefault();
          if (onSave) onSave(vacation);
        }}
      >
        <div>
          <label className="block text-sm text-slate-300 mb-1">Funcionário</label>
          <input
            type="text"
            value={vacation?.employee_name || ""}
            readOnly
            className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Período Aquisitivo</label>
          <input
            type="text"
            value={vacation?.period || ""}
            onChange={e => vacation.period = e.target.value}
            className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Dias</label>
            <input
              type="number"
              value={vacation?.days || ""}
              onChange={e => vacation.days = e.target.value}
              className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Início</label>
            <input
              type="date"
              value={vacation?.start_date || ""}
              onChange={e => vacation.start_date = e.target.value}
              className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Valor</label>
          <input
            type="number"
            value={vacation?.value || ""}
            onChange={e => vacation.value = e.target.value}
            className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Status</label>
          <select
            value={vacation?.status || ""}
            onChange={e => vacation.status = e.target.value}
            className="w-full rounded bg-slate-800 border-slate-700 text-white px-3 py-2"
          >
            <option value="pendente">Pendente</option>
            <option value="agendada">Agendada</option>
            <option value="em_gozo">Em Gozo</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancelar</Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
        </div>
      </form>
    </div>
  );
}
