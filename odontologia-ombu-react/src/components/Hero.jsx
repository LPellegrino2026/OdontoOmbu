import consultorio from "../assets/images/foto-consultorio.jpg";

const STATS = [
  { value: "+18", label: "años de trayectoria" },
  { value: "4.9", label: "valoración de pacientes" },
  { value: "24 h", label: "confirmación del turno" },
  { value: "3", label: "especialistas en el equipo" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface-alt">
      <div className="absolute inset-0">
        <img src={consultorio} alt="Consultorio de Odontología Ombú" className="w-full h-full object-cover" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(100deg, rgba(245,246,250,0.96) 0%, rgba(245,246,250,0.88) 46%, rgba(168,182,194,0.55) 100%)",
        }}
      />
      <div className="relative max-w-[1180px] mx-auto px-6 py-16 grid gap-12 items-center pointer-events-none [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <div className="max-w-[560px]">
          <div className="font-poppins font-light text-xs text-muted tracking-[0.18em] uppercase mb-8">
            Servicio personalizado
          </div>
          <h1 className="font-quicksand font-semibold text-ink leading-[1.1] mb-6 text-[clamp(34px,5vw,56px)] text-balance">
            Porque cada sonrisa merece atención personalizada
          </h1>
          <div className="w-24 h-1.5 rounded-full bg-accent mb-6" />
          <p className="text-[17px] leading-[1.7] text-body mb-8 max-w-[470px] text-pretty">
            Odontología general, ortodoncia e implantes en San Martín. Reservá tu turno online en menos de un minuto
            y elegí el horario que mejor te quede.
          </p>
          <div className="flex gap-4 flex-wrap pointer-events-auto">
            <a href="#turnos" className="bg-accent hover:bg-accent-hover text-white px-8 py-[15px] rounded-full text-base font-bold">
              Quiero un turno
            </a>
            <a
              href="#servicios"
              className="bg-surface hover:bg-surface-alt text-ink px-[30px] py-[15px] rounded-full text-base font-semibold inline-flex items-center gap-2"
            >
              Ver tratamientos →
            </a>
          </div>
        </div>

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-surface rounded-[14px] rounded-tr-[28px] p-6 shadow-card">
              <div className="font-quicksand text-3xl font-bold text-ink">{stat.value}</div>
              <div className="text-[13px] text-body mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
