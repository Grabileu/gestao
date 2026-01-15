export default function CashBreakDetailsModal({ cashBreak }) {
  if (!cashBreak) return null;

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString("pt-BR");
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end - start) / (1000 * 60);
    return `${Math.floor(duration / 60)}h ${duration % 60}min`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-400">Funcionário</p>
          <p className="text-white font-semibold">{cashBreak.employee}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Loja</p>
          <p className="text-white font-semibold">{cashBreak.store}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Data</p>
          <p className="text-white font-semibold">{cashBreak.date}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Duração</p>
          <p className="text-white font-semibold">
            {calculateDuration(cashBreak.startTime, cashBreak.endTime)}
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-400">Horário</p>
        <p className="text-white font-semibold">
          {formatTime(cashBreak.startTime)} - {formatTime(cashBreak.endTime)}
        </p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Motivo</p>
        <p className="text-white">{cashBreak.reason}</p>
      </div>
    </div>
  );
}
