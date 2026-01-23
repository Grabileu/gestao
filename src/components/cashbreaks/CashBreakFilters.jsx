import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X, Download } from "lucide-react";

export default function CashBreakFilters({ filters, onChange, stores, cashiers, onClear, onExport, showExport = false }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const hasFilters = filters.store !== "all" || 
                     filters.cashier !== "all" || 
                     filters.type !== "all" ||
                     filters.status !== "all" ||
                     filters.date_from ||
                     filters.date_to;

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Filtros</h3>
          </div>
          <div className="flex gap-2">
            {hasFilters && (
              <Button variant="ghost" onClick={onClear} className="text-slate-400 hover:text-white hover:bg-slate-700">
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
            {showExport && (
              <Button onClick={onExport} className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col space-y-2">
            <span className="text-slate-400 text-xs mb-1 ml-1">Data De</span>
            <Input
              type="date"
              value={filters.date_from || ""}
              onChange={(e) => handleChange("date_from", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-slate-400 text-xs mb-1 ml-1">Data Até</span>
            <Input
              type="date"
              value={filters.date_to || ""}
              onChange={(e) => handleChange("date_to", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-slate-400 text-xs mb-1 ml-1">Loja</span>
            <Select value={filters.store} onValueChange={(v) => handleChange("store", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todas</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={String(store.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                    {store.code} - {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-slate-400 text-xs mb-1 ml-1">Operador</span>
            <Select value={filters.cashier} onValueChange={(v) => handleChange("cashier", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                {cashiers.map(cashier => (
                  <SelectItem key={cashier.id} value={String(cashier.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-slate-400 text-xs mb-1 ml-1">Tipo</span>
            <Select value={filters.type} onValueChange={(v) => handleChange("type", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                <SelectItem value="shortage" className="text-white hover:bg-slate-700 cursor-pointer">Falta</SelectItem>
                <SelectItem value="surplus" className="text-white hover:bg-slate-700 cursor-pointer">Sobra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-slate-400 text-xs mb-1 ml-1">Status Vale</span>
            <Select value={filters.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                <SelectItem value="all" className="text-white hover:bg-slate-700 cursor-pointer">Todos</SelectItem>
                <SelectItem value="pending" className="text-white hover:bg-slate-700 cursor-pointer">Pendente</SelectItem>
                <SelectItem value="paid" className="text-white hover:bg-slate-700 cursor-pointer">Pago</SelectItem>
                <SelectItem value="cancelled" className="text-white hover:bg-slate-700 cursor-pointer">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}