import OvertimeTable from "@/Components/overtime/OvertimeTable";
import OvertimeForm from "@/Components/overtime/OvertimeForm";

export default function OvertimeManagement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Horas Extras</h1>
            <p className="text-slate-400 mt-1">Gerencie horas extras dos funcionários</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <OvertimeForm />
          </div>
          <div className="lg:col-span-2">
            <OvertimeTable />
          </div>
        </div>
      </div>
    </div>
  );
}
