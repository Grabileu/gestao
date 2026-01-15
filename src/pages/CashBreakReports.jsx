import CashBreakFilters from "@/Components/cashbreaks/CashBreakFilters";
import CashBreakStats from "@/Components/cashbreaks/CashBreakStats";
import CashBreakTable from "@/Components/cashbreaks/CashBreakTable";

export default function CashBreakReports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios de Quebra de Caixa</h1>
          <p className="text-slate-400 mt-1">Visualize relatórios de quebra de caixa</p>
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
  )
}
