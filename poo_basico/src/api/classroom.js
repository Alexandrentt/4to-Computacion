import { supabase } from '../config/supabase.js'

/**
 * Obtener token de acceso de Google Classroom desde user_settings
 */
async function getClassroomToken() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!settings || !settings.classroom_access_token) {
    return null
  }

  // Verificar si el token expiró
  if (settings.classroom_token_expires && new Date(settings.classroom_token_expires) < new Date()) {
    // Token expirado, intentar refrescar
    const refreshed = await refreshClassroomToken(settings.classroom_refresh_token)
    if (refreshed) {
      return refreshed
    }
    return null
  }

  return settings.classroom_access_token
}

/**
 * Refrescar token de Classroom usando refresh_token
 */
async function refreshClassroomToken(refreshToken) {
  try {
    // Nota: Esto requiere un backend para hacer el refresh de forma segura
    // Por ahora, vamos a implementar una versión simplificada
    // En producción, esto debería hacerse en un Edge Function de Supabase

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET, // NO usar esto en frontend en producción
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    const data = await response.json()

    if (data.error) {
      console.error('Error refrescando token:', data.error)
      return null
    }

    // Actualizar tokens en user_settings
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('user_settings')
        .update({
          classroom_access_token: data.access_token,
          classroom_refresh_token: data.refresh_token || refreshToken,
          classroom_token_expires: new Date(Date.now() + data.expires_in * 1000).toISOString()
        })
        .eq('user_id', user.id)
    }

    return data.access_token
  } catch (error) {
    console.error('Error refrescando token:', error)
    return null
  }
}

/**
 * Guardar tokens de Classroom en user_settings
 */
export async function saveClassroomTokens(accessToken, refreshToken, expiresIn) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No hay usuario autenticado' }

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      classroom_access_token: accessToken,
      classroom_refresh_token: refreshToken,
      classroom_token_expires: expiresAt
    })

  if (error) {
    console.error('Error guardando tokens:', error)
    return { error }
  }

  return { data, error: null }
}

/**
 * Obtener cursos de Google Classroom
 */
export async function getClassroomCourses() {
  const token = await getClassroomToken()
  if (!token) {
    return { error: 'No hay token de Classroom. Conecta tu cuenta primero.' }
  }

  try {
    const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await response.json()

    if (data.error) {
      console.error('Error de Classroom API:', data.error)
      return { error: data.error.message }
    }

    return { courses: data.courses || [] }
  } catch (error) {
    console.error('Error obteniendo cursos:', error)
    return { error: 'Error de conexión con Classroom' }
  }
}

/**
 * Crear tarea en Google Classroom
 */
export async function createClassroomTask(courseId, taskData) {
  const token = await getClassroomToken()
  if (!token) {
    return { error: 'No hay token de Classroom. Conecta tu cuenta primero.' }
  }

  try {
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      workType: 'ASSIGNMENT',
      state: 'PUBLISHED'
    }

    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate)
      payload.dueDate = {
        year: dueDate.getFullYear(),
        month: dueDate.getMonth() + 1,
        day: dueDate.getDate()
      }
    }

    if (taskData.points) {
      payload.maxPoints = taskData.points
    }

    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    const data = await response.json()

    if (data.error) {
      console.error('Error creando tarea:', data.error)
      return { error: data.error.message }
    }

    return { task: data, error: null }
  } catch (error) {
    console.error('Error creando tarea:', error)
    return { error: 'Error de conexión con Classroom' }
  }
}

/**
 * Obtener tareas de un curso en Classroom
 */
export async function getClassroomTasks(courseId) {
  const token = await getClassroomToken()
  if (!token) {
    return { error: 'No hay token de Classroom' }
  }

  try {
    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const data = await response.json()

    if (data.error) {
      console.error('Error obteniendo tareas:', data.error)
      return { error: data.error.message }
    }

    return { tasks: data.courseWork || [], error: null }
  } catch (error) {
    console.error('Error obteniendo tareas:', error)
    return { error: 'Error de conexión con Classroom' }
  }
}

/**
 * Sincronizar todas las tareas desde Classroom
 */
export async function syncClassroomTasks() {
  const token = await getClassroomToken()
  if (!token) {
    return { error: 'No hay token de Classroom' }
  }

  const coursesResult = await getClassroomCourses()
  if (coursesResult.error) {
    return coursesResult
  }

  const allTasks = []

  for (const course of coursesResult.courses) {
    const tasksResult = await getClassroomTasks(course.id)
    if (tasksResult.error) {
      console.error(`Error en curso ${course.name}:`, tasksResult.error)
      continue
    }

    allTasks.push(...tasksResult.tasks.map(task => ({
      ...task,
      courseName: course.name,
      courseId: course.id
    })))
  }

  return { tasks: allTasks, error: null }
}

/**
 * Verificar conexión con Classroom
 */
export async function checkClassroomConnection() {
  const token = await getClassroomToken()
  return { connected: !!token }
}
