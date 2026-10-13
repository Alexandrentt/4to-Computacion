-- ============================================
-- Esquema de base de datos para Aula Planificador
-- Backend: Supabase (PostgreSQL)
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Tabla: usuarios
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    google_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: configuración del usuario
-- ============================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    school_year TEXT,
    start_date DATE,
    end_date DATE,
    block_duration INTEGER, -- duración en minutos
    schedule_status TEXT DEFAULT 'Pendiente de confirmar', -- 'Pendiente de confirmar' | 'Confirmado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- Tabla: cursos
-- ============================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level TEXT, -- ej: "4.º Bachillerato"
    area TEXT, -- ej: "Programación estructurada"
    color TEXT DEFAULT 'blue', -- blue, green, amber, red
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    classroom_course_id TEXT, -- ID del curso en Google Classroom
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: unidades
-- ============================================
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: temas (topics)
-- ============================================
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: sesiones (clases)
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Borrador', -- Borrador, Lista, Impartida, Reprogramar
    date DATE,
    duration INTEGER, -- duración en minutos
    objective TEXT, -- objetivo de aprendizaje
    introduction TEXT, -- introducción al tema
    development TEXT, -- desarrollo del contenido
    activities TEXT, -- actividades de los estudiantes
    closure TEXT, -- cierre de la clase
    evidence TEXT, -- evidencia o evaluación
    material_url TEXT, -- enlace a materiales
    notes TEXT, -- notas del docente
    classroom_post_id TEXT, -- ID del post en Classroom si se publicó
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: recursos
-- ============================================
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    kind TEXT, -- Google Drive, OneDrive, YouTube, Documento, Presentación, Sitio web, Otro
    url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: tareas (classroom)
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    points INTEGER,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Publicada, En revisión, Revisada
    classroom_url TEXT, -- enlace a la tarea en Classroom
    classroom_task_id TEXT, -- ID de la tarea en Google Classroom
    instructions TEXT, -- instrucciones detalladas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices para optimizar consultas
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_classroom_id ON courses(classroom_course_id);
CREATE INDEX idx_units_course_id ON units(course_id);
CREATE INDEX idx_topics_unit_id ON topics(unit_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_course_id ON sessions(course_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_course_id ON resources(course_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_course_id ON tasks(course_id);
CREATE INDEX idx_tasks_classroom_id ON tasks(classroom_task_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo pueden ver/editar sus propios datos
CREATE POLICY "Users can view own data" ON users
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Política: configuración del usuario
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Política: cursos
CREATE POLICY "Users can view own courses" ON courses
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own courses" ON courses
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own courses" ON courses
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own courses" ON courses
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Política: unidades (heredan seguridad del curso)
CREATE POLICY "Users can view own units" ON units
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = units.course_id AND courses.user_id::text = auth.uid()::text)
    );

CREATE POLICY "Users can insert own units" ON units
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = units.course_id AND courses.user_id::text = auth.uid()::text)
    );

CREATE POLICY "Users can update own units" ON units
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = units.course_id AND courses.user_id::text = auth.uid()::text)
    );

CREATE POLICY "Users can delete own units" ON units
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = units.course_id AND courses.user_id::text = auth.uid()::text)
    );

-- Política: temas (heredan seguridad del curso vía unidad)
CREATE POLICY "Users can view own topics" ON topics
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM units u
            JOIN courses c ON c.id = u.course_id
            WHERE u.id = topics.unit_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own topics" ON topics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM units u
            JOIN courses c ON c.id = u.course_id
            WHERE u.id = topics.unit_id AND c.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own topics" ON topics
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM units u
            JOIN courses c ON c.id = u.course_id
            WHERE u.id = topics.unit_id AND c.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM units u
            JOIN courses c ON c.id = u.course_id
            WHERE u.id = topics.unit_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own topics" ON topics
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM units u
            JOIN courses c ON c.id = u.course_id
            WHERE u.id = topics.unit_id AND c.user_id = auth.uid()
        )
    );

-- Política: sesiones
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Política: recursos
CREATE POLICY "Users can view own resources" ON resources
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own resources" ON resources
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own resources" ON resources
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own resources" ON resources
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Política: tareas
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================
-- Función para actualizar timestamp automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Crear automáticamente el perfil público después del registro en Supabase Auth.
-- Los tokens OAuth de Google Classroom no se almacenan en esta base de datos;
-- la primera versión usa enlaces y seguimiento manual.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        NEW.raw_user_meta_data ->> 'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
          avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- Vinculación entre cursos locales y cursos reales de Google Classroom.
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS classroom_course_map JSONB NOT NULL DEFAULT '{}'::jsonb;
