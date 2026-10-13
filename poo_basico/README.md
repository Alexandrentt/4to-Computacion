# Aula Planner v2 - Planificador Docente

Aplicación web para planificar clases, organizar cursos/unidades/temas y sincronizar cursos y tareas con **Google Classroom** mediante autorización OAuth. Funciona con **Vite** y puede guardar datos localmente o sincronizarlos con **Supabase**.

## 🚀 Características

- ✅ **Planificación de sesiones** con objetivo, fecha y duración opcionales
- ✅ **Contenido detallado por clase** en `contenido.html`: explicación, código de ejemplo, práctica guiada, ejercicios, materiales, tarea y criterios de evaluación
- ✅ **Recorrido interactivo del código línea por línea**: selecciona instrucciones, lee qué hacen y avanza/retrocede con preguntas de predicción; el recorrido explica el código sin ejecutar código arbitrario
- ✅ **Secuencia inicial de 29 clases de Python** para Programación I / Laboratorio 1, basada en la lista de reproducción compartida
- ✅ **Gestión de cursos, unidades y temas** curriculares (edición incluida)
- ✅ **Biblioteca de recursos** con enlaces a Drive, OneDrive, YouTube
- ✅ **Integración con Google Classroom API**: autorización OAuth, consulta de cursos, vinculación con cursos locales y publicación de tareas
- ✅ **Exportación/Importación** de datos en JSON para respaldos
- ✅ **Interfaz responsiva** (móvil y escritorio)
- ✅ **Autenticación y sincronización** opcional con Supabase
- ✅ **Funciona sin nube**: si no configuras Supabase, usa solo `localStorage`

## 📦 Requisitos

- Node.js 24.x
- (Opcional) Cuenta de [Supabase](https://supabase.com)

> La aplicación se sirve con Vite; no se abre directamente el `index.html` desde el sistema de archivos.

## 🛠️ Instalación

```bash
npm install
```

## ⚙️ Variables de entorno

Para activar la nube, crea un archivo `.env.local` en la raíz con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-publishable-key
VITE_GOOGLE_CLIENT_ID=tu-cliente-oauth.apps.googleusercontent.com
```

`.env.local` no se versiona (está en `.gitignore`). `VITE_GOOGLE_CLIENT_ID` es el ID público del cliente OAuth web; nunca pongas un `client_secret` en variables `VITE_*` ni en el frontend. En Vercel añade las mismas variables en **Project Settings → Environment Variables** y vuelve a desplegar.

## 🎓 Configurar Google Classroom real

1. Abre [Google Cloud Console](https://console.cloud.google.com/) y crea o selecciona un proyecto.
2. En **APIs & Services → Library**, habilita **Google Classroom API**.
3. Configura **Google Auth Platform** (pantalla de consentimiento). Añade tu cuenta como usuario de prueba mientras la aplicación esté en modo *Testing*.
4. Crea un **OAuth Client ID → Web application**. Añade como **Authorized JavaScript origins** el origen local (por ejemplo `http://localhost:5173`) y el dominio exacto de producción de Vercel. No añadas rutas en este campo.
5. Copia el **Client ID** (no el secreto) a `VITE_GOOGLE_CLIENT_ID` en `.env.local` y en las variables de entorno de Vercel; vuelve a desplegar.
6. En Aula Planner entra en **Configuración → Conectar con Google Classroom** y acepta los permisos solicitados.
7. Vincula cada curso local con el curso real correspondiente. En **Tareas y Classroom**, usa **Publicar** para crear la tarea en el curso seleccionado.

La primera versión solicita permisos para leer los cursos activos y crear/consultar tareas. El acceso OAuth queda en memoria del navegador y se debe autorizar de nuevo tras recargar o cuando expire. Solo se publican tareas cuando pulsas el botón explícitamente. La cuenta debe tener permisos de docente en el curso de Classroom. Si Google muestra un aviso de aplicación no verificada, no intentes eludirlo: completa la configuración y verificación de consentimiento que corresponda al tipo de cuenta.

## ▶️ Uso

```bash
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/
npm run check     # verifica la sintaxis de los módulos JS
```

## 🗄️ Configurar Supabase (opcional)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** y ejecuta `supabase_schema.sql`.
3. En **Authentication > Providers** habilita **Email** (y Google si lo necesitas).
4. Copia el **Project URL** y la **publishable/anon key** en tu `.env.local`.
5. Reinicia el servidor de desarrollo.

Con la sesión iniciada, en **Configuración** puedes elegir explícitamente **Cargar desde la nube** o **Guardar en la nube**; nada se sincroniza ni se sobrescribe sin confirmación.

## 📚 Estructura del proyecto

```
poo_basico/
├── index.html                   # SPA (HTML + estilos)
├── contenido.html               # Editor de contenido detallado por clase
├── src/
│   ├── main.js                  # Punto de entrada y UI
│   ├── classroom/googleClassroom.js # OAuth y Google Classroom API
│   ├── config/supabase.js       # Cliente de Supabase (opcional)
│   ├── auth/auth.js             # Autenticación
│   └── db/cloudSync.js          # Sincronización con Supabase
├── docs/                        # Documentación académica y hoja de ruta
├── supabase_schema.sql          # Esquema de base de datos + RLS
├── class_templates.json         # Plantillas de contenido
├── poo_curriculum*.json         # Currículo POO de referencia
├── vite.config.js
└── package.json
```

## 🔐 Seguridad

- Las credenciales de Supabase se leen de variables de entorno; no hay claves en el código.
- Row Level Security (RLS) activo: cada usuario solo accede a sus propios datos.
- Los datos locales viven en `localStorage` del navegador; usa **Exportar JSON** para respaldarlos.
- La nube requiere sesión iniciada y acciones manuales confirmadas.

## 📝 Pendientes

- [ ] Validar el flujo OAuth en el dominio de producción y probar lectura/publicación con una cuenta docente
- [ ] Pruebas automatizadas y migración a TypeScript
- [ ] Vista imprimible de la planificación
- [ ] Modo offline / PWA

## 📄 Licencia

MIT


## Malla seleccionada: cuatro unidades por curso

Todos los cursos tienen exactamente **4 unidades**:

- **Programación I / Laboratorio 1:** pensamiento algorítmico; fundamentos de Python; control y colecciones; programación modular.
- **Sistemas e Instalación de Software:** computación básica y alfabetización digital; redes, Internet, archivos y datos; sistemas operativos, controladores y almacenamiento; instalación, configuración y virtualización.
- **Mantenimiento y Reparación de Computadoras:** fundamentos de electricidad y seguridad; multímetro, mediciones y circuitos básicos; resistencias y componentes electrónicos; mantenimiento, diagnóstico y reparación de computadoras.
- **Laboratorio 2:** clases y objetos; diseño de objetos; reutilización; proyecto integrador.

La malla se aplica al abrir el planificador y al cargar datos desde Supabase. Las 21 referencias de Computación Básica y las 20 de electricidad/electrónica se registran como sesiones de referencia; los primeros seis videos de Computación Básica quedan marcados como completados según la indicación docente. Las duraciones y títulos proporcionados se conservan en las notas; los enlaces específicos deben agregarse cuando se disponga de ellos y no se generan URL supuestas.


## 🎓 Portal de alumnos (en implementación)

El portal educativo se separa del planificador docente:

- `alumnos.html`: inicio de sesión, registro con correo, inscripción por código de clase, lecciones publicadas y progreso individual.
- `docente-portal.html`: acceso docente, creación de clases vinculadas a los cursos existentes, códigos de inscripción, publicación de lecciones y seguimiento.
- `supabase/migrations/20261013160000_student_portal.sql`: tablas nuevas, funciones de inscripción y políticas RLS para aislar los datos por estudiante y docente.

### Activación segura

1. Configura Supabase Auth con registro por correo y confirmación de correo habilitada.
2. Revisa la migración y el esquema existente antes de ejecutarla en **SQL Editor**. No es una migración automática ni se ha aplicado a producción desde este repositorio.
3. Después de ejecutar la migración, crea la cuenta docente en Supabase Auth y habilítala insertando su UUID en `public.teacher_profiles` desde el SQL Editor administrativo. No habilites esta operación desde el navegador.
4. En el portal docente, inicia sesión con esa cuenta. Crea una clase, genera el código y entrégalo a tus alumnos.
5. Los alumnos crean su propia cuenta, confirman el correo, inician sesión y usan el código para inscribirse.

Los códigos se generan aleatoriamente en el navegador, pero la base de datos almacena únicamente su hash. La función de inscripción valida correo confirmado, vigencia, cupo e intentos. No publiques la migración sin revisar primero las políticas RLS en tu proyecto real. Nunca pongas una clave `service_role` en una variable `VITE_*`.

### Estado y límites de esta primera versión

El portal permite leer lecciones de texto, marcar progreso y ver un resumen por alumno. El editor/laboratorio que ejecute Python en el navegador y la analítica detallada de intentos todavía son pasos posteriores. La puntuación enviada por un navegador no debe usarse como evidencia inviolable en evaluaciones de alto impacto.
