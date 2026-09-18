-- Agrega notas clínicas por turno (hasta 200 caracteres), editables por el
-- odontólogo dueño del turno desde "Historia clínica", y expone el campo en
-- obtener_agenda_staff.

alter table public.turnos
  add column if not exists nota_clinica text;

alter table public.turnos
  add constraint turnos_nota_clinica_length check (nota_clinica is null or char_length(nota_clinica) <= 200);

-- obtener_agenda_staff cambia su tipo de retorno (columna nota_clinica nueva),
-- así que hay que borrarla antes de recrearla con create or replace.
drop function if exists public.obtener_agenda_staff(text, text);

create function public.obtener_agenda_staff(p_usuario text, p_password text)
 returns table(turno_id integer, paciente_nombre text, paciente_apellido text, paciente_telefono text, paciente_email text, fecha date, hora_inicio time without time zone, hora_fin time without time zone, profesional text, tratamiento text, comentario text, estado text, nota_clinica text)
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
      t.estado::text,
      t.nota_clinica::text
    from turnos t
    join pacientes p on p.id = t.paciente_id
    join odontologos o on o.id = t.odontologo_id
    join tratamientos tr on tr.id = t.tratamiento_id
    where t.odontologo_id = v_odontologo_id
      and t.estado in ('pendiente', 'confirmado', 'reprogramado', 'rechazado')
    order by t.fecha, t.hora_inicio;
end;
$function$;

create or replace function public.guardar_nota_clinica(p_usuario text, p_password text, p_turno_id integer, p_nota text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_odontologo_id integer;
  v_turno_odontologo_id integer;
begin
  if p_nota is not null and char_length(p_nota) > 200 then
    raise exception 'La nota no puede superar los 200 caracteres';
  end if;

  select sc.odontologo_id into v_odontologo_id
  from staff_credenciales sc
  where sc.usuario = lower(p_usuario)
    and sc.activo = true
    and sc.password_hash = extensions.crypt(p_password, sc.password_hash);

  if v_odontologo_id is null then
    raise exception 'Usuario o contraseña incorrectos';
  end if;

  select odontologo_id into v_turno_odontologo_id from turnos where id = p_turno_id;

  if v_turno_odontologo_id is null then
    raise exception 'Turno no encontrado';
  end if;

  if v_turno_odontologo_id <> v_odontologo_id then
    raise exception 'No tenés permiso para modificar este turno';
  end if;

  update turnos set nota_clinica = p_nota where id = p_turno_id;
end;
$function$;
