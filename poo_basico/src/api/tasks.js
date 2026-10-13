import { supabase } from '../config/supabase.js'

/**
 * Obtener todas las tareas del usuario
 */
export async function getTasks(userId, courseId = null) {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)

  if (courseId) {
    query = query.eq('course_id', courseId)
  }

  const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error obteniendo tareas:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Obtener una tarea por ID
 */
export async function getTaskById(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) {
    console.error('Error obteniendo tarea:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Crear una nueva tarea
 */
export async function createTask(taskData) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) {
    console.error('Error creando tarea:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Actualizar una tarea
 */
export async function updateTask(taskId, taskData) {
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error('Error actualizando tarea:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Eliminar una tarea
 */
export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error eliminando tarea:', error)
    return { error }
  }

  return { error: null }
}
