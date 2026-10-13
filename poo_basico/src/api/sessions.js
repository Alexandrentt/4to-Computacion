import { supabase } from '../config/supabase.js'

/**
 * Obtener todas las sesiones del usuario
 */
export async function getSessions(userId, courseId = null) {
  let query = supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)

  if (courseId) {
    query = query.eq('course_id', courseId)
  }

  const { data, error } = await query.order('date', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error obteniendo sesiones:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Obtener una sesión por ID
 */
export async function getSessionById(sessionId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error obteniendo sesión:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Crear una nueva sesión
 */
export async function createSession(sessionData) {
  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single()

  if (error) {
    console.error('Error creando sesión:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Actualizar una sesión
 */
export async function updateSession(sessionId, sessionData) {
  const { data, error } = await supabase
    .from('sessions')
    .update(sessionData)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando sesión:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Eliminar una sesión
 */
export async function deleteSession(sessionId) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    console.error('Error eliminando sesión:', error)
    return { error }
  }

  return { error: null }
}

/**
 * Obtener sesiones próximas (las 5 más cercanas)
 */
export async function getUpcomingSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error obteniendo sesiones próximas:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
