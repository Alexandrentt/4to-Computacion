# Integración del Curriculum de POO con el Planificador Aula

Este documento explica cómo integrar el contenido del curso de Programación Orientada a Objetos con el planificador Aula.

## 📚 Estructura del Curriculum

El curriculum está dividido en 4 unidades, cada una con 5 temas:

### Unidad 1: Clases y Objetos
- Tema 1: Repaso de funciones y módulos
- Tema 2: Clases y Objetos
- Tema 3: Atributos y Métodos
- Tema 4: Constructores e Inicialización
- Tema 5: Estado y Comportamiento

### Unidad 2: Diseño de Objetos
- Tema 1: Encapsulación y Control de Acceso
- Tema 2: Propiedades y Validación de Estado
- Tema 3: Composición de Objetos
- Tema 4: Relaciones entre Clases
- Tema 5: Responsabilidades y Cohesión

### Unidad 3: Reutilización y Pruebas
- Tema 1: Herencia y Especialización
- Tema 2: Polimorfismo y Sobrescritura
- Tema 3: Métodos Especiales
- Tema 4: Organización del Proyecto
- Tema 5: Pruebas y Depuración

### Unidad 4: Proyecto Integrador
- Tema 1: Requisitos y Diseño del Proyecto
- Tema 2: Diagrama de Clases Sencillo
- Tema 3: Implementación Incremental
- Tema 4: Validación y Pruebas
- Tema 5: Documentación y Presentación

## 📊 Distribución de Puntos por Unidad

Cada unidad tiene una distribución de 100 puntos:

| Componente | Puntos | Porcentaje |
|------------|--------|------------|
| Actitudinal | 5 | 5% |
| Parcial | 15 | 15% |
| Examen Final | 30 | 30% |
| Tareas y Actividades | 50 | 50% |
| **Total** | **100** | **100%** |

### Criterios Actitudinal (5 puntos)
- Participación activa en clase
- Trabajo colaborativo en grupo
- Puntualidad y entrega de tareas
- Calidad del código y documentación

### Parcial (15 puntos)
- Evaluación intermedia de la unidad
- Mezcla de teoría y práctica
- Problemas de código y análisis

### Examen Final (30 puntos)
- Evaluación integral de la unidad
- Proyecto o problema complejo
- Aplicación de todos los conceptos

### Tareas y Actividades (50 puntos)
- Tareas individuales (varían por unidad)
- Actividades en clase
- Ejercicios prácticos
- Proyectos parciales

## 🎯 Cargar el Curriculum en el Planificador

### Opción 1: Importación Manual

1. **Crear el curso en el planificador**
   - Nombre: Laboratorio 2 - Programación Orientada a Objetos
   - Nivel: 5.º Bachillerato
   - Área: Programación orientada a objetos
   - Descripción: (del curriculum)

2. **Crear las 4 unidades**
   - Usar los nombres de las unidades del curriculum
   - Agregar los objetivos de cada unidad

3. **Crear los temas dentro de cada unidad**
   - Cada unidad tiene 5 temas
   - Copiar el nombre y orden del curriculum

4. **Crear sesiones para cada tema**
   - Cada tema dura 90 minutos (1.5 horas)
   - Usar la plantilla de sesión con:
     - Objetivo (del curriculum)
     - Introducción (del curriculum)
     - Desarrollo (del curriculum)
     - Actividades (del curriculum)
     - Ejercicios (del curriculum)
     - Tarea (del curriculum)

### Opción 2: Importación Automática (Requiere Backend)

Si tienes el backend de Supabase configurado, puedes importar el curriculum automáticamente:

```python
import json
from src.api.courses import createCourse, createUnit, createTopic
from src.api.sessions import createSession

# Cargar curriculum
with open('poo_curriculum.json', 'r') as f:
    curriculum = json.load(f)

# Crear curso
course_data = {
    'user_id': user_id,
    'name': curriculum['course']['name'],
    'level': curriculum['course']['level'],
    'area': curriculum['course']['area'],
    'color': 'blue',
    'description': curriculum['course']['description']
}
course = createCourse(course_data)

# Crear unidades y temas
for unit in curriculum['course']['units']:
    unit_data = {
        'course_id': course['id'],
        'name': unit['name'],
        'order_index': unit['order']
    }
    unit_obj = createUnit(unit_data)
    
    for topic in unit['topics']:
        topic_data = {
            'unit_id': unit_obj['id'],
            'title': topic['name'],
            'order_index': topic['order']
        }
        createTopic(topic_data)
        
        # Crear sesión para el tema
        session_data = {
            'user_id': user_id,
            'course_id': course['id'],
            'title': topic['name'],
            'objective': '; '.join(topic['content']['key_concepts']),
            'introduction': topic['content']['introduction'],
            'development': topic['content']['development'],
            'activities': '\n'.join([a['description'] for a in topic['activities']]),
            'duration': topic['duration_minutes']
        }
        createSession(session_data)
```

## 📝 Estructura de una Sesión Típica

Cada sesión de 90 minutos sigue esta estructura:

### 1. Objetivo de Aprendizaje (5 min)
- Presentar los objetivos del tema
- Conectar con conocimientos previos

### 2. Introducción (10 min)
- Activación del conocimiento previo
- Presentación del problema motivador
- Explicación de relevancia del tema

### 3. Desarrollo del Contenido (30 min)
- Explicación teórica
- Conceptos clave
- Ejemplos de código en vivo
- Demostraciones prácticas

### 4. Actividades Prácticas (30 min)
- Práctica guiada (15 min)
- Práctica individual (15 min)
- Trabajo en grupos según el tema

### 5. Cierre (10 min)
- Resumen de lo aprendido
- Preguntas de reflexión
- Anuncio de la tarea
- Anticipación del próximo tema

### 6. Evidencia de Aprendizaje
- Entregable de la actividad
- Ejercicio resuelto
- Código funcional

## 📚 Archivos del Curriculum

El curriculum está distribuido en 3 archivos JSON:

1. **poo_curriculum.json** - Unidad 1 completa
   - Unidad 1: Clases y Objetos
   - 5 temas con contenido detallado
   - Ejemplos de código Python
   - Actividades y ejercicios
   - Tareas con distribución de puntos

2. **poo_curriculum_extended.json** - Unidad 2
   - Unidad 2: Diseño de Objetos
   - 5 temas con contenido detallado
   - Ejemplos de código Python
   - Actividades y ejercicios
   - Tareas con distribución de puntos

3. **poo_curriculum_units3_4.json** - Unidades 3 y 4
   - Unidad 3: Reutilización y Pruebas
   - Unidad 4: Proyecto Integrador
   - 10 temas en total (5 por unidad)
   - Ejemplos de código Python
   - Actividades y ejercicios
   - Tareas con distribución de puntos

## 🔗 Relación con el Planificador

### Sesiones
Cada tema del curriculum corresponde a una sesión en el planificador:
- **Título**: Nombre del tema
- **Objetivo**: Conceptos clave del tema
- **Introducción**: Introducción del curriculum
- **Desarrollo**: Desarrollo del curriculum
- **Actividades**: Actividades del curriculum
- **Cierre**: Resumen y tarea
- **Duración**: 90 minutos

### Tareas
Cada tema tiene una tarea que se registra en el planificador:
- **Título**: Tarea X del tema
- **Descripción**: Descripción detallada
- **Fecha de entrega**: 3-7 días después
- **Puntos**: Según distribución
- **Estado**: Pendiente -> Publicada -> En revisión -> Revisada

### Recursos
Cada tema puede tener recursos asociados:
- **Enlaces a documentación**: Python docs, tutoriales
- **Videos**: YouTube, cursos
- **Ejemplos de código**: Repositorios GitHub
- **Herramientas**: IDEs, debuggers

## 📈 Seguimiento del Progreso

### Por Estudiante
- Sesiones asistidas
- Tareas entregadas
- Calificaciones obtenidas
- Progreso por unidad

### Por Clase
- Temas completados
- Promedio de calificaciones
- Tareas pendientes
- Estadísticas de participación

### Por Unidad
- Progreso de la unidad
- Distribución de puntos aplicada
- Evaluaciones programadas
- Resultados de evaluaciones

## 🎯 Uso del Planificador para Gestión

### Planificación Semanal
1. Revisar temas de la semana
2. Preparar sesiones con contenido del curriculum
3. Agregar recursos adicionales
4. Programar evaluaciones

### Gestión de Tareas
1. Crear tarea en Classroom
2. Registrar en el planificador
3. Monitorear entregas
4. Actualizar estado de seguimiento

### Evaluaciones
1. Programar parcial (fecha y contenido)
2. Programar examen final
3. Registrar calificaciones
4. Generar reportes

## 📊 Reportes y Análisis

### Reporte de Progreso del Estudiante
- Sesiones completadas: X/20
- Tareas entregadas: X/20
- Calificación actual: XX/100
- Próximas evaluaciones: [lista]

### Reporte de la Clase
- Promedio de calificaciones: XX
- Tareas pendientes: X
- Sesiones por impartir: X
- Distribución de puntos aplicada

### Reporte de la Unidad
- Progreso: XX%
- Evaluaciones realizadas: X/2
- Calificación promedio: XX
- Próximos pasos: [lista]

## 🔧 Personalización del Curriculum

El curriculum puede personalizarse según:

### Nivel de los Estudiantes
- Ajustar complejidad de ejercicios
- Modificar número de ejemplos
- Adaptar tiempos de actividades

### Recursos Disponibles
- Agregar más recursos teóricos
- Incluir videos adicionales
- Proveer más ejemplos de código

### Intereses de los Estudiantes
- Adaptar ejemplos a sus intereses
- Usar casos de estudio relevantes
- Incluir proyectos específicos

## 📱 Integración con Google Classroom

### Publicar Tareas
1. Crear tarea en el planificador
2. Sincronizar con Classroom
3. Establecer fecha de entrega
4. Monitorear entregas

### Sincronizar Calificaciones
1. Calificar en Classroom
2. Actualizar estado en planificador
3. Registrar calificación
4. Generar reporte

### Compartir Recursos
1. Agregar enlace de recurso en planificador
2. Adjuntar en Classroom
3. Acceso para estudiantes
4. Monitoreo de uso

## 🎓 Best Practices

### Para el Docente
1. **Preparar con anticipación**: Revisar el contenido antes de cada sesión
2. **Adaptar al grupo**: Ajustar según el nivel y ritmo de la clase
3. **Usar ejemplos reales**: Conectar con situaciones del mundo real
4. **Fomentar participación**: Incluir actividades interactivas
5. **Dar feedback oportuno**: Revisar tareas rápidamente

### Para los Estudiantes
1. **Revisar antes de clase**: Leer introducción y conceptos clave
2. **Participar activamente**: En actividades y discusiones
3. **Practicar código**: Resolver todos los ejercicios
4. **Entregar a tiempo**: Cumplir con fechas de tareas
5. **Pedir ayuda**: Cuando tengan dudas

### Para el Proyecto
1. **Planificar bien**: Definir requisitos y diseño claro
2. **Implementar incrementalmente: Fase por fase
3. **Probar continuamente**: Escribir pruebas desde el inicio
4. **Documentar todo**: Código, decisiones, problemas
5. **Presentar con orgullo**: Mostrar el trabajo realizado

## 📞 Soporte

Para dudas sobre:
- **Contenido del curriculum**: Revisar los archivos JSON
- **Uso del planificador**: Consultar IMPLEMENTATION_GUIDE.md
- **Integración técnica**: Ver documentación de Supabase y Classroom API
- **Personalización**: Adaptar según necesidades específicas

## 🔄 Actualización del Curriculum

El curriculum puede actualizarse:
- Agregando nuevos ejemplos
- Modificando ejercicios
- Ajustando distribución de puntos
- Incluyendo nuevos recursos
- Adapitando a nuevas tecnologías

Para actualizar:
1. Modificar el archivo JSON correspondiente
2. Sincronizar con el planificador
3. Notificar cambios a estudiantes
4. Ajustar sesiones futuras

---

**Nota**: Este curriculum es un punto de partida. Adáptalo según las necesidades específicas de tu grupo, recursos disponibles, y objetivos de aprendizaje particulares.
