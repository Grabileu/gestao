import ReportFilters from "@/Components/reports/ReportFilters";
import ReportSummary from "@/Components/reports/ReportSummary";
import ReportTable from "@/Components/reports/ReportTable";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Relatórios</h1>
            <p className="text-slate-400 mt-1">Visualize e exporte relatórios</p>
          </div>
        </div>

        <ReportFilters />
        <ReportSummary />
        <ReportTable />
      </div>
    </div>
  )
}
