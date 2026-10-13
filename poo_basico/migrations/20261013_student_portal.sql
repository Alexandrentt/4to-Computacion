-- Aula Planner: portal de alumnos, inscripción por código y seguimiento.
-- Esta migración se prepara en el repositorio; NO se aplica automáticamente a producción.
-- La cuenta docente debe habilitarse de forma administrativa insertándola en teacher_profiles.

create extension if not exists pgcrypto;

create table if not exists public.teacher_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(user_id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_invite_codes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  code_hash bytea not null unique,
  max_uses integer not null default 35 check (max_uses between 1 and 500),
  use_count integer not null default 0 check (use_count >= 0),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (use_count <= max_uses)
);

create table if not exists public.class_memberships (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'removed')),
  unique (class_id, student_id)
);

create table if not exists public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 180),
  summary text not null default '',
  content jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  last_position integer not null default 0 check (last_position >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (lesson_id, student_id)
);

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  exercise_key text not null check (length(trim(exercise_key)) between 1 and 120),
  answer jsonb not null default '{}'::jsonb,
  client_reported_score numeric(5,2) check (client_reported_score between 0 and 100),
  passed boolean,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.class_join_attempts (
  student_id uuid primary key references auth.users(id) on delete cascade,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz
);

create index if not exists learning_classes_teacher_idx on public.learning_classes(teacher_id);
create index if not exists class_memberships_student_idx on public.class_memberships(student_id, status);
create index if not exists class_memberships_class_idx on public.class_memberships(class_id, status);
create index if not exists learning_lessons_class_order_idx on public.learning_lessons(class_id, order_index);
create index if not exists lesson_progress_student_idx on public.lesson_progress(student_id, updated_at desc);
create index if not exists exercise_attempts_student_idx on public.exercise_attempts(student_id, created_at desc);
create index if not exists exercise_attempts_lesson_idx on public.exercise_attempts(lesson_id, created_at desc);

alter table public.teacher_profiles enable row level security;
alter table public.learning_classes enable row level security;
alter table public.class_invite_codes enable row level security;
alter table public.class_memberships enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.class_join_attempts enable row level security;

-- El docente no puede autoasignarse el rol: no hay políticas INSERT/UPDATE/DELETE
-- para teacher_profiles. El alta inicial se realiza desde una sesión administrativa.

create policy teacher_profiles_select_self on public.teacher_profiles
  for select to authenticated using (user_id = (select auth.uid()));

create policy learning_classes_teacher_select on public.learning_classes
  for select to authenticated using (teacher_id = (select auth.uid()));
create policy learning_classes_student_select on public.learning_classes
  for select to authenticated using (
    exists (
      select 1 from public.class_memberships m
      where m.class_id = learning_classes.id
        and m.student_id = (select auth.uid()) and m.status = 'active'
    )
  );
create policy learning_classes_teacher_insert on public.learning_classes
  for insert to authenticated with check (
    teacher_id = (select auth.uid()) and exists (
      select 1 from public.teacher_profiles tp where tp.user_id = (select auth.uid())
    )
  );
create policy learning_classes_teacher_update on public.learning_classes
  for update to authenticated using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));

-- Los códigos nunca son legibles directamente por alumnos o clientes.
create policy invite_codes_teacher_select on public.class_invite_codes
  for select to authenticated using (
    exists (select 1 from public.learning_classes c
      where c.id = class_invite_codes.class_id and c.teacher_id = (select auth.uid()))
  );
create policy invite_codes_teacher_insert on public.class_invite_codes
  for insert to authenticated with check (
    exists (select 1 from public.learning_classes c
      where c.id = class_invite_codes.class_id and c.teacher_id = (select auth.uid()))
  );
create policy invite_codes_teacher_update on public.class_invite_codes
  for update to authenticated using (
    exists (select 1 from public.learning_classes c
      where c.id = class_invite_codes.class_id and c.teacher_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.learning_classes c
      where c.id = class_invite_codes.class_id and c.teacher_id = (select auth.uid()))
  );

create policy memberships_teacher_select on public.class_memberships
  for select to authenticated using (
    exists (select 1 from public.learning_classes c
      where c.id = class_memberships.class_id and c.teacher_id = (select auth.uid()))
  );
create policy memberships_student_select_self on public.class_memberships
  for select to authenticated using (student_id = (select auth.uid()));

create policy lessons_teacher_select on public.learning_lessons
  for select to authenticated using (
    exists (select 1 from public.learning_classes c
      where c.id = learning_lessons.class_id and c.teacher_id = (select auth.uid()))
  );
create policy lessons_teacher_insert on public.learning_lessons
  for insert to authenticated with check (
    exists (select 1 from public.learning_classes c
      where c.id = learning_lessons.class_id and c.teacher_id = (select auth.uid()))
  );
create policy lessons_teacher_update on public.learning_lessons
  for update to authenticated using (
    exists (select 1 from public.learning_classes c
      where c.id = learning_lessons.class_id and c.teacher_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.learning_classes c
      where c.id = learning_lessons.class_id and c.teacher_id = (select auth.uid()))
  );
create policy lessons_student_read_published on public.learning_lessons
  for select to authenticated using (
    is_published and exists (
      select 1 from public.class_memberships m
      where m.class_id = learning_lessons.class_id
        and m.student_id = (select auth.uid()) and m.status = 'active'
    )
  );

create policy progress_student_select_own on public.lesson_progress
  for select to authenticated using (student_id = (select auth.uid()));
create policy progress_student_insert_own on public.lesson_progress
  for insert to authenticated with check (
    student_id = (select auth.uid()) and exists (
      select 1 from public.learning_lessons l
      join public.class_memberships m on m.class_id = l.class_id
      where l.id = lesson_progress.lesson_id and l.is_published
        and m.student_id = (select auth.uid()) and m.status = 'active'
    )
  );
create policy progress_student_update_own on public.lesson_progress
  for update to authenticated using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid()) and exists (
      select 1 from public.learning_lessons l
      join public.class_memberships m on m.class_id = l.class_id
      where l.id = lesson_progress.lesson_id and l.is_published
        and m.student_id = (select auth.uid()) and m.status = 'active'
    )
  );
create policy progress_teacher_select on public.lesson_progress
  for select to authenticated using (
    exists (
      select 1 from public.learning_lessons l
      join public.learning_classes c on c.id = l.class_id
      where l.id = lesson_progress.lesson_id and c.teacher_id = (select auth.uid())
    )
  );

create policy attempts_student_select_own on public.exercise_attempts
  for select to authenticated using (student_id = (select auth.uid()));
create policy attempts_student_insert_own on public.exercise_attempts
  for insert to authenticated with check (
    student_id = (select auth.uid()) and exists (
      select 1 from public.learning_lessons l
      join public.class_memberships m on m.class_id = l.class_id
      where l.id = exercise_attempts.lesson_id and l.is_published
        and m.student_id = (select auth.uid()) and m.status = 'active'
    )
  );
create policy attempts_teacher_select on public.exercise_attempts
  for select to authenticated using (
    exists (
      select 1 from public.learning_lessons l
      join public.learning_classes c on c.id = l.class_id
      where l.id = exercise_attempts.lesson_id and c.teacher_id = (select auth.uid())
    )
  );

-- La inscripción solo puede ejecutarse con una sesión autenticada y correo confirmado.
-- El código se compara en forma normalizada y jamás se devuelve desde la base de datos.
create or replace function public.join_class_with_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email_confirmed timestamptz;
  v_attempt public.class_join_attempts%rowtype;
  v_invite public.class_invite_codes%rowtype;
  v_class_id uuid;
  v_normalized text;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión para inscribirte.' using errcode = '28000';
  end if;

  select au.email_confirmed_at into v_email_confirmed
  from auth.users au where au.id = v_uid;
  if v_email_confirmed is null then
    raise exception 'Confirma tu correo antes de usar un código de clase.' using errcode = '42501';
  end if;

  insert into public.class_join_attempts(student_id, attempts, window_started_at)
  values (v_uid, 0, now())
  on conflict (student_id) do nothing;

  select * into v_attempt from public.class_join_attempts
  where student_id = v_uid for update;

  if v_attempt.blocked_until is not null and v_attempt.blocked_until > now() then
    raise exception 'Demasiados intentos. Intenta más tarde.' using errcode = 'P0001';
  end if;

  if v_attempt.window_started_at < now() - interval '1 hour' then
    update public.class_join_attempts
      set attempts = 0, window_started_at = now(), blocked_until = null
      where student_id = v_uid;
    v_attempt.attempts := 0;
  end if;

  if coalesce(length(p_code), 0) < 8 or length(p_code) > 40 then
    update public.class_join_attempts set attempts = attempts + 1,
      blocked_until = case when attempts + 1 >= 10 then now() + interval '1 hour' else blocked_until end
      where student_id = v_uid;
    raise exception 'El código no es válido.' using errcode = 'P0001';
  end if;

  v_normalized := upper(regexp_replace(trim(p_code), '[^A-Z0-9]', '', 'g'));

  select * into v_invite from public.class_invite_codes i
  where i.code_hash = extensions.digest(v_normalized, 'sha256')
    and i.revoked_at is null
    and (i.expires_at is null or i.expires_at > now())
    and i.use_count < i.max_uses
  for update;

  if not found then
    update public.class_join_attempts set attempts = attempts + 1,
      blocked_until = case when attempts + 1 >= 10 then now() + interval '1 hour' else blocked_until end
      where student_id = v_uid;
    raise exception 'El código no es válido o ha expirado.' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.class_memberships m
    where m.class_id = v_invite.class_id and m.student_id = v_uid and m.status = 'active') then
    raise exception 'Ya estás inscrito en esta clase.' using errcode = 'P0001';
  end if;

  select c.id into v_class_id from public.learning_classes c
  where c.id = v_invite.class_id and c.is_active = true;
  if v_class_id is null then
    raise exception 'La clase no está disponible.' using errcode = 'P0001';
  end if;

  insert into public.class_memberships(class_id, student_id)
  values (v_class_id, v_uid);

  update public.class_invite_codes set use_count = use_count + 1
  where id = v_invite.id;

  update public.class_join_attempts set attempts = 0, window_started_at = now(), blocked_until = null
  where student_id = v_uid;

  return v_class_id;
end;
$$;

revoke all on function public.join_class_with_code(text) from public, anon;
grant execute on function public.join_class_with_code(text) to authenticated;

-- El docente genera códigos mediante esta función: la base guarda solo el hash.
create or replace function public.create_class_invite(
  p_class_id uuid,
  p_code text,
  p_max_uses integer default 35,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_id uuid;
begin
  if v_uid is null or not exists (
    select 1 from public.teacher_profiles tp where tp.user_id = v_uid
  ) then
    raise exception 'Solo el docente autorizado puede crear códigos.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.learning_classes c
    where c.id = p_class_id and c.teacher_id = v_uid and c.is_active
  ) then
    raise exception 'No tienes permiso para esta clase.' using errcode = '42501';
  end if;

  v_code := upper(regexp_replace(trim(coalesce(p_code, '')), '[^A-Z0-9]', '', 'g'));
  if length(v_code) < 12 or length(v_code) > 40 then
    raise exception 'El código debe tener entre 12 y 40 caracteres alfanuméricos.' using errcode = '22023';
  end if;
  if p_max_uses < 1 or p_max_uses > 500 then
    raise exception 'El límite de usos debe estar entre 1 y 500.' using errcode = '22023';
  end if;
  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'La fecha de expiración debe ser futura.' using errcode = '22023';
  end if;

  insert into public.class_invite_codes(class_id, code_hash, max_uses, expires_at)
  values (p_class_id, extensions.digest(v_code, 'sha256'), p_max_uses, p_expires_at)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_class_invite(uuid, text, integer, timestamptz) from public, anon;
grant execute on function public.create_class_invite(uuid, text, integer, timestamptz) to authenticated;

-- No se conceden escrituras directas en tablas sensibles; RPCs aplican controles de autorización.
revoke all on public.class_join_attempts from anon, authenticated;
grant select, insert, update on public.class_join_attempts to service_role;
