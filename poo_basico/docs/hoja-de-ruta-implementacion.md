# Hoja de ruta de implementación — Aula

## Estado de la primera iteración

La aplicación se sirve con Vite (`npm run dev`) y por defecto persiste los datos en `localStorage` del navegador; borrar los datos del navegador o cambiar de dispositivo puede dejar la planificación inaccesible, así que conviene exportar respaldos JSON. La sincronización con Supabase ya está implementada, pero es opcional y manual: se activa configurando `.env.local` e iniciando sesión.

## Decisiones ya acordadas

- Programación I se identifica también como Laboratorio 1.
- Los cuatro cursos iniciales son Programación I / Laboratorio 1 y Sistemas e Instalación de Software (4.º), Mantenimiento y Reparación de Computadoras y Laboratorio 2 (5.º).
- La fecha y duración de una sesión son opcionales hasta confirmar el horario.
- Classroom en la primera versión es manual: se pega el enlace y se actualiza el estado; no se simula una integración API.
- El contenido curricular es una propuesta inicial, pendiente de cotejo con el CNB, programas oficiales y el calendario real.

## Próximas etapas

### Etapa 1 — Mejorar el planificador local

Completar la plantilla de sesión con objetivo observable, activación, explicación/modelado, práctica guiada, práctica autónoma, cierre, materiales, evidencia, criterios, tarea y fecha de entrega. Mantener campos opcionales cuando el horario o la actividad aún no estén definidos. Añadir edición real de unidades y temas, y una vista imprimible de la planificación.

### Etapa 2 — Robustez y seguridad de datos

Validar los datos al importar JSON, mostrar errores comprensibles, evitar reemplazar datos por un archivo inválido y ofrecer confirmación antes de acciones destructivas. Probar crear, editar, eliminar, filtrar, exportar e importar registros, incluyendo sesiones sin fecha y duración. Añadir un identificador de versión al formato de respaldo antes de cambiar el esquema.

### Etapa 3 — Separar presentación y datos

Migrar gradualmente a TypeScript y componentes reutilizables, manteniendo primero las funciones existentes. Definir modelos explícitos para cursos, unidades, temas, sesiones, recursos y tareas. No migrar todo de una vez sin pruebas de paridad ni una estrategia de recuperación.

### Etapa 4 — Persistencia compartida

Cuando se requiera sincronización entre dispositivos, incorporar autenticación y PostgreSQL/Supabase con políticas de acceso por usuario. Diseñar permisos antes de guardar información docente en la nube. No incluir claves secretas en el cliente ni asumir que la base de datos ya está conectada.

### Etapa 5 — Despliegue e integraciones

Desplegar una versión de prueba y verificar el uso en móvil y escritorio. Mantener Classroom manual hasta definir credenciales, permisos, alcance y viabilidad de una integración oficial. Los enlaces externos no equivalen a sincronización.

## Criterio de aceptación de cada entrega

Cada cambio debe preservar los datos existentes, respetar el horario configurable, ser utilizable con teclado y móvil, y declarar explícitamente qué se probó y qué falta probar. El currículo y el calendario no se considerarán oficiales hasta contrastarlos con fuentes del establecimiento.
