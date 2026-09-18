-- Restringe obtener_agenda_staff y actualizar_estado_turno a los turnos del
-- odontólogo vinculado a la cuenta de staff que se loguea, en vez de exponer
-- (y permitir modificar) los turnos de todos los odontólogos.

create or replace function public.obtener_agenda_staff(p_usuario text, p_password text)
 returns table(turno_id integer, paciente_nombre text, paciente_apellido text, paciente_telefono text, paciente_email text, fecha date, hora_inicio time without time zone, hora_fin time without time zone, profesional text, tratamiento text, comentario text, estado text)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_odontologo_id integer;
begin
  select sc.odontologo_id into v_odontologo_id
  from staff_credenciales sc
  where sc.usuario = lower(p_usuario)
    and sc.activo = true
    and sc.password_hash = extensions.crypt(p_password, sc.password_hash);

  if v_odontologo_id is null then
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
    where t.odontologo_id = v_odontologo_id
      and t.estado in ('pendiente', 'confirmado', 'reprogramado', 'rechazado')
    order by t.fecha, t.hora_inicio;
end;
$function$;

create or replace function public.actualizar_estado_turno(p_usuario text, p_password text, p_turno_id integer, p_nuevo_estado text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_odontologo_id integer;
  v_estado_actual text;
  v_turno_odontologo_id integer;
begin
  if p_nuevo_estado not in ('confirmado', 'rechazado') then
    raise exception 'Estado inválido';
  end if;

  select sc.odontologo_id into v_odontologo_id
  from staff_credenciales sc
  where sc.usuario = lower(p_usuario)
    and sc.activo = true
    and sc.password_hash = extensions.crypt(p_password, sc.password_hash);

  if v_odontologo_id is null then
    raise exception 'Usuario o contraseña incorrectos';
  end if;

  select estado, odontologo_id into v_estado_actual, v_turno_odontologo_id from turnos where id = p_turno_id;

  if v_estado_actual is null then
    raise exception 'Turno no encontrado';
  end if;

  if v_turno_odontologo_id <> v_odontologo_id then
    raise exception 'No tenés permiso para modificar este turno';
  end if;

  if v_estado_actual <> 'pendiente' then
    raise exception 'Este turno ya fue procesado';
  end if;

  update turnos set estado = p_nuevo_estado where id = p_turno_id;
end;
$function$;
