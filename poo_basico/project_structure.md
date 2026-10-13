# Estructura del Proyecto - Aula Planner v2

```
poo_basico/
├── public/
│   ├── index.html              # HTML principal (versión mejorada)
│   ├── favicon.ico
│   └── manifest.json           # Para PWA (opcional)
│
├── src/
│   ├── config/
│   │   └── supabase.js         # Configuración de Supabase
│   │
│   ├── auth/
│   │   └── auth.js             # Funciones de autenticación
│   │
│   ├── api/
│   │   ├── courses.js          # API para cursos
│   │   ├── sessions.js         # API para sesiones
│   │   ├── resources.js        # API para recursos
│   │   ├── tasks.js            # API para tareas
│   │   └── classroom.js        # Integración con Google Classroom
│   │
│   ├── components/
│   │   ├── AuthScreen.js       # Pantalla de login/registro
│   │   ├── Dashboard.js        # Panel principal
│   │   ├── SessionEditor.js    # Editor de sesiones con plantillas
│   │   ├── CourseList.js       # Lista de cursos
│   │   └── TaskList.js         # Lista de tareas
│   │
│   ├── utils/
│   │   ├── templates.js        # Plantillas de contenido
│   │   ├── formatters.js       # Formateo de fechas, textos
│   │   └── validators.js       # Validación de formularios
│   │
│   ├── db/
│   │   └── migration.js        # Migración de localStorage a Supabase
│   │
│   └── main.js                 # Punto de entrada
│
├── styles/
│   └── main.css                # Estilos (extraídos del HTML)
│
├── .env.example                # Ejemplo de variables de entorno
├── .env.local                  # Variables de entorno (no commit)
├── package.json
├── vite.config.js              # Configuración de Vite (o similar)
├── supabase_schema.sql         # Esquema de base de datos
├── class_templates.json        # Plantillas de contenido
├── IMPLEMENTATION_GUIDE.md     # Guía de implementación
└── README.md                   # Documentación del proyecto
```

## Archivos clave

### .env.example
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### package.json
```json
{
  "name": "aula-planner",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      }
    }
  }
})
```
