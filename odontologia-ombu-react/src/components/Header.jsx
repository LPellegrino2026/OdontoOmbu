import logo from "../assets/images/logo.jpg";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-surface-alt">
      <div className="max-w-[1180px] mx-auto px-6 py-1 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4 mr-auto">
          <img
            src={logo}
            alt="Odontología Ombú"
            className="w-auto object-contain block mix-blend-multiply"
            style={{ height: "108px" }}
          />
          <div className="font-poppins font-light text-[11px] text-muted tracking-[0.18em] uppercase border-l border-pill pl-4 max-w-[110px] leading-normal">
            Salud bucal integral
          </div>
        </div>

        <nav className="flex gap-6 font-quicksand text-[15px] text-ink font-semibold">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-ink font-quicksand text-[15px] font-semibold cursor-pointer bg-transparent border-none p-0"
          >
            Inicio
          </button>
          <a href="#servicios" className="text-ink">Tratamientos</a>
          <a href="#contacto" className="text-ink">Contacto</a>
        </nav>

        <div className="flex gap-2.5 flex-wrap">
          <a
            href="#turnos"
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-full font-nunito text-[15px] font-bold"
          >
            Turnos
          </a>
          <a
            href="#doctores"
            className="bg-body hover:bg-body-hover text-white px-6 py-2.5 rounded-full font-nunito text-[15px] font-bold"
          >
            Doctores
          </a>
        </div>
      </div>
    </header>
  );
}
