export default function Confirmation({ booking, onReset }) {
  const receipt = [
    { k: "Paciente", v: booking.paciente },
    { k: "Servicio", v: booking.service },
    { k: "Profesional", v: booking.dentist },
    { k: "Fecha", v: booking.date },
    { k: "Horario", v: `${booking.time} h` },
    { k: "Teléfono", v: booking.telefono },
  ];

  return (
    <div className="p-12 flex flex-col items-center text-center animate-ombu-rise">
      <div className="w-18 h-18 rounded-full bg-accent flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 className="font-quicksand font-bold text-[28px] text-ink mb-2">¡Turno reservado!</h3>
      <p className="text-[15px] text-body mb-8 max-w-[440px] leading-[1.7]">
        Tu turno para el {booking.date.toLowerCase()} a las {booking.time} h quedó pendiente de confirmación del
        odontólogo. Enviamos el detalle a {booking.email}.
      </p>

      <div className="w-full max-w-[470px] text-left rounded-3xl overflow-hidden shadow-card">
        <div className="bg-ink text-white px-6 py-4">
          <div className="font-poppins font-light text-[11px] tracking-[0.18em] uppercase text-pill">Comprobante</div>
          <div className="font-quicksand text-lg font-bold mt-1">{booking.code}</div>
        </div>
        <div className="p-6 grid gap-2 text-sm bg-surface">
          {receipt.map((r) => (
            <div key={r.k} className="flex justify-between gap-4">
              <span className="text-muted">{r.k}</span>
              <strong className="font-bold text-ink text-right">{r.v}</strong>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-8 px-7 py-[13px] rounded-full border-none bg-surface-alt hover:bg-pill text-ink font-inherit text-[15px] font-bold cursor-pointer"
      >
        Reservar otro turno →
      </button>
    </div>
  );
}
