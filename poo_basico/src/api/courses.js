import { supabase } from '../config/supabase.js'

/**
 * Obtener todos los cursos del usuario
 */
export async function getCourses(userId) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      units (
        id,
        name,
        order_index,
        topics (
          id,
          title,
          order_index,
          is_completed
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error obteniendo cursos:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Obtener un curso por ID
 */
export async function getCourseById(courseId) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (error) {
    console.error('Error obteniendo curso:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Crear un nuevo curso
 */
export async function createCourse(courseData) {
  const { data, error } = await supabase
    .from('courses')
    .insert(courseData)
    .select()
    .single()

  if (error) {
    console.error('Error creando curso:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Actualizar un curso
 */
export async function updateCourse(courseId, courseData) {
  const { data, error } = await supabase
    .from('courses')
    .update(courseData)
    .eq('id', courseId)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando curso:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Eliminar un curso
 */
export async function deleteCourse(courseId) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    console.error('Error eliminando curso:', error)
    return { error }
  }

  return { error: null }
}

/**
 * Crear una unidad
 */
export async function createUnit(unitData) {
  const { data, error } = await supabase
    .from('units')
    .insert(unitData)
    .select()
    .single()

  if (error) {
    console.error('Error creando unidad:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Crear un tema
 */
export async function createTopic(topicData) {
  const { data, error } = await supabase
    .from('topics')
    .insert(topicData)
    .select()
    .single()

  if (error) {
    console.error('Error creando tema:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Actualizar estado de un tema
 */
export async function updateTopicStatus(topicId, isCompleted) {
  const { data, error } = await supabase
    .from('topics')
    .update({ is_completed: isCompleted })
    .eq('id', topicId)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando tema:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
