import { useMemo, useState } from "react";
import { DAY_NAMES, MONTHS } from "../../data/clinic";
import { actualizarEstadoTurno, guardarNotaClinica, loginStaff } from "../../lib/api";
import { toISODate } from "../../lib/booking";
import AgendaAnual from "./AgendaAnual";

const ESTADO_LABEL = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  rechazado: "Rechazado",
};

const ESTADO_CLASSES = {
  pendiente: "bg-warn-bg text-warn",
  confirmado: "bg-ok-bg text-ok",
  rechazado: "bg-bad-bg text-bad",
};

function EstadoBadge({ estado }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${ESTADO_CLASSES[estado] ?? "bg-surface-alt text-muted"}`}
    >
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}

function EstadoCell({ turno, procesando, onDecidir }) {
  if (turno.estado !== "pendiente") {
    return <EstadoBadge estado={turno.estado} />;
  }
  const ocupado = procesando === turno.turno_id;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <EstadoBadge estado={turno.estado} />
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          title="Confirmar"
          aria-label="Confirmar turno"
          disabled={ocupado}
          onClick={() => onDecidir(turno.turno_id, "confirmado")}
          className="w-6 h-6 rounded-full bg-ok-bg text-ok hover:bg-ok hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          ✓
        </button>
        <button
          type="button"
          title="Rechazar"
          aria-label="Rechazar turno"
          disabled={ocupado}
          onClick={() => onDecidir(turno.turno_id, "rechazado")}
          className="w-6 h-6 rounded-full bg-bad-bg text-bad hover:bg-bad hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function formatFecha(fecha) {
  const d = new Date(fecha + "T12:00:00");
  const label = `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatFechaCompleta(fecha) {
  const d = new Date(fecha + "T12:00:00");
  const label = `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function esMismoMes(fecha, mesVista) {
  const d = new Date(fecha + "T12:00:00");
  return d.getFullYear() === mesVista.getFullYear() && d.getMonth() === mesVista.getMonth();
}

function turnosDelMesVisto(agenda, mesVista) {
  const hoy = new Date();
  const esMesActual = mesVista.getFullYear() === hoy.getFullYear() && mesVista.getMonth() === hoy.getMonth();
  const hoyISO = toISODate(hoy);
  return agenda.filter((t) => esMismoMes(t.fecha, mesVista) && (!esMesActual || t.fecha >= hoyISO));
}

function agruparPorFecha(agenda) {
  const grupos = new Map();
  for (const t of agenda) {
    if (!grupos.has(t.fecha)) grupos.set(t.fecha, []);
    grupos.get(t.fecha).push(t);
  }
  return Array.from(grupos.entries())
    .map(([fecha, turnos]) => ({
      fecha,
      turnos: [...turnos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function volverAlSitio(e) {
  e.preventDefault();
  window.location.hash = "";
}

function DiaTurnosModal({ fecha, turnos, onClose }) {
  if (!fecha) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-surface rounded-3xl shadow-card max-w-[420px] w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="font-quicksand font-bold text-lg text-ink">{formatFechaCompleta(fecha)}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full border-none bg-surface-alt hover:bg-pill text-ink flex items-center justify-center cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="grid gap-3">
          {turnos.map((t) => (
            <div key={t.turno_id} className="rounded-2xl bg-surface-alt p-4">
              <div className="font-bold text-ink text-sm">
                {t.hora_inicio.slice(0, 5)}–{t.hora_fin.slice(0, 5)} h
              </div>
              <div className="text-body text-sm mt-1">
                {t.paciente_nombre} {t.paciente_apellido}
              </div>
              <div className="text-xs text-muted mt-1">{t.tratamiento}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoriaClinicaModal({ abierta, turnos, notasDraft, onNotaChange, onGuardar, guardando, onClose }) {
  const [busqueda, setBusqueda] = useState("");

  if (!abierta) return null;

  const cerrar = () => {
    setBusqueda("");
    onClose();
  };

  const q = busqueda.trim().toLowerCase();
  const turnosFiltrados = q
    ? turnos.filter(
        (t) => t.paciente_nombre.toLowerCase().includes(q) || t.paciente_apellido.toLowerCase().includes(q)
      )
    : turnos;

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center px-4" onClick={cerrar}>
      <div
        className="bg-surface rounded-3xl shadow-card max-w-[900px] w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div className="font-quicksand font-bold text-lg text-ink">Historia clínica</div>
            <div className="text-xs text-muted mt-1">Turnos aceptados hasta hoy, con notas por paciente.</div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o apellido…"
              aria-label="Buscar paciente"
              className="w-[200px] px-4 py-2 rounded-full border-[1.5px] border-pill bg-surface-alt text-sm font-inherit focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full border-none bg-surface-alt hover:bg-pill text-ink flex items-center justify-center cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {turnos.length === 0 ? (
          <div className="text-sm text-muted py-10 text-center">Todavía no hay turnos aceptados.</div>
        ) : turnosFiltrados.length === 0 ? (
          <div className="text-sm text-muted py-10 text-center">No se encontró ningún paciente con ese nombre.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-left text-ink">
                  <th className="px-4 py-2 font-bold w-[18%]">Paciente</th>
                  <th className="px-4 py-2 font-bold w-[13%]">Fecha</th>
                  <th className="px-4 py-2 font-bold w-[17%]">Tratamiento</th>
                  <th className="px-4 py-2 font-bold w-[52%]">Notas</th>
                </tr>
              </thead>
              <tbody>
                {turnosFiltrados.map((t) => {
                  const valor = notasDraft[t.turno_id] ?? t.nota_clinica ?? "";
                  const sinGuardar = valor !== (t.nota_clinica ?? "");
                  return (
                    <tr key={t.turno_id} className="border-t border-surface-alt align-top">
                      <td className="px-4 py-3 font-bold text-ink break-words">
                        {t.paciente_nombre} {t.paciente_apellido}
                      </td>
                      <td className="px-4 py-3 text-body break-words">{formatFecha(t.fecha)}</td>
                      <td className="px-4 py-3 text-body break-words">{t.tratamiento}</td>
                      <td className="px-4 py-3">
                        <textarea
                          value={valor}
                          onChange={(e) => onNotaChange(t.turno_id, e.target.value.slice(0, 200))}
                          maxLength={200}
                          rows={2}
                          placeholder="Notas del tratamiento…"
                          className="w-full rounded-lg border-[1.5px] border-pill bg-surface-alt px-3 py-2 text-sm font-inherit resize-none focus:outline-none focus:border-accent"
                        />
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-muted">{valor.length}/200</span>
                          {(sinGuardar || guardando === t.turno_id) && (
                            <button
                              type="button"
                              onClick={() => onGuardar(t.turno_id)}
                              disabled={guardando === t.turno_id}
                              className="px-4 py-1.5 rounded-full border-none bg-body hover:bg-body-hover text-white text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {guardando === t.turno_id ? "Guardando…" : "Guardar"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctoresPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [agenda, setAgenda] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [mesVista, setMesVista] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });
  const [historiaAbierta, setHistoriaAbierta] = useState(false);
  const [notasDraft, setNotasDraft] = useState({});
  const [guardandoNota, setGuardandoNota] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginStaff(usuario, password);
      setAgenda(data);
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const salir = () => {
    setAgenda(null);
    setUsuario("");
    setPassword("");
    setError("");
  };

  const decidirTurno = async (turnoId, nuevoEstado) => {
    setProcesando(turnoId);
    try {
      await actualizarEstadoTurno(usuario, password, turnoId, nuevoEstado);
      setAgenda((prev) => prev.map((t) => (t.turno_id === turnoId ? { ...t, estado: nuevoEstado } : t)));
    } catch {
      window.alert("No se pudo actualizar el turno. Probá de nuevo.");
    } finally {
      setProcesando(null);
    }
  };

  const guardarNota = async (turnoId) => {
    setGuardandoNota(turnoId);
    try {
      const nota = notasDraft[turnoId] ?? "";
      await guardarNotaClinica(usuario, password, turnoId, nota);
      setAgenda((prev) => prev.map((t) => (t.turno_id === turnoId ? { ...t, nota_clinica: nota } : t)));
    } catch {
      window.alert("No se pudo guardar la nota. Probá de nuevo.");
    } finally {
      setGuardandoNota(null);
    }
  };

  const historiaClinica = useMemo(() => {
    const hoyISO = toISODate(new Date());
    return (agenda ?? [])
      .filter((t) => t.estado === "confirmado" && t.fecha <= hoyISO)
      .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));
  }, [agenda]);

  const turnosPendientes = useMemo(() => (agenda ?? []).filter((t) => t.estado === "pendiente"), [agenda]);

  const diasAgenda = useMemo(() => agruparPorFecha(turnosDelMesVisto(agenda ?? [], mesVista)), [agenda, mesVista]);
  const hoy = new Date();
  const esMesActual = mesVista.getFullYear() === hoy.getFullYear() && mesVista.getMonth() === hoy.getMonth();
  const irMesAnterior = () => setMesVista((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const irMesSiguiente = () => setMesVista((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const turnosDelDiaSeleccionado = useMemo(
    () =>
      diaSeleccionado
        ? (agenda ?? [])
            .filter((t) => t.fecha === diaSeleccionado)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
        : [],
    [agenda, diaSeleccionado]
  );

  if (!agenda) {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center px-6 py-16">
        <form onSubmit={login} className="bg-surface rounded-3xl shadow-card p-10 w-full max-w-[380px]">
          <a href="#" onClick={volverAlSitio} className="text-xs text-muted mb-6 inline-block">
            ← Volver al sitio
          </a>
          <h1 className="font-quicksand font-bold text-2xl text-ink mb-1">Acceso odontólogos</h1>
          <p className="text-sm text-body mb-8 leading-[1.6]">
            Ingresá tu usuario y contraseña para ver la agenda de turnos.
          </p>

          <label className="block text-[13px] font-bold text-ink mb-2">Usuario</label>
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="lfernandez"
            autoComplete="username"
            className="w-full px-4 py-3 border-[1.5px] border-pill rounded-lg font-inherit text-[15px] bg-surface-alt mb-4 focus:outline-none focus:border-accent"
          />

          <label className="block text-[13px] font-bold text-ink mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-4 py-3 border-[1.5px] border-pill rounded-lg font-inherit text-[15px] bg-surface-alt mb-6 focus:outline-none focus:border-accent"
          />

          {error && (
            <div className="mb-4 bg-surface-alt border-l-[6px] border-accent text-ink rounded-lg px-4 py-3 text-sm font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full border-none bg-body hover:bg-body-hover text-white font-nunito text-[15px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt px-6 py-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <a href="#" onClick={volverAlSitio} className="text-xs text-muted mb-2 inline-block">
              ← Volver al sitio
            </a>
            <h1 className="font-quicksand font-bold text-2xl text-ink">Confirmación de turnos</h1>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setHistoriaAbierta(true)}
              className="bg-body hover:bg-body-hover text-white px-6 py-2.5 rounded-full font-nunito text-[15px] font-bold cursor-pointer border-none"
            >
              Historia clínica
            </button>
            <button
              onClick={salir}
              className="px-5 py-2.5 rounded-full border-[1.5px] border-pill bg-surface hover:bg-pill text-ink font-inherit text-sm font-bold cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-3xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-surface-alt text-left text-ink">
                  <th className="px-5 py-3 font-bold">Paciente</th>
                  <th className="px-5 py-3 font-bold">Contacto</th>
                  <th className="px-5 py-3 font-bold">Fecha</th>
                  <th className="px-5 py-3 font-bold whitespace-nowrap">Horario</th>
                  <th className="px-5 py-3 font-bold">Profesional</th>
                  <th className="px-5 py-3 font-bold">Tratamiento</th>
                  <th className="px-5 py-3 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {turnosPendientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted">
                      No hay turnos pendientes de confirmar o rechazar.
                    </td>
                  </tr>
                ) : (
                  turnosPendientes.map((t) => (
                    <tr key={t.turno_id} className="border-t border-surface-alt align-top">
                      <td className="px-5 py-3 font-bold text-ink break-words">
                        {t.paciente_nombre} {t.paciente_apellido}
                      </td>
                      <td className="px-5 py-3 text-body break-words">
                        {t.paciente_telefono}
                        <br />
                        <span className="text-xs text-muted">{t.paciente_email}</span>
                      </td>
                      <td className="px-5 py-3 text-body break-words">{formatFecha(t.fecha)}</td>
                      <td className="px-5 py-3 text-body whitespace-nowrap">
                        {t.hora_inicio.slice(0, 5)}–{t.hora_fin.slice(0, 5)} h
                      </td>
                      <td className="px-5 py-3 text-body break-words">{t.profesional}</td>
                      <td className="px-5 py-3 text-body break-words">
                        {t.tratamiento}
                        {t.comentario && <div className="text-xs text-muted mt-1">“{t.comentario}”</div>}
                      </td>
                      <td className="px-5 py-3">
                        <EstadoCell turno={t} procesando={procesando} onDecidir={decidirTurno} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 mt-8">
          <div className="bg-surface rounded-3xl shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={irMesAnterior}
                  aria-label="Mes anterior"
                  className="w-8 h-8 rounded-full border border-pill bg-surface hover:bg-accent hover:text-white text-ink flex items-center justify-center cursor-pointer shrink-0"
                >
                  ‹
                </button>
                <div className="font-quicksand font-bold text-[17px] text-ink capitalize text-center">
                  Mi agenda · {MONTHS[mesVista.getMonth()]} {mesVista.getFullYear()}
                </div>
                <button
                  type="button"
                  onClick={irMesSiguiente}
                  aria-label="Mes siguiente"
                  className="w-8 h-8 rounded-full border border-pill bg-surface hover:bg-accent hover:text-white text-ink flex items-center justify-center cursor-pointer shrink-0"
                >
                  ›
                </button>
              </div>
              <div className="text-xs text-muted mt-1 text-center">
                {esMesActual ? "Turnos de hoy en adelante dentro de este mes" : "Turnos de este mes"}, agrupados por
                día.
              </div>
            </div>
            <div className="px-6 pb-6 pt-4 grid gap-5">
              {diasAgenda.length === 0 ? (
                <div className="text-sm text-muted py-4 text-center">No hay turnos registrados todavía.</div>
              ) : (
                diasAgenda.map((dia) => (
                  <div key={dia.fecha} className="border border-surface-alt rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-surface-alt">
                      <div className="font-quicksand font-bold text-sm text-ink">{formatFechaCompleta(dia.fecha)}</div>
                      <div className="ml-auto text-xs text-muted">
                        {dia.turnos.length} {dia.turnos.length === 1 ? "turno" : "turnos"}
                      </div>
                    </div>
                    <div className="divide-y divide-surface-alt">
                      {dia.turnos.map((t) => (
                        <div key={t.turno_id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                          <div className="font-bold text-ink whitespace-nowrap">
                            {t.hora_inicio.slice(0, 5)}–{t.hora_fin.slice(0, 5)} h
                          </div>
                          <div className="text-body break-words flex-1 min-w-[140px]">
                            {t.paciente_nombre} {t.paciente_apellido}
                          </div>
                          <EstadoBadge estado={t.estado} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface rounded-3xl shadow-card overflow-hidden p-6">
            <div className="font-quicksand font-bold text-[17px] text-ink">Calendario anual</div>
            <div className="text-xs text-muted mt-1 mb-4">
              Los días en rosa tienen turnos asignados. Hacé clic para ver el detalle.
            </div>
            <AgendaAnual agenda={agenda ?? []} year={new Date().getFullYear()} onSelectDay={setDiaSeleccionado} />
          </div>
        </div>
      </div>

      <DiaTurnosModal
        fecha={diaSeleccionado}
        turnos={turnosDelDiaSeleccionado}
        onClose={() => setDiaSeleccionado(null)}
      />

      <HistoriaClinicaModal
        abierta={historiaAbierta}
        turnos={historiaClinica}
        notasDraft={notasDraft}
        onNotaChange={(turnoId, valor) => setNotasDraft((prev) => ({ ...prev, [turnoId]: valor }))}
        onGuardar={guardarNota}
        guardando={guardandoNota}
        onClose={() => setHistoriaAbierta(false)}
      />
    </div>
  );
}
