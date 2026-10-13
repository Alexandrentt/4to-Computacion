import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase no está configurado. La aplicación funcionará solo con almacenamiento local. ' +
    'Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local para activar la nube.'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
