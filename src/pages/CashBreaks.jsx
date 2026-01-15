import CashBreakFilters from "@/Components/cashbreaks/CashBreakFilters";
import CashBreakStats from "@/Components/cashbreaks/CashBreakStats";
import CashBreakTable from "@/Components/cashbreaks/CashBreakTable";

export default function CashBreaks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Quebras de Caixa</h1>
            <p className="text-slate-400 mt-1">Gerencie quebras de caixa</p>
          </div>
        </div>

        <CashBreakFilters />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CashBreakStats />
          </div>
          <div className="lg:col-span-2">
            <CashBreakTable />
          </div>
        </div>
      </div>
    </div>
  );
}
