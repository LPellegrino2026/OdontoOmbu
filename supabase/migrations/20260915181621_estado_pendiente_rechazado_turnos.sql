-- ============================================================
-- Agrega estados 'pendiente' y 'rechazado' a turnos, para que el
-- odontólogo confirme o rechace cada turno reservado desde el sitio.
-- ============================================================

-- 1. Ampliar los estados válidos
alter table public.turnos drop constraint turnos_estado_check;
alter table public.turnos add constraint turnos_estado_check
  check (estado::text = any (array['pendiente', 'confirmado', 'cancelado', 'reprogramado', 'completado', 'rechazado']::text[]));
alter table public.turnos alter column estado set default 'pendiente';

-- 2. Un turno nuevo puede insertarse como 'pendiente' (antes solo 'confirmado')
drop policy if exists turnos_insert_public on public.turnos;
create policy turnos_insert_public on public.turnos
  for insert to anon, authenticated
  with check (estado::text = any (array['pendiente', 'confirmado']::text[]));

-- 3. Un turno pendiente también bloquea el horario para otros pacientes
drop policy if exists turnos_select_slots_public on public.turnos;
create policy turnos_select_slots_public on public.turnos
  for select to anon, authenticated
  using (estado::text = any (array['pendiente', 'confirmado', 'reprogramado']::text[]));

create or replace view public.turnos_ocupados
  with (security_invoker = true) as
  select odontologo_id, fecha, hora_inicio, hora_fin
  from public.turnos
  where estado::text = any (array['pendiente', 'confirmado', 'reprogramado']::text[]);

-- 4. crear_turno: el turno nace 'pendiente' (antes 'confirmado' directo),
--    y un turno pendiente también cuenta como horario ocupado.
create or replace function public.crear_turno(
  p_tratamiento_id integer,
  p_odontologo_id integer,
  p_fecha date,
  p_hora_inicio time,
  p_nombre character varying,
  p_apellido character varying,
  p_telefono character varying,
  p_email character varying,
  p_comentario text default null,
  p_obra_social_id integer default null
)
returns table(turno_id integer, codigo text, fecha date, hora_inicio time, hora_fin time)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_duracion integer;
  v_hora_fin time;
  v_paciente_id integer;
  v_turno_id integer;
  v_ocupado boolean;
begin
  select t.duracion_min into v_duracion from tratamientos t where t.id = p_tratamiento_id and t.activo = true;
  if v_duracion is null then
    raise exception 'Tratamiento inválido';
  end if;

  v_hora_fin := p_hora_inicio + make_interval(mins => v_duracion);

  select exists (
    select 1 from turnos tu
    where tu.odontologo_id = p_odontologo_id
      and tu.fecha = p_fecha
      and tu.hora_inicio = p_hora_inicio
      and tu.estado in ('pendiente', 'confirmado', 'reprogramado')
  ) into v_ocupado;

  if v_ocupado then
    raise exception 'Ese horario ya no está disponible';
  end if;

  insert into pacientes (nombre, apellido, telefono, email, obra_social_id)
  values (p_nombre, p_apellido, p_telefono, p_email, p_obra_social_id)
  returning id into v_paciente_id;

  insert into turnos (paciente_id, odontologo_id, tratamiento_id, fecha, hora_inicio, hora_fin, comentario, estado)
  values (v_paciente_id, p_odontologo_id, p_tratamiento_id, p_fecha, p_hora_inicio, v_hora_fin, p_comentario, 'pendiente')
  returning id into v_turno_id;

  return query select v_turno_id, 'OMB-' || v_turno_id::text, p_fecha, p_hora_inicio, v_hora_fin;
end;
$function$;

-- 5. obtener_agenda_staff: ahora también trae pendientes y rechazados
create or replace function public.obtener_agenda_staff(p_usuario text, p_password text)
returns table(
  turno_id integer, paciente_nombre text, paciente_apellido text, paciente_telefono text,
  paciente_email text, fecha date, hora_inicio time, hora_fin time,
  profesional text, tratamiento text, comentario text, estado text
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_valido boolean;
begin
  select exists (
    select 1 from staff_credenciales sc
    where sc.usuario = lower(p_usuario)
      and sc.activo = true
      and sc.password_hash = extensions.crypt(p_password, sc.password_hash)
  ) into v_valido;

  if not v_valido then
    raise exception 'Usuario o contraseña incorrectos';
  end if;

  return query
    select
      t.id,
      p.nombre::text,
      p.apellido::text,
      p.telefono::text,
      p.email::text,
      t.fecha,
      t.hora_inicio,
      t.hora_fin,
      (o.nombre || ' ' || o.apellido)::text,
      tr.nombre::text,
      t.comentario::text,
      t.estado::text
    from turnos t
    join pacientes p on p.id = t.paciente_id
    join odontologos o on o.id = t.odontologo_id
    join tratamientos tr on tr.id = t.tratamiento_id
    where t.estado in ('pendiente', 'confirmado', 'reprogramado', 'rechazado')
    order by t.fecha, t.hora_inicio;
end;
$function$;

-- 6. Nueva RPC: el odontólogo (staff logueado) confirma o rechaza un turno pendiente
create or replace function public.actualizar_estado_turno(
  p_usuario text,
  p_password text,
  p_turno_id integer,
  p_nuevo_estado text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_valido boolean;
  v_estado_actual text;
begin
  if p_nuevo_estado not in ('confirmado', 'rechazado') then
    raise exception 'Estado inválido';
  end if;

  select exists (
    select 1 from staff_credenciales sc
    where sc.usuario = lower(p_usuario)
      and sc.activo = true
      and sc.password_hash = extensions.crypt(p_password, sc.password_hash)
  ) into v_valido;

  if not v_valido then
    raise exception 'Usuario o contraseña incorrectos';
  end if;

  select estado into v_estado_actual from turnos where id = p_turno_id;

  if v_estado_actual is null then
    raise exception 'Turno no encontrado';
  end if;

  if v_estado_actual <> 'pendiente' then
    raise exception 'Este turno ya fue procesado';
  end if;

  update turnos set estado = p_nuevo_estado where id = p_turno_id;
end;
$function$;

grant execute on function public.actualizar_estado_turno(text, text, integer, text) to anon, authenticated;
