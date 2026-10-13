import { supabase } from '../config/supabase.js'

/**
 * Registro de usuario con email y contraseña
 */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })

  if (error) {
    console.error('Error en registro:', error)
    return { data: null, error }
  }

  // Crear registro en tabla users
  if (data.user) {
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      })

    if (userError) {
      console.error('Error creando usuario:', userError)
    }
  }

  return { data, error: null }
}

/**
 * Inicio de sesión con email y contraseña
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Error en login:', error)
  }

  return { data, error }
}

/**
 * Inicio de sesión con Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })

  if (error) {
    console.error('Error en login con Google:', error)
  }

  return { data, error }
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error al cerrar sesión:', error)
  }

  return { error }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }

  return user
}

/**
 * Escuchar cambios de autenticación
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

/**
 * Restablecer contraseña
 */
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })

  if (error) {
    console.error('Error restableciendo contraseña:', error)
  }

  return { data, error }
}

/**
 * Actualizar contraseña
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Error actualizando contraseña:', error)
  }

  return { data, error }
}
