-- Correct class ownership checks when the courses table has RLS enabled.
create or replace function private.teacher_owns_course(p_course_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_user_id = (select auth.uid())
     and exists (select 1 from public.courses c where c.id = p_course_id and c.user_id = p_user_id);
$$;
revoke all on function private.teacher_owns_course(uuid, uuid) from public, anon;
grant execute on function private.teacher_owns_course(uuid, uuid) to authenticated;

drop policy if exists learning_classes_teacher_insert on public.learning_classes;
create policy learning_classes_teacher_insert on public.learning_classes
for insert to authenticated with check (
  teacher_id = (select auth.uid())
  and exists (select 1 from public.teacher_profiles tp where tp.user_id = (select auth.uid()))
  and private.teacher_owns_course(course_id, (select auth.uid()))
);

drop policy if exists learning_classes_teacher_update on public.learning_classes;
create policy learning_classes_teacher_update on public.learning_classes
for update to authenticated using (private.is_class_teacher(id))
with check (
  teacher_id = (select auth.uid())
  and private.is_class_teacher(id)
  and private.teacher_owns_course(course_id, (select auth.uid()))
);

-- Seed one class for each agreed course for the designated teacher account.
insert into public.learning_classes (teacher_id, course_id, name)
select c.user_id, c.id, c.name
from public.courses c
join auth.users u on u.id = c.user_id
join public.teacher_profiles tp on tp.user_id = c.user_id
where lower(u.email) = 'perezgomezbrandon6a@gmail.com'
and not exists (select 1 from public.learning_classes lc where lc.course_id=c.id and lc.teacher_id=c.user_id);
