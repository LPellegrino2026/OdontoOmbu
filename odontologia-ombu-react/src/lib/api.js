import { supabase } from "./supabaseClient";

export async function getTratamientos() {
  const { data, error } = await supabase
    .from("tratamientos")
    .select("id, nombre, descripcion, duracion_min")
    .eq("activo", true)
    .order("orden");
  if (error) throw error;
  return data;
}

export async function getOdontologos() {
  const { data, error } = await supabase
    .from("odontologos")
    .select("id, nombre, apellido, iniciales, especialidad")
    .eq("activo", true)
    .order("id");
  if (error) throw error;
  return data;
}

export async function getObrasSociales() {
  const { data, error } = await supabase.from("obras_sociales").select("id, nombre").order("id");
  if (error) throw error;
  return data;
}

// Horarios libres de un odontólogo para una fecha: franjas de "disponibilidad"
// para ese día de la semana, menos lo que ya figura en "turnos_ocupados".
export async function getSlotsDisponibles(odontologoId, fecha) {
  if (!odontologoId || !fecha) return [];
  const diaSemana = new Date(fecha + "T12:00:00").getDay();

  const [{ data: disponibilidad, error: dispError }, { data: ocupados, error: ocupError }] = await Promise.all([
    supabase
      .from("disponibilidad")
      .select("hora_inicio")
      .eq("odontologo_id", odontologoId)
      .eq("dia_semana", diaSemana)
      .order("hora_inicio"),
    supabase
      .from("turnos_ocupados")
      .select("hora_inicio")
      .eq("odontologo_id", odontologoId)
      .eq("fecha", fecha),
  ]);

  if (dispError) throw dispError;
  if (ocupError) throw ocupError;

  const ocupadas = new Set((ocupados ?? []).map((t) => t.hora_inicio));
  return (disponibilidad ?? [])
    .map((d) => d.hora_inicio)
    .filter((hora) => !ocupadas.has(hora))
    .map((hora) => hora.slice(0, 5));
}

// Crea paciente + turno de forma atómica vía RPC (ver migración crear_turno_rpc).
export async function crearTurno({ tratamientoId, odontologoId, fecha, horaInicio, paciente }) {
  const { data, error } = await supabase.rpc("crear_turno", {
    p_tratamiento_id: tratamientoId,
    p_odontologo_id: odontologoId,
    p_fecha: fecha,
    p_hora_inicio: horaInicio,
    p_nombre: paciente.nombre,
    p_apellido: paciente.apellido,
    p_telefono: paciente.telefono,
    p_email: paciente.email,
    p_comentario: paciente.nota || null,
  });
  if (error) throw error;
  return data[0];
}

// Valida usuario/contraseña de staff y devuelve únicamente los turnos del
// odontólogo asociado a esa cuenta (ver migración staff_login_agenda y su
// actualización scope_agenda_staff_a_propio_odontologo). Lanza error si las
// credenciales no son válidas.
export async function loginStaff(usuario, password) {
  const { data, error } = await supabase.rpc("obtener_agenda_staff", {
    p_usuario: usuario.trim().toLowerCase(),
    p_password: password,
  });
  if (error) throw error;
  return data;
}

// Confirma o rechaza un turno pendiente (ver migración estado_pendiente_rechazado_turnos).
// Requiere las mismas credenciales de staff que loginStaff; el backend valida
// que el turno pertenezca al odontólogo de esa cuenta.
export async function actualizarEstadoTurno(usuario, password, turnoId, nuevoEstado) {
  const { error } = await supabase.rpc("actualizar_estado_turno", {
    p_usuario: usuario.trim().toLowerCase(),
    p_password: password,
    p_turno_id: turnoId,
    p_nuevo_estado: nuevoEstado,
  });
  if (error) throw error;
}

// Guarda (o reemplaza) la nota clínica de un turno aceptado (ver migración
// agrega_nota_clinica_turnos). Requiere las mismas credenciales de staff que
// loginStaff; el backend valida que el turno pertenezca al odontólogo de esa cuenta.
export async function guardarNotaClinica(usuario, password, turnoId, nota) {
  const { error } = await supabase.rpc("guardar_nota_clinica", {
    p_usuario: usuario.trim().toLowerCase(),
    p_password: password,
    p_turno_id: turnoId,
    p_nota: nota,
  });
  if (error) throw error;
}
