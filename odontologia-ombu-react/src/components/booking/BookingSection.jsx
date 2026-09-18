import { useEffect, useMemo, useState } from "react";
import { DAY_NAMES, MONTHS } from "../../data/clinic";
import { crearTurno, getSlotsDisponibles } from "../../lib/api";
import Calendar from "./Calendar";
import Confirmation from "./Confirmation";

const initialForm = { nombre: "", apellido: "", telefono: "", email: "", nota: "" };

export default function BookingSection({ tratamientos, odontologos, selectedTratamientoId, onTratamientoChange }) {
  const now = new Date();
  const [odontologoId, setOdontologoId] = useState(null);
  const [view, setView] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOdontologoId((current) => current ?? odontologos[0]?.id ?? null);
  }, [odontologos]);

  useEffect(() => {
    if (!date || !odontologoId) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    getSlotsDisponibles(odontologoId, date)
      .then((s) => {
        if (!cancelled) setSlots(s);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, odontologoId]);

  const dateLabel = useMemo(() => {
    if (!date) return "—";
    const d = new Date(date + "T12:00:00");
    const label = `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [date]);

  const selectedTratamiento = tratamientos.find((t) => t.id === selectedTratamientoId) ?? null;
  const selectedOdontologo = odontologos.find((o) => o.id === odontologoId) ?? null;
  const dentistName = selectedOdontologo ? `${selectedOdontologo.nombre} ${selectedOdontologo.apellido}` : "—";
  const timeLabel = time ? `${time} h` : "—";

  const scrollToTurnos = () => {
    const el = document.getElementById("turnos");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  const pickDate = (ds) => {
    setDate(ds);
    setTime(null);
    setError("");
  };

  const pickDentist = (id) => {
    setOdontologoId(id);
    setTime(null);
    setError("");
  };

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const confirm = async () => {
    if (!selectedTratamiento) return setError("Elegí un tratamiento para continuar.");
    if (!odontologoId) return setError("Elegí un odontólogo para continuar.");
    if (!date || !time) return setError("Elegí una fecha y un horario para continuar.");
    if (!form.nombre.trim() || !form.apellido.trim()) return setError("Completá nombre y apellido.");
    if (form.telefono.replace(/\D/g, "").length < 8) return setError("Ingresá un teléfono válido.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Ingresá un email válido.");

    setError("");
    setSubmitting(true);
    try {
      const turno = await crearTurno({
        tratamientoId: selectedTratamiento.id,
        odontologoId,
        fecha: date,
        horaInicio: time,
        paciente: {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim(),
          nota: form.nota.trim(),
        },
      });

      setBooking({
        code: turno.codigo,
        paciente: `${form.nombre.trim()} ${form.apellido.trim()}`,
        service: selectedTratamiento.nombre,
        dentist: dentistName,
        date: dateLabel,
        time,
        email: form.email.trim(),
        telefono: form.telefono.trim(),
      });
      scrollToTurnos();
    } catch (err) {
      setError(err.message || "No pudimos confirmar el turno. Probá con otro horario.");
      if (date && odontologoId) {
        getSlotsDisponibles(odontologoId, date).then(setSlots);
      }
      setTime(null);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setBooking(null);
    setDate(null);
    setTime(null);
    setForm(initialForm);
    setError("");
  };

  return (
    <section id="turnos" className="max-w-[1180px] mx-auto px-6 pt-16 pb-8">
      <div className="bg-surface rounded-3xl shadow-card overflow-hidden border border-surface-alt">
        <div className="px-8 pt-8">
          <div className="font-poppins font-light text-xs text-muted tracking-[0.18em] uppercase mb-4">
            Turnos online
          </div>
          <h2 className="font-quicksand font-semibold text-ink text-[clamp(26px,3.2vw,36px)] mb-2">
            Reservá en tres pasos
          </h2>
          <div className="w-16 h-1.5 rounded-full bg-accent my-4" />
          <p className="text-[15px] text-body max-w-[540px] leading-[1.7]">
            Elegí tratamiento y profesional, seleccioná el día en el calendario y confirmá tus datos.
          </p>
        </div>

        {booking ? (
          <Confirmation booking={booking} onReset={reset} />
        ) : (
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            <div className="px-8 pt-6 pb-8">
              <div className="font-quicksand text-sm font-bold text-ink mb-4">1 · Tratamiento y profesional</div>
              <label className="block text-[13px] font-bold text-ink mb-2">Servicio</label>
              <select
                value={selectedTratamientoId ?? ""}
                onChange={(e) => onTratamientoChange(Number(e.target.value))}
                className="w-full px-4 py-[13px] border-[1.5px] border-pill rounded-lg font-inherit text-[15px] text-body bg-surface-alt mb-6 cursor-pointer"
              >
                {tratamientos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>

              <label className="block text-[13px] font-bold text-ink mb-2">Odontólogo/a</label>
              <div className="grid gap-2 mb-8">
                {odontologos.map((o) => {
                  const active = odontologoId === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => pickDentist(o.id)}
                      className="flex items-center gap-4 text-left cursor-pointer font-inherit rounded-lg px-4 py-3 border-2 hover:border-accent"
                      style={{
                        background: active ? "var(--color-surface)" : "var(--color-surface-alt)",
                        borderColor: active ? "var(--color-accent)" : "transparent",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full text-ink flex items-center justify-center font-quicksand font-bold text-sm shrink-0"
                        style={{ background: active ? "var(--color-accent)" : "var(--color-pill)" }}
                      >
                        {o.iniciales}
                      </div>
                      <div>
                        <div className="font-quicksand text-[15px] font-bold text-ink">{o.nombre} {o.apellido}</div>
                        <div className="text-[13px] text-body">{o.especialidad}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="font-quicksand text-sm font-bold text-ink mb-4">2 · Fecha y horario</div>
              <Calendar
                view={view}
                selectedDate={date}
                onPrevMonth={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                onNextMonth={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                onPickDate={pickDate}
              />

              <div className="flex gap-4 mt-2 text-xs text-muted flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-accent inline-block" />
                  Seleccionado
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-surface border border-pill inline-block" />
                  Disponible
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-surface-alt inline-block" />
                  Sin atención
                </div>
              </div>

              <div className="mt-6">
                <div className="text-[13px] font-bold text-ink mb-4">
                  {date ? `Horarios disponibles · ${dateLabel}` : "Horarios disponibles"}
                </div>
                {slotsLoading ? (
                  <div className="text-sm text-muted bg-surface-alt rounded-lg p-4">Buscando horarios…</div>
                ) : slots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((t) => {
                      const active = time === t;
                      return (
                        <button
                          key={t}
                          onClick={() => {
                            setTime(t);
                            setError("");
                          }}
                          className="px-[18px] py-[10px] rounded-full border-2 font-inherit text-sm font-bold cursor-pointer hover:border-accent"
                          style={{
                            background: active ? "var(--color-accent)" : "var(--color-surface)",
                            borderColor: active ? "var(--color-accent)" : "var(--color-pill)",
                            color: active ? "#FFFFFF" : "var(--color-ink)",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted bg-surface-alt rounded-lg p-4">
                    {date
                      ? "No hay horarios disponibles para esta fecha. Probá con otro día."
                      : "Elegí una fecha en el calendario para ver los horarios disponibles."}
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 pt-6 pb-8 bg-surface-alt">
              <div className="font-quicksand text-sm font-bold text-ink mb-4">3 · Tus datos</div>
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                <Field label="Nombre" placeholder="María" value={form.nombre} onChange={updateField("nombre")} />
                <Field label="Apellido" placeholder="Gómez" value={form.apellido} onChange={updateField("apellido")} />
                <Field label="Teléfono" placeholder="11 5555 5555" value={form.telefono} onChange={updateField("telefono")} />
                <Field label="Email" placeholder="maria@mail.com" value={form.email} onChange={updateField("email")} />
              </div>

              <label className="block text-[13px] font-bold text-ink mt-4 mb-2">
                Comentario para el profesional (opcional)
              </label>
              <textarea
                value={form.nota}
                onChange={updateField("nota")}
                rows={3}
                placeholder="Ej: sensibilidad al frío hace dos semanas"
                className="w-full px-4 py-[13px] border-[1.5px] border-pill rounded-lg font-inherit text-[15px] bg-surface text-body resize-y"
              />

              <div className="mt-6 bg-surface rounded-[14px] rounded-tr-[28px] p-6 shadow-card">
                <div className="font-poppins font-light text-[11px] tracking-[0.18em] uppercase text-muted mb-4">
                  Resumen
                </div>
                <div className="grid gap-2 text-sm">
                  <SummaryRow label="Servicio" value={selectedTratamiento?.nombre ?? "—"} />
                  <SummaryRow label="Profesional" value={dentistName} />
                  <SummaryRow label="Fecha" value={dateLabel} />
                  <SummaryRow label="Horario" value={timeLabel} />
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-surface border-l-[6px] border-accent text-ink rounded-lg px-4 py-3 text-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={confirm}
                disabled={submitting}
                className="mt-6 w-full py-4 border-none rounded-full bg-accent hover:bg-accent-hover text-white font-nunito text-base font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Confirmando…" : "Confirmar turno"}
              </button>
              <p className="text-xs text-muted mt-4 leading-[1.6]">
                Recibirás la confirmación por email. Podés cancelar o reprogramar hasta 24 h antes.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-ink mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-[13px] border-[1.5px] border-pill rounded-lg font-inherit text-[15px] bg-surface text-body focus:outline-none focus:border-accent"
      />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <strong className="font-bold text-ink text-right">{value}</strong>
    </div>
  );
}
