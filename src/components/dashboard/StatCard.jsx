export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-slate-400" />}
      </div>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      {trend && <p className="text-sm text-slate-400">{trend}</p>}
    </div>
  );
}
