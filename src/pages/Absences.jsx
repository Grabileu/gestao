import AdvancedAbsenceForm from "@/Components/absences/AdvancedAbsenceForm";
import AbsenceTable from "@/Components/absences/AbsenceTable";

export default function Absences() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Faltas e Atestados</h1>
            <p className="text-slate-400 mt-1">Gerencie faltas e atestados médicos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AdvancedAbsenceForm />
          </div>
          <div className="lg:col-span-2">
            <AbsenceTable />
          </div>
        </div>
      </div>
    </div>
  )
}
