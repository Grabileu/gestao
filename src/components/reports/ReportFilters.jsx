import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function ReportFilters({ filters, onFilterChange }) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <Input
        placeholder="Buscar..."
        value={filters?.search || ""}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px]"
      />
      <Select
        value={filters?.type || "all"}
        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
      >
        <option value="all">Todos os tipos</option>
        <option value="salary">Folha de Pagamento</option>
        <option value="attendance">Frequência</option>
        <option value="absences">Ausências</option>
      </Select>
    </div>
  );
}
