# Guía de Implementación - Aula Planificador v2

Esta guía te llevará paso a paso para transformar el planificador en una aplicación con backend real, integración con Google Classroom y sincronización entre dispositivos.

## 📋 Requisitos previos

- Cuenta de Google (para Google Cloud Console y Google Classroom)
- Cuenta de Supabase (gratis en supabase.com)
- Node.js instalado (opcional, para el backend)

---

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto llamado "aula-planner"
3. Espera a que el proyecto se inicialice (2-3 minutos)
4. Anota las credenciales:
   - **Project URL** (ej: https://xxxxxxxxxxxxx.supabase.co)
   - **Anon Public Key** (API key pública)

### 1.2 Ejecutar el esquema de base de datos

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva consulta
3. Copia y pega el contenido de `supabase_schema.sql`
4. Ejecuta la consulta (botón "Run")
5. Verifica que se crearon todas las tablas en el **Table Editor**

### 1.3 Configurar autenticación

1. Ve a **Authentication** > **Providers**
2. Habilita **Email** (ya viene habilitado por defecto)
3. Para Google OAuth:
   - Habilita el proveedor **Google**
   - Necesitarás el Client ID y Client Secret de Google Cloud Console (ver Paso 2)
   - Guarda la URL de redirección que Supabase te proporciona

### 1.4 Configurar RLS (Row Level Security)

El esquema SQL ya incluye las políticas RLS. Verifica en **Authentication** > **Policies** que todas las políticas estén activas.

---

## 🔑 Paso 2: Configurar Google Cloud Console

### 2.1 Crear proyecto en Google Cloud

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto llamado "Aula Planner"
3. Selecciona el proyecto recién creado

### 2.2 Habilitar Google Classroom API

1. Ve a **APIs & Services** > **Library**
2. Busca "Google Classroom API"
3. Haz clic en **Enable**

### 2.3 Crear credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: Aula Planner
   - **Authorized redirect URIs**:
     - La URL de tu aplicación frontend (ej: http://localhost:3000 si es local)
     - La URL de callback de Supabase (del Paso 1.3)
5. Guarda el **Client ID** y **Client Secret** en un lugar seguro

### 2.4 Configurar pantalla de consentimiento

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** y haz clic en **Create**
3. Completa:
   - **App name**: Aula Planner
   - **User support email**: tu email
   - **Developer contact**: tu email
4. En **Scopes**, agrega:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.students`
   - `https://www.googleapis.com/auth/classroom.coursework.me`
5. Haz clic en **Save and Continue**

### 2.5 Volver a Supabase

1. Regresa a Supabase > **Authentication** > **Providers** > **Google**
2. Pega el **Client ID** y **Client Secret** de Google Cloud Console
3. Guarda la configuración

---

## 🎨 Paso 3: Configurar el Frontend

### 3.1 Instalar dependencias

Crea un nuevo proyecto o modifica el existente:

```bash
npm install @supabase/supabase-js
```

### 3.2 Crear archivo de configuración

Crea `src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_PROJECT_URL_DE_SUPABASE'
const supabaseAnonKey = 'TU_ANON_KEY_DE_SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3.3 Sistema de autenticación

Crea `src/auth.js`:

```javascript
import { supabase } from './config/supabase.js'

// Registro con email y contraseña
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  return { data, error }
}

// Login con email y contraseña
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Login con Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback'
    }
  })
  return { data, error }
}

// Cerrar sesión
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Obtener usuario actual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Escuchar cambios de autenticación
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
```

### 3.4 UI de Login/Registro

Modifica el HTML actual para agregar una pantalla de login:

```html
<!-- Agrega esto antes del .app div -->
<div id="authScreen" class="auth-screen" style="display:none">
  <div class="auth-container">
    <div class="brand">
      <div class="logo">A</div>
      <div><strong>Aula</strong><small>Planificador docente</small></div>
    </div>
    <form id="authForm">
      <div class="field">
        <label>Email</label>
        <input type="email" id="authEmail" required>
      </div>
      <div class="field">
        <label>Contraseña</label>
        <input type="password" id="authPassword" required>
      </div>
      <div class="field" id="nameField" style="display:none">
        <label>Nombre completo</label>
        <input type="text" id="authName">
      </div>
      <button type="submit" class="btn primary" id="authSubmit">Iniciar sesión</button>
    </form>
    <div class="auth-divider">o</div>
    <button class="btn" id="googleAuth">Continuar con Google</button>
    <p class="auth-toggle">
      <span id="authToggleText">¿No tienes cuenta?</span>
      <a href="#" id="authToggleLink">Regístrate</a>
    </p>
  </div>
</div>
```

### 3.5 Lógica de autenticación en el frontend

Modifica el JavaScript principal:

```javascript
import { supabase } from './config/supabase.js'
import { signIn, signUp, signInWithGoogle, signOut, getCurrentUser, onAuthStateChange } from './auth.js'

// Al cargar la página
async function init() {
  const user = await getCurrentUser()
  if (user) {
    showApp()
    loadUserData(user.id)
  } else {
    showAuth()
  }

  // Escuchar cambios de autenticación
  onAuthStateChange((event, session) => {
    if (session) {
      showApp()
      loadUserData(session.user.id)
    } else {
      showAuth()
    }
  })
}

function showAuth() {
  document.getElementById('authScreen').style.display = 'flex'
  document.querySelector('.app').style.display = 'none'
}

function showApp() {
  document.getElementById('authScreen').style.display = 'none'
  document.querySelector('.app').style.display = 'grid'
}

// Cargar datos del usuario desde Supabase
async function loadUserData(userId) {
  // Cargar cursos
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)

  // Cargar sesiones
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)

  // Cargar recursos
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('user_id', userId)

  // Cargar tareas
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)

  // Actualizar el estado local
  db.courses = courses || []
  db.sessions = sessions || []
  db.resources = resources || []
  db.tasks = tasks || []

  render()
}
```

---

## 🔄 Paso 4: Migrar datos de localStorage a Supabase

### 4.1 Función de migración

Crea `src/migration.js`:

```javascript
import { supabase } from './config/supabase.js'
import { getCurrentUser } from './auth.js'

export async function migrateFromLocalStorage() {
  const user = await getCurrentUser()
  if (!user) {
    alert('Debes iniciar sesión para migrar tus datos')
    return
  }

  const localData = localStorage.getItem('aula-planner-v1')
  if (!localData) {
    alert('No hay datos locales para migrar')
    return
  }

  const data = JSON.parse(localData)

  // Migrar cursos
  for (const course of data.courses) {
    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      name: course.name,
      level: course.level,
      area: course.area,
      color: course.color,
      description: course.description
    })
    if (error) console.error('Error migrando curso:', error)
  }

  // Migrar sesiones
  for (const session of data.sessions) {
    const { error } = await supabase.from('sessions').insert({
      user_id: user.id,
      course_id: session.courseId,
      title: session.title,
      status: session.status,
      date: session.date,
      duration: session.duration,
      objective: session.objective,
      activities: session.activities,
      evidence: session.evidence,
      material_url: session.materialUrl,
      notes: session.notes
    })
    if (error) console.error('Error migrando sesión:', error)
  }

  // Migrar recursos
  for (const resource of data.resources) {
    const { error } = await supabase.from('resources').insert({
      user_id: user.id,
      course_id: resource.courseId,
      title: resource.title,
      kind: resource.kind,
      url: resource.url,
      notes: resource.notes
    })
    if (error) console.error('Error migrando recurso:', error)
  }

  // Migrar tareas
  for (const task of data.tasks) {
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      course_id: task.courseId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      points: task.points,
      status: task.status,
      classroom_url: task.classroomUrl
    })
    if (error) console.error('Error migrando tarea:', error)
  }

  alert('Migración completada')
}
```

---

## 📚 Paso 5: Integración con Google Classroom

### 5.1 API functions para Classroom

Crea `src/classroom.js`:

```javascript
import { supabase } from './config/supabase.js'

// Obtener token de acceso de Classroom
async function getClassroomToken() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return settings?.classroom_access_token
}

// Obtener cursos de Classroom
export async function getClassroomCourses() {
  const token = await getClassroomToken()
  if (!token) return { error: 'No hay token de Classroom' }

  const response = await fetch('https://classroom.googleapis.com/v1/courses', {
    headers: { Authorization: `Bearer ${token}` }
  })

  return response.json()
}

// Crear tarea en Classroom
export async function createClassroomTask(courseId, taskData) {
  const token = await getClassroomToken()
  if (!token) return { error: 'No hay token de Classroom' }

  const response = await fetch(
    `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        maxPoints: taskData.points
      })
    }
  )

  return response.json()
}

// Sincronizar tareas desde Classroom
export async function syncClassroomTasks() {
  const token = await getClassroomToken()
  if (!token) return { error: 'No hay token de Classroom' }

  const courses = await getClassroomCourses()
  if (courses.error) return courses

  const allTasks = []

  for (const course of courses.courses) {
    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const data = await response.json()
    if (data.courseWork) {
      allTasks.push(...data.courseWork.map(task => ({
        ...task,
        courseName: course.name
      })))
    }
  }

  return { tasks: allTasks }
}
```

### 5.2 Flujo de autorización Classroom

Para obtener el token de Classroom, necesitas implementar el flujo OAuth:

1. El usuario hace clic en "Conectar Classroom"
2. Redirige a Google OAuth con scope de Classroom
3. Google redirige de vuelta con el código
4. Intercambia el código por access token y refresh token
5. Guarda los tokens en `user_settings`

---

## 🎯 Paso 6: Rediseñar UI para contenido detallado

### 6.1 Nuevo modal de edición de sesiones

Modifica la función `openModal` para usar las plantillas:

```javascript
function openModal(type, id = null) {
  // ... código existente ...

  if (type === 'session') {
    const template = sessionTemplate
    body = `<div class="session-editor">`

    for (const section of template.sections) {
      body += `
        <div class="field ${section.id === 'objective' ? 'span-2' : ''}">
          <label>${section.title} ${section.required ? '*' : ''}</label>
          ${section.type === 'textarea'
            ? `<textarea name="${section.id}" placeholder="${section.placeholder}">${esc(item?.[section.id] || '')}</textarea>`
            : section.type === 'url'
            ? `<input type="url" name="${section.id}" value="${esc(item?.[section.id] || '')}" placeholder="${section.placeholder}">`
            : `<input type="text" name="${section.id}" value="${esc(item?.[section.id] || '')}" placeholder="${section.placeholder}">`
          }
          ${section.examples ? `
            <div class="examples">
              <small>Ejemplos:</small>
              ${section.examples.map(ex => `<div class="example">"${ex}"</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `
    }

    body += `</div>`
  }

  // ... resto del código ...
}
```

### 6.2 Estilos para el editor de sesiones

Agrega al CSS:

```css
.session-editor {
  display: grid;
  gap: 16px;
}

.session-editor .field {
  margin-bottom: 0;
}

.examples {
  margin-top: 8px;
  padding: 8px;
  background: var(--accent2);
  border-radius: 6px;
  font-size: 12px;
}

.example {
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  margin: 4px 0;
  cursor: pointer;
}

.example:hover {
  background: var(--accent);
  color: white;
}
```

---

## 🚀 Paso 7: Despliegue

### 7.1 Opciones de despliegue

**Opción A: Vercel (recomendado)**
1. Sube el código a GitHub
2. Conecta tu repositorio a Vercel
3. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Despliega automáticamente

**Opción B: Netlify**
1. Sube el código a GitHub
2. Conecta a Netlify
3. Configura las variables de entorno
4. Despliega

**Opción C: Hosting propio**
1. Usa un servidor con Node.js
2. Configura Nginx o Apache como proxy
3. Implementa HTTPS con Let's Encrypt

---

## 📝 Checklist de implementación

- [ ] Crear proyecto en Supabase
- [ ] Ejecutar esquema SQL
- [ ] Configurar autenticación en Supabase
- [ ] Crear proyecto en Google Cloud Console
- [ ] Habilitar Google Classroom API
- [ ] Crear credenciales OAuth 2.0
- [ ] Configurar pantalla de consentimiento
- [ ] Conectar Google OAuth con Supabase
- [ ] Instalar @supabase/supabase-js
- [ ] Implementar sistema de auth en frontend
- [ ] Crear UI de login/registro
- [ ] Migrar datos de localStorage
- [ ] Implementar funciones de Classroom API
- [ ] Rediseñar modal de sesiones con plantillas
- [ ] Probar integración end-to-end
- [ ] Desplegar a producción

---

## 🔧 Troubleshooting

### Error: "Invalid API key"
- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de usar la Anon Key, no la Service Role Key

### Error: "Row level security policy violation"
- Verifica que las políticas RLS estén correctamente configuradas
- Asegúrate de que el usuario esté autenticado

### Error: "Token expired" (Classroom)
- Implementa refresh del token usando el refresh_token
- Guarda el nuevo token en user_settings

### Error: "CORS policy"
- Configura los allowed origins en Google Cloud Console
- Asegúrate de que tu dominio esté en la lista

---

## 📚 Recursos adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Google Classroom API](https://developers.google.com/classroom)
- [OAuth 2.0 para Google](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 🎉 Siguientes pasos

Una vez completada la implementación:

1. **Mejoras UX**: Agregar drag-and-drop para reordenar sesiones
2. **Colaboración**: Permitir compartir cursos entre docentes
3. **Analytics**: Dashboard de progreso y estadísticas
4. **Offline**: Soporte offline con Service Workers
5. **Móvil**: PWA para uso en dispositivos móviles
