-- Carga las obras sociales que el sitio ya publicita en el pie de página,
-- para que el asistente virtual (y cualquier otra sección) las lea desde la
-- base en vez de un texto fijo en el código.

insert into public.obras_sociales (nombre) values
  ('OSDE'),
  ('Swiss Medical'),
  ('Galeno'),
  ('Medifé')
on conflict (nombre) do nothing;
