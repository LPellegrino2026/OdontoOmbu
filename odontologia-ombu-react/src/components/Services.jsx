import { CTA_BY_TRATAMIENTO, DEFAULT_CTA, DEFAULT_ICON, ICONS_BY_TRATAMIENTO } from "../data/clinic";

export default function Services({ tratamientos, selectedTratamientoId, onSelect }) {
  return (
    <section id="servicios" className="max-w-[1180px] mx-auto px-6 pt-16 pb-6">
      <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
        <div className="max-w-[560px]">
          <div className="font-poppins font-light text-xs text-muted tracking-[0.18em] uppercase mb-4">
            Tratamientos
          </div>
          <h2 className="font-quicksand font-semibold text-ink leading-[1.15] text-[clamp(28px,3.4vw,40px)]">
            Pensados para cada etapa
          </h2>
          <div className="w-18 h-1.5 rounded-full bg-accent mt-4" />
        </div>
        <p className="text-[15px] text-body max-w-[330px] leading-[1.7] text-pretty">
          Elegí un servicio y lo cargamos automáticamente en el formulario de turnos.
        </p>
      </div>

      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {tratamientos.map((t) => {
          const active = selectedTratamientoId === t.id;
          const icon = ICONS_BY_TRATAMIENTO[t.nombre] || DEFAULT_ICON;
          const cta = CTA_BY_TRATAMIENTO[t.nombre] || DEFAULT_CTA;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="text-left cursor-pointer font-inherit bg-surface-alt rounded-[14px] rounded-tr-[32px] px-4 py-6 shadow-card transition-transform duration-150 hover:-translate-y-1 border-2"
              style={{ borderColor: active ? "var(--color-accent)" : "transparent" }}
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                style={{ background: active ? "var(--color-accent)" : "var(--color-pill)" }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2F3542" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </div>
              <div className="font-quicksand font-bold text-[19px] text-ink">{t.nombre}</div>
              <p className="text-sm leading-[1.65] text-body my-2 mb-4 text-pretty">{t.descripcion}</p>
              <div className="text-[13px] font-bold text-ink">{cta}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
