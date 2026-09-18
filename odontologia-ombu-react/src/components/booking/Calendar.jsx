import { MONTHS, WEEKDAY_LETTERS } from "../../data/clinic";
import { toISODate } from "../../lib/booking";

export default function Calendar({ view, selectedDate, onPrevMonth, onNextMonth, onPickDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < lead; i++) days.push(null);
  for (let n = 1; n <= total; n++) {
    const d = new Date(view.getFullYear(), view.getMonth(), n);
    const ds = toISODate(d);
    const past = d < today;
    const closed = d.getDay() === 0;
    const off = past || closed;
    const selected = selectedDate === ds;
    days.push({ n, ds, off, selected });
  }

  return (
    <div className="rounded-[14px] p-4 bg-surface-alt">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="w-[34px] h-[34px] rounded-full border border-pill bg-surface cursor-pointer text-ink text-base leading-none hover:bg-accent hover:text-white"
        >
          ‹
        </button>
        <div className="font-quicksand font-bold text-base text-ink capitalize">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </div>
        <button
          onClick={onNextMonth}
          className="w-[34px] h-[34px] rounded-full border border-pill bg-surface cursor-pointer text-ink text-base leading-none hover:bg-accent hover:text-white"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LETTERS.map((w, i) => (
          <div key={i} className="text-center font-poppins text-[11px] font-light text-muted tracking-[0.18em]">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) =>
          d === null ? (
            <div key={`pad-${i}`} className="aspect-square" />
          ) : (
            <button
              key={d.ds}
              onClick={() => !d.off && onPickDate(d.ds)}
              disabled={d.off}
              className="aspect-square rounded-lg border-none font-quicksand text-sm p-0 flex items-center justify-center"
              style={{
                background: d.selected ? "var(--color-accent)" : d.off ? "var(--color-surface-alt)" : "var(--color-surface)",
                color: d.selected ? "#FFFFFF" : d.off ? "#C3C9D2" : "var(--color-ink)",
                fontWeight: d.selected ? 700 : 600,
                cursor: d.off ? "not-allowed" : "pointer",
              }}
            >
              {d.n}
            </button>
          )
        )}
      </div>
    </div>
  );
}
