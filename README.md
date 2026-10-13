# Aula — Planificador docente

Aplicación inicial para organizar los cuatro cursos de Computación de 4.º y 5.º Bachillerato.

## Ejecutar
Abre `index.html` en un navegador moderno. No requiere instalación ni dependencias.

## Incluye
- Plan curricular inicial con cuatro unidades por curso.
- Crear y editar sesiones con fecha y duración opcionales.
- Registro de recursos con enlaces externos.
- Registro de tareas, enlaces de Classroom y seguimiento manual.
- Configuración del ciclo lectivo y exportación/importación JSON.
- Diseño adaptable a escritorio y móvil.

## Limitaciones de esta primera iteración
- Los datos quedan en localStorage del navegador y no se sincronizan entre dispositivos.
- No consulta automáticamente Classroom ni recibe calificaciones.
- La edición de cursos cambia metadatos, no el contenido de las unidades/temas.
- La propuesta curricular debe cotejarse con el CNB, programas oficiales y calendario escolar.

## Próxima etapa
Migrar a Next.js + TypeScript + Supabase/PostgreSQL, añadir autenticación y almacenamiento compartido, editar unidades y temas, y validar con pruebas antes de desplegar.
