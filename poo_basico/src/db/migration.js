import { supabase } from '../config/supabase.js'
import { getCurrentUser } from '../auth/auth.js'

/**
 * Migrar datos desde localStorage a Supabase
 */
export async function migrateFromLocalStorage() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Debes iniciar sesión para migrar tus datos' }
  }

  const localData = localStorage.getItem('aula-planner-v1')
  if (!localData) {
    return { error: 'No hay datos locales para migrar' }
  }

  try {
    const data = JSON.parse(localData)
    const results = {
      courses: { success: 0, failed: 0 },
      sessions: { success: 0, failed: 0 },
      resources: { success: 0, failed: 0 },
      tasks: { success: 0, failed: 0 }
    }

    // Migrar cursos
    if (data.courses && Array.isArray(data.courses)) {
      for (const course of data.courses) {
        try {
          const { error } = await supabase.from('courses').insert({
            user_id: user.id,
            name: course.name,
            level: course.level,
            area: course.area,
            color: course.color,
            description: course.description
          })

          if (error) {
            console.error('Error migrando curso:', error)
            results.courses.failed++
          } else {
            results.courses.success++
          }
        } catch (e) {
          console.error('Error procesando curso:', e)
          results.courses.failed++
        }
      }
    }

    // Migrar sesiones
    if (data.sessions && Array.isArray(data.sessions)) {
      for (const session of data.sessions) {
        try {
          const { error } = await supabase.from('sessions').insert({
            user_id: user.id,
            course_id: session.courseId,
            title: session.title,
            status: session.status,
            date: session.date,
            duration: session.duration,
            objective: session.objective,
            introduction: session.introduction || '',
            development: session.development || '',
            activities: session.activities,
            closure: session.closure || '',
            evidence: session.evidence,
            material_url: session.materialUrl,
            notes: session.notes
          })

          if (error) {
            console.error('Error migrando sesión:', error)
            results.sessions.failed++
          } else {
            results.sessions.success++
          }
        } catch (e) {
          console.error('Error procesando sesión:', e)
          results.sessions.failed++
        }
      }
    }

    // Migrar recursos
    if (data.resources && Array.isArray(data.resources)) {
      for (const resource of data.resources) {
        try {
          const { error } = await supabase.from('resources').insert({
            user_id: user.id,
            course_id: resource.courseId,
            title: resource.title,
            kind: resource.kind,
            url: resource.url,
            notes: resource.notes
          })

          if (error) {
            console.error('Error migrando recurso:', error)
            results.resources.failed++
          } else {
            results.resources.success++
          }
        } catch (e) {
          console.error('Error procesando recurso:', e)
          results.resources.failed++
        }
      }
    }

    // Migrar tareas
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        try {
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

          if (error) {
            console.error('Error migrando tarea:', error)
            results.tasks.failed++
          } else {
            results.tasks.success++
          }
        } catch (e) {
          console.error('Error procesando tarea:', e)
          results.tasks.failed++
        }
      }
    }

    return { results, error: null }
  } catch (error) {
    console.error('Error en migración:', error)
    return { error: 'Error al procesar los datos locales' }
  }
}

/**
 * Verificar si hay datos locales para migrar
 */
export function hasLocalData() {
  return !!localStorage.getItem('aula-planner-v1')
}

/**
 * Obtener resumen de datos locales
 */
export function getLocalDataSummary() {
  const localData = localStorage.getItem('aula-planner-v1')
  if (!localData) {
    return null
  }

  try {
    const data = JSON.parse(localData)
    return {
      courses: data.courses?.length || 0,
      sessions: data.sessions?.length || 0,
      resources: data.resources?.length || 0,
      tasks: data.tasks?.length || 0
    }
  } catch (error) {
    return null
  }
}
