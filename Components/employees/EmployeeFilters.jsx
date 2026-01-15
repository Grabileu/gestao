import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export default function EmployeeFilters({ filters, onChange, departments, onClear }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const hasFilters = filters.search || filters.department || filters.status || filters.contract_type;

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome, email, cargo..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
        />
      </div>

      <Select value={filters.department} onValueChange={(v) => handleChange("department", v)}>
        <SelectTrigger className="w-44 bg-slate-800 border-slate-600 text-white">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          <SelectItem value="all" className="text-white hover:bg-slate-700">Todos</SelectItem>
          {departments.map(dept => (
            <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-slate-700">
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => handleChange("status", v)}>
        <SelectTrigger className="w-36 bg-slate-800 border-slate-600 text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          <SelectItem value="all" className="text-white hover:bg-slate-700">Todos</SelectItem>
          <SelectItem value="active" className="text-white hover:bg-slate-700">Ativo</SelectItem>
          <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inativo</SelectItem>
          <SelectItem value="on_leave" className="text-white hover:bg-slate-700">Afastado</SelectItem>
          <SelectItem value="terminated" className="text-white hover:bg-slate-700">Desligado</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.contract_type} onValueChange={(v) => handleChange("contract_type", v)}>
        <SelectTrigger className="w-36 bg-slate-800 border-slate-600 text-white">
          <SelectValue placeholder="Contrato" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          <SelectItem value="all" className="text-white hover:bg-slate-700">Todos</SelectItem>
          <SelectItem value="clt" className="text-white hover:bg-slate-700">CLT</SelectItem>
          <SelectItem value="pj" className="text-white hover:bg-slate-700">PJ</SelectItem>
          <SelectItem value="temporary" className="text-white hover:bg-slate-700">Temporário</SelectItem>
          <SelectItem value="intern" className="text-white hover:bg-slate-700">Estagiário</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={onClear} className="text-slate-400 hover:text-white hover:bg-slate-700">
          <X className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      )}
    </div>
  );
}