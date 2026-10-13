# Aula Planner v2 - Planificador Docente Profesional

Sistema de planificación docente con integración real con Google Classroom, sincronización en la nube y contenido estructurado para cada clase.

## 🚀 Características

- ✅ **Autenticación segura** con Supabase (email/password y Google OAuth)
- ✅ **Sincronización entre dispositivos** mediante base de datos en la nube
- ✅ **Integración completa con Google Classroom** (crear tareas, sincronizar entregas)
- ✅ **Plantillas estructuradas** para el contenido de clases (objetivo, introducción, desarrollo, actividades, cierre, evaluación)
- ✅ **Gestión de cursos, unidades y temas** curriculares
- ✅ **Biblioteca de recursos** con enlaces a Drive, OneDrive, YouTube
- ✅ **Seguimiento de tareas** con estado manual y enlace a Classroom
- ✅ **Migración de datos** desde localStorage a Supabase

## 📋 Requisitos

- Node.js 18+ 
- Cuenta de Supabase
- Cuenta de Google (para Google Cloud Console)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd poo_basico
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al SQL Editor y ejecuta el archivo `supabase_schema.sql`
3. Configura la autenticación en Supabase:
   - Habilita Email
   - Habilita Google OAuth (necesitarás Client ID y Secret de Google Cloud)

### 5. Configurar Google Cloud Console

1. Crea un proyecto en [console.cloud.google.com](https://console.cloud.google.com)
2. Habilita la API de Google Classroom
3. Crea credenciales OAuth 2.0 (Web application)
4. Configura la pantalla de consentimiento con los scopes necesarios
5. Regresa a Supabase y pega el Client ID y Client Secret

## 🎯 Iniciar desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Construir para producción

```bash
npm run build
```

Los archivos de producción estarán en la carpeta `dist/`

## 📚 Estructura del proyecto

```
poo_basico/
├── public/                      # Archivos estáticos
├── src/
│   ├── config/                  # Configuración de Supabase
│   ├── auth/                    # Funciones de autenticación
│   ├── api/                     # API functions (cursos, sesiones, classroom)
│   ├── db/                      # Migración de datos
│   └── main.js                  # Punto de entrada
├── supabase_schema.sql          # Esquema de base de datos
├── class_templates.json         # Plantillas de contenido
├── IMPLEMENTATION_GUIDE.md     # Guía detallada de implementación
├── CURRICULUM_INTEGRATION.md   # Guía de integración del curriculum POO
├── poo_curriculum.json          # Unidad 1: Clases y Objetos
├── poo_curriculum_extended.json # Unidad 2: Diseño de Objetos
├── poo_curriculum_units3_4.json # Unidades 3 y 4
├── poo_curriculum_complete.json # Resumen del curriculum completo
└── import_curriculum.py         # Script para importar curriculum
```

## 🔐 Seguridad

- Las credenciales de Supabase se gestionan con variables de entorno
- Row Level Security (RLS) activado en todas las tablas
- Los usuarios solo pueden acceder a sus propios datos
- Tokens de Classroom almacenados de forma segura

## 📖 Guía de implementación completa

Para una guía paso a paso detallada, consulta [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## 🔄 Migración desde localStorage

Si tienes datos en la versión anterior (localStorage):

1. Inicia sesión en la nueva versión
2. Ve a Configuración > Datos y respaldo
3. Haz clic en "Migrar datos locales"
4. Verifica que todos los datos se hayan transferido correctamente

## 🤝 Contribución

Este es un proyecto educativo. Las contribuciones son bienvenidas.

## 📄 Licencia

MIT

## 🆘 Soporte

Para problemas o preguntas:
- Revisa la [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- Verifica la consola del navegador para errores
- Asegúrate de que las credenciales de Supabase sean correctas

## 🎨 Tecnologías

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **API**: Google Classroom API
- **Build**: Vite

## 📝 Próximas mejoras

- [ ] Dashboard de estadísticas y progreso
- [ ] Modo offline con Service Workers
- [ ] PWA para dispositivos móviles
- [ ] Colaboración entre docentes
- [ ] Exportación a PDF de planificaciones
- [ ] Integración con calendario (Google Calendar)
