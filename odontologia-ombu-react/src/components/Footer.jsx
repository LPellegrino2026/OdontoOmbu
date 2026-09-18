import logo from "../assets/images/logo.jpg";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-[1180px] mx-auto px-6 py-12 grid gap-6 items-start [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <div>
          <div className="inline-flex items-center bg-white/90 rounded-[14px] px-4 py-2 mb-6">
            <img src={logo} alt="Odontología Ombú" className="w-auto object-contain block mix-blend-multiply" style={{ height: 72 }} />
          </div>
          <p className="text-sm leading-[1.7] max-w-[280px] text-white">
            Consultorio odontológico integral. Matrícula habilitante N.º 21.884 · Dirección médica: Dra. Laura Fernández.
          </p>
        </div>

        <div className="grid gap-2 text-[15px]">
          <div className="font-quicksand font-bold mb-2 text-white">Secciones</div>
          <a href="#servicios" className="text-accent">Tratamientos</a>
          <a href="#turnos" className="text-accent">Reservar turno</a>
          <a href="#contacto" className="text-accent">Contacto</a>
        </div>

        <div className="grid gap-2 text-[15px] text-white">
          <div className="font-quicksand font-bold mb-2">Obras sociales</div>
          <div>OSDE · Swiss Medical</div>
          <div>Galeno · Medifé</div>
          <div>Particulares y planes de pago</div>
        </div>
      </div>

      <div className="border-t border-white/[0.18]">
        <div className="max-w-[1180px] mx-auto px-6 py-4 text-[13px] flex justify-between gap-4 flex-wrap text-pill">
          <span>© 2026 Odontología Ombú. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
