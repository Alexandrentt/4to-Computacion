import { supabase } from '../config/supabase.js'

/**
 * Obtener todos los recursos del usuario
 */
export async function getResources(userId, courseId = null) {
  let query = supabase
    .from('resources')
    .select('*')
    .eq('user_id', userId)

  if (courseId) {
    query = query.eq('course_id', courseId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error obteniendo recursos:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Obtener un recurso por ID
 */
export async function getResourceById(resourceId) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .single()

  if (error) {
    console.error('Error obteniendo recurso:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Crear un nuevo recurso
 */
export async function createResource(resourceData) {
  const { data, error } = await supabase
    .from('resources')
    .insert({
      ...resourceData,
      kind: resourceData.type || 'Otro'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creando recurso:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Actualizar un recurso
 */
export async function updateResource(resourceId, resourceData) {
  const { data, error } = await supabase
    .from('resources')
    .update({
      ...resourceData,
      kind: resourceData.type || resourceData.kind
    })
    .eq('id', resourceId)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando recurso:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Eliminar un recurso
 */
export async function deleteResource(resourceId) {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', resourceId)

  if (error) {
    console.error('Error eliminando recurso:', error)
    return { error }
  }

  return { error: null }
}
