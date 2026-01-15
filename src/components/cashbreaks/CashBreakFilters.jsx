import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function CashBreakFilters({ filters, onFilterChange }) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <Input
        placeholder="Buscar por loja ou funcionário..."
        value={filters?.search || ""}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px]"
      />
      <Select
        value={filters?.status || "all"}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
      >
        <option value="all">Todos os status</option>
        <option value="approved">Aprovado</option>
        <option value="pending">Pendente</option>
        <option value="rejected">Rejeitado</option>
      </Select>
      <Input
        type="month"
        value={filters?.month || ""}
        onChange={(e) => onFilterChange({ ...filters, month: e.target.value })}
        className="flex-1 min-w-[150px]"
      />
    </div>
  );
}
