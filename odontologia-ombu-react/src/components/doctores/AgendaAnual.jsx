import { MONTHS, WEEKDAY_LETTERS } from "../../data/clinic";
import { toISODate } from "../../lib/booking";

function MesMini({ year, month, turnosPorFecha, onSelectDay }) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();

  const dias = [];
  for (let i = 0; i < lead; i++) dias.push(null);
  for (let n = 1; n <= total; n++) {
    const ds = toISODate(new Date(year, month, n));
    dias.push({ n, ds, tieneTurnos: turnosPorFecha.has(ds) });
  }

  return (
    <div className="rounded-[14px] p-3 bg-surface-alt">
      <div className="font-quicksand font-bold text-xs text-ink capitalize mb-2 text-center">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAY_LETTERS.map((w, i) => (
          <div key={i} className="text-center font-poppins text-[9px] font-light text-muted">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {dias.map((d, i) =>
          d === null ? (
            <div key={`pad-${i}`} className="aspect-square" />
          ) : d.tieneTurnos ? (
            <button
              key={d.ds}
              type="button"
              onClick={() => onSelectDay(d.ds)}
              title="Ver turnos de este día"
              className="aspect-square rounded-md border-none bg-accent hover:bg-accent-hover text-white font-quicksand text-[10px] font-bold cursor-pointer flex items-center justify-center"
            >
              {d.n}
            </button>
          ) : (
            <div
              key={d.ds}
              className="aspect-square rounded-md font-quicksand text-[10px] text-muted flex items-center justify-center"
            >
              {d.n}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function AgendaAnual({ agenda, year, onSelectDay }) {
  const turnosPorFecha = new Map();
  for (const t of agenda) {
    if (!turnosPorFecha.has(t.fecha)) turnosPorFecha.set(t.fecha, []);
    turnosPorFecha.get(t.fecha).push(t);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {MONTHS.map((_, month) => (
        <MesMini key={month} year={year} month={month} turnosPorFecha={turnosPorFecha} onSelectDay={onSelectDay} />
      ))}
    </div>
  );
}
