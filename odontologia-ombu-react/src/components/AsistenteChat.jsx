import { useEffect, useRef, useState } from "react";

const WHATSAPP_NUMBER = "5491133773624";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const MAIL_URL = "mailto:odonto.ombu@gmail.com";
const TEL_URL = "tel:+541148227700";

const MENSAJE_BIENVENIDA =
  "¡Hola! Soy el asistente virtual de Odontología Ombú. Puedo ayudarte con obras sociales, horarios, turnos, tratamientos, odontólogos y más. ¿En qué te puedo ayudar?";

const ACCIONES = {
  turnos: { label: "Ir a Turnos", tipo: "scroll", target: "turnos" },
  contacto: { label: "Ver mapa y contacto", tipo: "scroll", target: "contacto" },
  whatsapp: { label: "Abrir WhatsApp", tipo: "link", href: WHATSAPP_URL },
  mail: { label: "Enviar mail", tipo: "link", href: MAIL_URL },
  llamar: { label: "Llamar", tipo: "link", href: TEL_URL },
};

const RESPUESTA_DEFAULT = {
  respuesta: "No tengo una respuesta puntual para eso. Escribinos por WhatsApp y te ayudamos enseguida.",
  acciones: [ACCIONES.whatsapp],
};

const SUGERENCIAS = [
  { label: "Obras sociales", query: "obras sociales" },
  { label: "Horarios", query: "horarios" },
  { label: "Turnos", query: "sacar un turno" },
  { label: "Ubicación", query: "dónde queda" },
  { label: "Tratamientos", query: "qué tratamientos hacen" },
  { label: "Odontólogos", query: "quién atiende" },
];

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function construirPreguntasFrecuentes({ tratamientos, obrasSociales, odontologos }) {
  const nombresTratamientos = tratamientos.map((t) => t.nombre).join(", ") || "varios tratamientos odontológicos";
  const nombresObrasSociales = obrasSociales.map((o) => o.nombre).join(", ") || "OSDE, Swiss Medical, Galeno y Medifé";
  const listaOdontologos =
    odontologos
      .map((o) => `${o.nombre} ${o.apellido}${o.especialidad ? ` (${o.especialidad})` : ""}`)
      .join(", ") || "un equipo de profesionales especializados";

  return [
    {
      keywords: ["hola", "buenas", "buen dia", "buenas tardes", "buenas noches", "que tal"],
      respuesta: "¡Hola! ¿En qué te puedo ayudar? Podés preguntarme por obras sociales, horarios, turnos, tratamientos o dónde estamos.",
    },
    {
      keywords: ["gracias", "genial", "perfecto", "buenisimo", "excelente", "dale"],
      respuesta: "¡De nada! ¿Necesitás algo más?",
    },
    {
      keywords: [
        "obra social",
        "obras sociales",
        "cobertura",
        "cobertura de",
        "cubre",
        "cubren",
        "seguro",
        "osde",
        "swiss medical",
        "galeno",
        "medife",
        "particular",
      ],
      respuesta: `Trabajamos con ${nombresObrasSociales}, y también atendemos particulares con planes de pago. Odontología general y Estética Dental están cubiertas al 100% por las obras sociales. Ortodoncia e Implantes, en cambio, quedan totalmente por fuera de la cobertura de obra social (ninguna cubre un porcentaje ni reintegro) y se abonan de forma particular. Para cualquier otra duda puntual, escribinos por WhatsApp o llamanos.`,
      acciones: [ACCIONES.whatsapp, ACCIONES.llamar],
    },
    {
      keywords: ["horario", "horarios", "hora", "abren", "atienden", "abierto", "cierran"],
      respuesta:
        "Atendemos de lunes a viernes de 09:00 a 19:00 y sábados de 09:00 a 13:00. Domingos permanecemos cerrados.",
    },
    {
      keywords: ["direccion", "donde", "ubicacion", "queda", "como llego", "como llegar", "estacionamiento", "colectivo", "tren"],
      respuesta:
        "Estamos en Ombú 4758, San Martín, Provincia de Buenos Aires, a pocas cuadras de la estación San Martín.",
      acciones: [ACCIONES.contacto],
    },
    {
      keywords: ["cancelar", "reprogramar", "cambiar turno", "anular", "no puedo ir"],
      respuesta:
        "Para cancelar o reprogramar un turno ya reservado, escribinos por WhatsApp o llamanos con tu nombre y la fecha del turno, y te lo reorganizamos sin problema.",
      acciones: [ACCIONES.whatsapp, ACCIONES.llamar],
    },
    {
      keywords: ["turno", "reservar", "sacar turno", "cita", "agendar", "reserva", "cuando puedo ir"],
      respuesta:
        'Podés reservar tu turno online: hacé clic en "Quiero un turno" o "Turnos", elegí el tratamiento, el profesional y el horario que te quede mejor.',
      acciones: [ACCIONES.turnos],
    },
    {
      keywords: [
        "tratamiento",
        "tratamientos",
        "servicio",
        "servicios",
        "que hacen",
        "limpieza",
        "ortodoncia",
        "implante",
        "implantes",
        "estetica",
        "blanqueamiento",
        "ortodoncia invisible",
      ],
      respuesta: `Ofrecemos: ${nombresTratamientos}. Podés ver el detalle de cada uno en la sección "Tratamientos" del sitio.`,
      acciones: [ACCIONES.turnos],
    },
    {
      keywords: ["odontologo", "odontologa", "dentista", "profesional", "quien atiende", "especialista", "doctor", "doctora", "equipo"],
      respuesta: `Nuestro equipo está formado por ${listaOdontologos}. Podés elegir el profesional al reservar tu turno.`,
      acciones: [ACCIONES.turnos],
    },
    {
      keywords: ["niño", "niños", "nene", "nena", "chicos", "pediatr", "infantil"],
      respuesta:
        "Sí, atendemos niños. Contamos con profesionales de odontopediatría para que la primera experiencia en el consultorio sea tranquila y positiva.",
      acciones: [ACCIONES.turnos],
    },
    {
      keywords: ["primera vez", "primera consulta", "que traigo", "que necesito traer", "documentacion", "carnet"],
      respuesta:
        "Para tu primera consulta traé tu DNI, el carnet de tu obra social (si tenés) y, si los tenés, estudios o radiografías previas. Nada más que eso.",
    },
    {
      keywords: [
        "precio",
        "precios",
        "costo",
        "costos",
        "cuanto sale",
        "cuanto cuesta",
        "cuanto vale",
        "que precio",
        "vale",
        "financiacion",
        "cuotas",
        "tarjeta",
        "pago",
        "pagos",
      ],
      respuesta:
        "El costo depende del tratamiento y de tu cobertura. Aceptamos distintos medios de pago y ofrecemos planes de financiación — escribinos y te armamos un presupuesto a medida.",
      acciones: [ACCIONES.whatsapp],
    },
    {
      keywords: ["urgencia", "urgencias", "emergencia", "me duele", "dolor", "se me rompio", "se me cayo"],
      respuesta:
        "Si tenés una urgencia odontológica, llamanos o escribinos por WhatsApp ahora mismo y te damos un turno lo antes posible.",
      acciones: [ACCIONES.llamar, ACCIONES.whatsapp],
    },
    {
      keywords: ["reclamo", "reclamos", "reclamar", "queja", "quejas", "denuncia", "denunciar", "mala atencion", "estoy disconforme"],
      respuesta: "Para hacer un reclamo, escribinos por mail a odonto.ombu@gmail.com contándonos lo sucedido y nos ocupamos.",
      acciones: [ACCIONES.mail],
    },
    {
      keywords: ["telefono", "whatsapp", "contacto", "llamar", "email", "mail", "correo"],
      respuesta: "Podés escribirnos por WhatsApp al +54 9 11 3377 3624, llamarnos al +54 11 4822 7700, o por mail a odonto.ombu@gmail.com.",
      acciones: [ACCIONES.whatsapp, ACCIONES.mail, ACCIONES.llamar],
    },
  ];
}

function buscarRespuesta(pregunta, faq) {
  const texto = normalizar(pregunta);
  let mejor = null;
  let mejorScore = 0;

  for (const item of faq) {
    const score = item.keywords.reduce((acc, k) => {
      const normK = normalizar(k);
      if (!texto.includes(normK)) return acc;
      return acc + (normK.includes(" ") ? 2 : 1);
    }, 0);
    if (score > mejorScore) {
      mejorScore = score;
      mejor = item;
    }
  }

  return mejor ?? RESPUESTA_DEFAULT;
}

function irASeccion(id) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
}

function AccionesMensaje({ acciones, onNavegar }) {
  if (!acciones?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {acciones.map((accion) =>
        accion.tipo === "scroll" ? (
          <button
            key={accion.label}
            type="button"
            onClick={() => onNavegar(accion.target)}
            className="text-[12px] font-semibold px-2.5 py-1 rounded-full border-none bg-accent hover:bg-accent-hover text-white cursor-pointer"
          >
            {accion.label}
          </button>
        ) : (
          <a
            key={accion.label}
            href={accion.href}
            target={accion.href.startsWith("http") ? "_blank" : undefined}
            rel={accion.href.startsWith("http") ? "noreferrer" : undefined}
            className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-surface text-ink border-[1.5px] border-pill hover:border-accent no-underline"
          >
            {accion.label}
          </a>
        )
      )}
    </div>
  );
}

function IndicadorEscribiendo() {
  return (
    <div className="max-w-[85%] rounded-2xl px-3 py-2.5 bg-surface-alt justify-self-start flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function AsistenteChat({ tratamientos = [], obrasSociales = [], odontologos = [] }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([{ rol: "bot", texto: MENSAJE_BIENVENIDA }]);
  const [texto, setTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const listaRef = useRef(null);
  const timeoutRef = useRef(null);

  const faq = construirPreguntasFrecuentes({ tratamientos, obrasSociales, odontologos });

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, abierto, escribiendo]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const navegarA = (id) => {
    setAbierto(false);
    irASeccion(id);
  };

  const procesarPregunta = (preguntaTexto) => {
    const pregunta = preguntaTexto.trim();
    if (!pregunta || escribiendo) return;

    setMensajes((prev) => [...prev, { rol: "user", texto: pregunta }]);
    setTexto("");
    setEscribiendo(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const { respuesta, acciones } = buscarRespuesta(pregunta, faq);
      setMensajes((prev) => [...prev, { rol: "bot", texto: respuesta, acciones }]);
      setEscribiendo(false);
    }, 450);
  };

  const enviar = (e) => {
    e.preventDefault();
    procesarPregunta(texto);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Abrir asistente virtual"
        title="Asistente virtual"
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-body hover:bg-body-hover shadow-card flex items-center justify-center transition-colors"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16v11H8l-4 4V4Z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      </button>

      {abierto && (
        <div className="fixed bottom-[104px] right-6 z-50 w-[320px] max-w-[calc(100vw-3rem)] h-[480px] max-h-[75vh] bg-surface rounded-3xl shadow-card overflow-hidden flex flex-col">
          <div className="bg-body text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <div className="font-quicksand font-bold text-sm">Asistente virtual</div>
              <div className="text-[11px] text-white/80">Obras sociales, turnos y más</div>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
              className="w-7 h-7 rounded-full border-none bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>

          <div ref={listaRef} className="flex-1 overflow-y-auto px-3 py-3 grid gap-2 content-start">
            {mensajes.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-[1.5] ${
                  m.rol === "bot"
                    ? "bg-surface-alt text-ink justify-self-start"
                    : "bg-body text-white justify-self-end"
                }`}
              >
                {m.texto}
                {m.rol === "bot" && <AccionesMensaje acciones={m.acciones} onNavegar={navegarA} />}
              </div>
            ))}
            {escribiendo && <IndicadorEscribiendo />}
          </div>

          <div className="flex gap-1.5 overflow-x-auto px-2.5 pt-2 pb-0.5 shrink-0">
            {SUGERENCIAS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => procesarPregunta(s.query)}
                className="text-[12px] font-semibold whitespace-nowrap px-2.5 py-1 rounded-full border-[1.5px] border-pill bg-surface text-ink hover:border-accent cursor-pointer shrink-0"
              >
                {s.label}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="border-t border-surface-alt p-2.5 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribí tu consulta…"
              aria-label="Escribí tu consulta"
              className="flex-1 min-w-0 px-3 py-2 rounded-full border-[1.5px] border-pill bg-surface-alt text-sm font-inherit focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              aria-label="Enviar"
              className="w-9 h-9 rounded-full border-none bg-accent hover:bg-accent-hover text-white flex items-center justify-center cursor-pointer shrink-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
