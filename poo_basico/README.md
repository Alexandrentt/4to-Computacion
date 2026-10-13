# Aula Planner v2 - Planificador Docente

Aplicación web para planificar clases, organizar cursos/unidades/temas, guardar recursos y hacer seguimiento manual de tareas de Classroom. Funciona con **Vite** y puede usarse solo con almacenamiento local o sincronizar en la nube con **Supabase**.

## 🚀 Características

- ✅ **Planificación de sesiones** con objetivo, fecha y duración opcionales
- ✅ **Contenido detallado por clase** en `contenido.html`: explicación, código de ejemplo, práctica guiada, ejercicios, materiales, tarea y criterios de evaluación
- ✅ **Secuencia inicial de 29 clases de Python** para Programación I / Laboratorio 1, basada en la lista de reproducción compartida
- ✅ **Gestión de cursos, unidades y temas** curriculares (edición incluida)
- ✅ **Biblioteca de recursos** con enlaces a Drive, OneDrive, YouTube
- ✅ **Seguimiento de tareas** con estado manual y enlace a Classroom
- ✅ **Exportación/Importación** de datos en JSON para respaldos
- ✅ **Interfaz responsiva** (móvil y escritorio)
- ✅ **Autenticación y sincronización** opcional con Supabase
- ✅ **Funciona sin nube**: si no configuras Supabase, usa solo `localStorage`

## 📦 Requisitos

- Node.js 18 o superior
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
```

`.env.local` no se versiona (está en `.gitignore`). Si no existe o está vacío, la aplicación arranca en **modo local**: todo se guarda en `localStorage` y la sección de nube queda desactivada.

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

- [ ] Integración real con Classroom API (hoy es manual)
- [ ] Pruebas automatizadas y migración a TypeScript
- [ ] Vista imprimible de la planificación
- [ ] Modo offline / PWA

## 📄 Licencia

MIT


## Malla seleccionada

- **Sistemas e Instalación de Software:** computación básica y alfabetización digital, redes e Internet, sistemas operativos y arranque, controladores, particiones, sistemas de archivos, dual boot, formatos digitales, instalación y máquinas virtuales.
- **Mantenimiento y Reparación de Computadoras:** fundamentos de electricidad, Ley de Ohm, uso del multímetro, circuitos, resistencias y componentes, seguridad ESD, diagnóstico y reparación de equipos.
- La malla se aplica al abrir el planificador y al cargar datos desde Supabase. Las 21 referencias de Computación Básica y las 20 de electricidad/electrónica se registran como sesiones de referencia; los primeros seis videos de Computación Básica quedan marcados como completados según la indicación docente.
- Las duraciones y títulos proporcionados se conservan en las notas de cada sesión. Los enlaces específicos de estas listas deben agregarse cuando se disponga de ellos; no se generan enlaces supuestos.
