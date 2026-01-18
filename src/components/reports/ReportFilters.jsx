import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X, Download } from "lucide-react";

export default function ReportFilters({ filters, onChange, departments, onClear, onExport }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const hasFilters = filters.department !== "all" || 
                     filters.status !== "all" || 
                     filters.contract_type !== "all" ||
                     filters.hire_date_from ||
                     filters.hire_date_to ||
                     filters.salary_min ||
                     filters.salary_max;

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Filtros do Relatório</h3>
          </div>
          <div className="flex gap-2">
            {hasFilters && (
              <Button variant="ghost" onClick={onClear} className="text-slate-400 hover:text-white hover:bg-slate-700">
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
            <Button onClick={onExport} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400">Departamento</Label>
            <Select value={filters.department} onValueChange={(v) => handleChange("department", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={String(dept.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Status</Label>
            <Select value={filters.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                <SelectItem value="active" className="text-white hover:bg-slate-700 cursor-pointer">Ativo</SelectItem>
                <SelectItem value="inactive" className="text-white hover:bg-slate-700 cursor-pointer">Inativo</SelectItem>
                <SelectItem value="on_leave" className="text-white hover:bg-slate-700 cursor-pointer">Afastado</SelectItem>
                <SelectItem value="terminated" className="text-white hover:bg-slate-700 cursor-pointer">Desligado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Tipo de Contrato</Label>
            <Select value={filters.contract_type} onValueChange={(v) => handleChange("contract_type", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                <SelectItem value="clt" className="text-white hover:bg-slate-700 cursor-pointer">CLT</SelectItem>
                <SelectItem value="pj" className="text-white hover:bg-slate-700 cursor-pointer">PJ</SelectItem>
                <SelectItem value="temporary" className="text-white hover:bg-slate-700 cursor-pointer">Temporário</SelectItem>
                <SelectItem value="intern" className="text-white hover:bg-slate-700 cursor-pointer">Estagiário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Cidade</Label>
            <Input
              value={filters.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              placeholder="Filtrar por cidade"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Admissão De</Label>
            <Input
              type="date"
              value={filters.hire_date_from || ""}
              onChange={(e) => handleChange("hire_date_from", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Admissão Até</Label>
            <Input
              type="date"
              value={filters.hire_date_to || ""}
              onChange={(e) => handleChange("hire_date_to", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Salário Mínimo</Label>
            <Input
              type="number"
              value={filters.salary_min || ""}
              onChange={(e) => handleChange("salary_min", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              placeholder="R$ 0.00"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Salário Máximo</Label>
            <Input
              type="number"
              value={filters.salary_max || ""}
              onChange={(e) => handleChange("salary_max", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              placeholder="R$ 0.00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}