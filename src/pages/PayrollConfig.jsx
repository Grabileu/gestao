import PayrollConfigForm from "@/components/payroll/PayrollConfigForm";

export default function PayrollConfig() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações da Folha</h1>
          <p className="text-slate-400 mt-1">Configure parâmetros da folha de pagamento</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
          <PayrollConfigForm />
        </div>
      </div>
    </div>
  )
}
