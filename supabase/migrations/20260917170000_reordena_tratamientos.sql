-- Agrega orden de visualización a tratamientos, agrega "Odontología general"
-- como primer ítem, y da de baja "Limpieza Dental" (soft-delete vía activo,
-- porque ya tiene turnos reales asociados) reemplazándola por "Estética
-- Dental" en su lugar.

alter table public.tratamientos
  add column if not exists orden integer;

update public.tratamientos set orden = id where orden is null;

-- Limpieza Dental ya tiene turnos reservados: se desactiva en vez de
-- borrarse, para no romper esas referencias existentes.
update public.tratamientos set activo = false where nombre = 'Limpieza Dental';

insert into public.tratamientos (nombre, descripcion, duracion_min, activo, orden)
values (
  'Odontología general',
  'Consulta, diagnóstico y tratamientos odontológicos generales.',
  30,
  true,
  0
);

insert into public.odontologo_tratamiento (odontologo_id, tratamiento_id)
select o.id, t.id
from odontologos o
cross join tratamientos t
where t.nombre = 'Odontología general'
  and o.activo = true;

update public.tratamientos set orden = 1 where nombre = 'Estética Dental';
update public.tratamientos set orden = 2 where nombre = 'Ortodoncia';
update public.tratamientos set orden = 3 where nombre = 'Implantes';
