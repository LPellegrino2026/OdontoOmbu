-- ============================================================
-- Row Level Security: Odontología Ombú
-- Acceso público (anon/authenticated) directo desde el frontend,
-- sin login de pacientes todavía.
-- ============================================================

-- ---------------------------------------------------------
-- Tablas de referencia: lectura pública, sin escritura pública
-- ---------------------------------------------------------
ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tratamientos_select_public" ON tratamientos
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE odontologos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "odontologos_select_public" ON odontologos
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE odontologo_tratamiento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "odontologo_tratamiento_select_public" ON odontologo_tratamiento
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE obras_sociales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_sociales_select_public" ON obras_sociales
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disponibilidad_select_public" ON disponibilidad
    FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------------------------------------
-- Pacientes: el formulario de reserva puede CREAR un paciente,
-- pero nadie puede listar ni modificar pacientes vía cliente.
-- ---------------------------------------------------------
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pacientes_insert_public" ON pacientes
    FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Sin políticas de SELECT/UPDATE/DELETE => bloqueadas por defecto para anon/authenticated.

-- ---------------------------------------------------------
-- Turnos: el formulario puede CREAR un turno (siempre en estado
-- 'confirmado'), pero no puede leer, editar ni cancelar turnos
-- ajenos vía cliente.
-- ---------------------------------------------------------
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "turnos_insert_public" ON turnos
    FOR INSERT TO anon, authenticated
    WITH CHECK (estado = 'confirmado');
-- Sin políticas de SELECT/UPDATE/DELETE => bloqueadas por defecto para anon/authenticated.

-- ---------------------------------------------------------
-- Vista pública de horarios ocupados (sin datos del paciente),
-- para que el frontend pueda pintar la grilla de disponibilidad
-- sin exponer turnos.paciente_id, turnos.comentario, etc.
-- ---------------------------------------------------------
-- security_invoker se deja en false (default) a propósito: la vista
-- debe leer turnos con los permisos del dueño (bypass de RLS) para
-- poder devolver los horarios ocupados a anon, que no tiene SELECT
-- directo sobre la tabla turnos.
CREATE VIEW turnos_ocupados AS
SELECT odontologo_id, fecha, hora_inicio, hora_fin
FROM turnos
WHERE estado IN ('confirmado', 'reprogramado');

GRANT SELECT ON turnos_ocupados TO anon, authenticated;
