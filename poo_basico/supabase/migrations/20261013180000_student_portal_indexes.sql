-- Índices de claves foráneas para las consultas del portal.
create index if not exists class_invite_codes_class_idx
  on public.class_invite_codes(class_id);
create index if not exists learning_classes_course_idx
  on public.learning_classes(course_id);
