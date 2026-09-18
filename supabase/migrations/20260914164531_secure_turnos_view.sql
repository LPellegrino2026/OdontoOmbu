-- ============================================================
-- Reemplaza la vista SECURITY DEFINER de turnos_ocupados por un
-- enfoque sin bypass de RLS: permisos a nivel de columna sobre
-- turnos + una política de SELECT a nivel de fila.
-- ============================================================

DROP VIEW IF EXISTS turnos_ocupados;

-- Solo estas columnas son visibles para anon/authenticated (nunca
-- paciente_id, tratamiento_id, comentario, etc.)
GRANT SELECT (odontologo_id, fecha, hora_inicio, hora_fin) ON turnos TO anon, authenticated;

-- Fila visible solo si el turno está activo (no cancelado)
CREATE POLICY "turnos_select_slots_public" ON turnos
    FOR SELECT TO anon, authenticated
    USING (estado IN ('confirmado', 'reprogramado'));

-- Vista sin SECURITY DEFINER: corre con los permisos de quien
-- consulta, respetando el RLS y los permisos de columna de arriba.
CREATE VIEW turnos_ocupados
WITH (security_invoker = true) AS
SELECT odontologo_id, fecha, hora_inicio, hora_fin
FROM turnos
WHERE estado IN ('confirmado', 'reprogramado');

GRANT SELECT ON turnos_ocupados TO anon, authenticated;
