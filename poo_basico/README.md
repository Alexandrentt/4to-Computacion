# Aula Planner v2 - Planificador Docente Profesional

Sistema de planificación docente con contenido estructurado para cada clase. Disponible en dos modos: **Standalone** (sin instalación) y **Completo** (con sincronización en la nube).

## 🚀 Características

- ✅ **Planificación de sesiones** con plantillas estructuradas (objetivo, introducción, desarrollo, actividades, cierre, evaluación)
- ✅ **Gestión de cursos, unidades y temas** curriculares
- ✅ **Biblioteca de recursos** con enlaces a Drive, OneDrive, YouTube
- ✅ **Seguimiento de tareas** con estado manual y enlace a Classroom
- ✅ **Exportación/Importación** de datos en JSON para respaldos
- ✅ **Interfaz responsiva** que funciona en móvil y escritorio
- 🔄 **Sincronización en la nube** (modo completo, pendiente de implementación)
- 🔐 **Autenticación con Supabase** (modo completo, pendiente de implementación)

## 📦 Modos de uso

### Modo 1: Standalone (Recomendado para empezar)

**Sin instalación** - Solo abre el archivo HTML en tu navegador.

**Uso:**
1. Descarga o clona el repositorio
2. Abre `index.html` directamente en tu navegador (doble clic)
3. Los datos se guardan en `localStorage` del navegador
4. Exporta respaldos JSON regularmente para no perder datos

**Ventajas:**
- No requiere instalación
- Funciona offline
- Datos privados (se quedan en tu navegador)

**Limitaciones:**
- Los datos no se sincronizan entre dispositivos
- Si borras los datos del navegador, pierdes la planificación
- No hay autenticación multi-usuario

### Modo 2: Completo (Con sincronización en la nube)

**Requiere Node.js y configuración** - Para sincronización entre dispositivos.

**Instalación:**
```bash
git clone <repository-url>
cd poo_basico
npm install
```

**Configuración:**
1. Copia `.env.example` a `.env.local`
2. Configura las credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

3. Ejecuta el esquema de base de datos en Supabase:
   - Crea un proyecto en [supabase.com](https://supabase.com)
   - Ve al SQL Editor y ejecuta `supabase_schema.sql`
   - Configura autenticación (Email y Google OAuth)

**Ejecutar:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

**Construir para producción:**
```bash
npm run build
```

Los archivos de producción estarán en la carpeta `dist/`

## 📚 Estructura del proyecto

```
poo_basico/
├── index.html                   # Aplicación standalone (modo simple)
├── src/                         # Código para modo completo
│   ├── config/                  # Configuración de Supabase
│   ├── auth/                    # Funciones de autenticación
│   ├── api/                     # API functions (cursos, sesiones, classroom)
│   ├── db/                      # Migración de datos
│   └── main.js                  # Punto de entrada (versión con Supabase)
├── docs/                        # Documentación académica
│   ├── plan-academico.md        # Plan académico preliminar
│   └── hoja-de-ruta-implementacion.md  # Hoja de ruta de desarrollo
├── supabase_schema.sql          # Esquema de base de datos (modo completo)
├── class_templates.json         # Plantillas de contenido
├── IMPLEMENTATION_GUIDE.md     # Guía detallada de implementación
├── CURRICULUM_INTEGRATION.md   # Guía de integración del curriculum POO
├── poo_curriculum.json          # Unidad 1: Clases y Objetos
├── poo_curriculum_extended.json # Unidad 2: Diseño de Objetos
├── poo_curriculum_units3_4.json # Unidades 3 y 4
├── poo_curriculum_complete.json # Resumen del curriculum completo
├── import_curriculum.py         # Script para importar curriculum
├── vite.config.js              # Configuración de Vite
├── package.json                # Dependencias del proyecto
└── .env.example                # Ejemplo de variables de entorno
```

## 🔐 Seguridad

**Modo Standalone:**
- Los datos se guardan en `localStorage` del navegador
- No hay autenticación ni sincronización
- Los datos son privados (se quedan en tu dispositivo)
- Exporta respaldos JSON regularmente

**Modo Completo:**
- Las credenciales de Supabase se gestionan con variables de entorno
- Row Level Security (RLS) activado en todas las tablas
- Los usuarios solo pueden acceder a sus propios datos
- Tokens de Classroom almacenados de forma segura

## 📖 Guía de implementación completa

Para una guía paso a paso detallada, consulta [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## 🔄 Migración de datos

**Modo Standalone:**
- Exporta tus datos regularmente desde Configuración > Respaldo de datos
- Importa archivos JSON para restaurar respaldos
- Los datos no se sincronizan entre dispositivos

**Modo Completo:**
- La sincronización es automática cuando se implementa Supabase
- Los datos persisten en la nube
- Se puede acceder desde múltiples dispositivos con autenticación

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

**Modo Standalone:**
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Persistencia**: localStorage del navegador

**Modo Completo:**
- **Frontend**: HTML, CSS, JavaScript (Vanilla) + Vite
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **API**: Google Classroom API (pendiente)
- **Build**: Vite

## 📝 Próximas mejoras

- [ ] **Completar modo completo**: Implementar autenticación con Supabase
- [ ] **Sincronización en la nube**: Migrar datos de localStorage a Supabase
- [ ] **Integración Classroom API**: Crear tareas automáticamente
- [ ] **Dashboard de estadísticas**: Progreso y métricas de planificación
- [ ] **Modo offline**: Service Workers para usar sin internet
- [ ] **PWA**: Instalable en dispositivos móviles
- [ ] **Colaboración**: Compartir planificaciones entre docentes
- [ ] **Exportación PDF**: Generar planificaciones en PDF
- [ ] **Integración calendario**: Sincronizar con Google Calendar
