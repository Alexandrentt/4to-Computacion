import { supabase } from '../config/supabase.js'

/**
 * Obtener configuración del usuario
 */
export async function getSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is fine for new users
    console.error('Error obteniendo configuración:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Crear o actualizar configuración del usuario
 */
export async function upsertSettings(userId, settingsData) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      school_year: settingsData.year,
      start_date: settingsData.start,
      end_date: settingsData.end,
      block_duration: settingsData.block ? parseInt(settingsData.block) : null,
      schedule_status: settingsData.schedule
    })
    .select()
    .single()

  if (error) {
    console.error('Error guardando configuración:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
