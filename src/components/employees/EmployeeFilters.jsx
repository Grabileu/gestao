import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function EmployeeFilters({ filters, onFilterChange }) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <Input
        placeholder="Buscar por nome ou email..."
        value={filters?.search || ""}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px]"
      />
      <Select
        value={filters?.department || "all"}
        onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
      >
        <option value="all">Todos os departamentos</option>
        <option value="rh">Recursos Humanos</option>
        <option value="ti">TI</option>
        <option value="vendas">Vendas</option>
        <option value="financeiro">Financeiro</option>
      </Select>
      <Select
        value={filters?.status || "all"}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
      >
        <option value="all">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="inactive">Inativo</option>
        <option value="suspended">Suspenso</option>
      </Select>
    </div>
  );
}
