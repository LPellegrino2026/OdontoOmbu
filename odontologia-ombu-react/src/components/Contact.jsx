import plano from "../assets/images/plano.png";

export default function Contact() {
  return (
    <section id="contacto" className="max-w-[1180px] mx-auto px-6 pt-12 pb-16">
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <div className="bg-surface-alt rounded-[14px] rounded-tr-[32px] px-4 py-6 shadow-card">
          <div className="font-poppins font-light text-xs tracking-[0.18em] uppercase text-muted mb-4">
            Dónde estamos
          </div>
          <div className="grid gap-6 text-[15px] leading-[1.6]">
            <div>
              <div className="font-quicksand font-bold text-ink">Ombú 4758</div>
              <div className="text-body">San Martín, Provincia de Buenos Aires</div>
            </div>
            <div>
              <div className="font-quicksand font-bold text-ink">+54 11 4822 7700</div>
              <div className="text-body">WhatsApp: +54 9 11 3377 3624</div>
            </div>
            <div>
              <div className="font-quicksand font-bold text-ink">odonto.ombu@gmail.com</div>
              <div className="text-body">Respondemos dentro de las 24 h hábiles</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-alt rounded-[14px] rounded-tr-[32px] px-4 py-6 shadow-card">
          <div className="font-poppins font-light text-xs tracking-[0.18em] uppercase text-muted mb-4">
            Horarios
          </div>
          <div className="grid gap-3 text-[15px]">
            <div className="flex justify-between gap-4 pb-3 border-b border-pill">
              <span className="text-body">Lunes a viernes</span>
              <strong className="font-bold text-ink">09:00 – 19:00</strong>
            </div>
            <div className="flex justify-between gap-4 pb-3 border-b border-pill">
              <span className="text-body">Sábados</span>
              <strong className="font-bold text-ink">09:00 – 13:00</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-body">Domingos</span>
              <strong className="font-bold text-muted">Cerrado</strong>
            </div>
          </div>
        </div>

        <div className="bg-surface-alt rounded-3xl overflow-hidden flex flex-col min-h-[260px] shadow-card">
          <div className="relative flex-1 min-h-[200px]">
            <img src={plano} alt="Mapa de ubicación del consultorio" className="w-full h-full object-cover" />
          </div>
          <div className="p-4 text-sm text-body leading-[1.6]">
            A pocas cuadras de la estación San Martín.
          </div>
        </div>
      </div>
    </section>
  );
}
