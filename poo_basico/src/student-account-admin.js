import { supabase } from './config/supabase.js'

const $ = selector => document.querySelector(selector)
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]))

function notify(message, type = '') {
  const el = $('#notice')
  el.textContent = message
  el.className = 'notice ' + type
  el.classList.remove('hidden')
}

$('#provisionStudentsBtn')?.addEventListener('click', async () => {
  if (!supabase) return notify('Supabase no está configurado.', 'error')
  const button = $('#provisionStudentsBtn')
  const resultRoot = $('#accountResults')
  if (!confirm('Se crearán las cuentas que falten y se inscribirá a los siete alumnos en ambas clases. Las contraseñas iniciales solo se mostrarán en esta pantalla. ¿Continuar?')) return
  button.disabled = true
  button.textContent = 'Creando cuentas e inscripciones…'
  resultRoot.classList.add('hidden')
  try {
    const { data, error } = await supabase.functions.invoke('provision-students', { body: {} })
    if (error) {
      let detail = error.message || 'No se pudo ejecutar la provisión.'
      try {
        const context = error.context
        if (context?.json) {
          const body = await context.json()
          if (body?.error) detail = body.error + (body.detail ? ': ' + body.detail : '')
        }
      } catch {}
      throw new Error(detail)
    }
    if (!data?.ok) throw new Error(data?.error || 'El servidor no confirmó la operación.')
    const accounts = Array.isArray(data.accounts) ? data.accounts : []
    const ready = accounts.filter(a => a.status === 'ready')
    resultRoot.innerHTML = '<h3>Resultado de la provisión</h3><p>Clases asignadas: <strong>Laboratorio 2</strong> y <strong>Mantenimiento y Reparación</strong>.</p>' +
      (ready.length ? '<p class="warning">Guarda ahora esta lista de contraseñas. Por seguridad no se volverán a mostrar después de cerrar o actualizar la página.</p>' : '') +
      '<div style="overflow-x:auto"><table class="credentials"><thead><tr><th>Alumno</th><th>Usuario</th><th>Contraseña inicial</th><th>Estado</th></tr></thead><tbody>' +
      accounts.map(a => '<tr><td>' + escapeHtml(a.name) + '</td><td>' + escapeHtml(a.username) + '</td><td>' + (a.password ? '<code>' + escapeHtml(a.password) + '</code>' : '—') + '</td><td>' + (a.status === 'ready' ? 'Creada / inscrito' : a.status === 'already_exists' ? 'Ya existía; contraseña no mostrada' : escapeHtml(a.status)) + '</td></tr>').join('') +
      '</tbody></table></div>' +
      (ready.length ? '<p><button id="copyStudentCredentials" class="btn" type="button">Copiar usuarios y contraseñas</button></p>' : '') +
      '<p class="muted">Inicio de sesión: <a href="./alumnos.html">portal de alumnos</a>. Si un alumno ya tenía una cuenta, no se cambia su contraseña automáticamente.</p>'
    resultRoot.classList.remove('hidden')
    $('#copyStudentCredentials')?.addEventListener('click', async () => {
      const lines = ['Alumno\tUsuario\tContraseña inicial']
      for (const a of ready) lines.push([a.name, a.username, a.password].join('\t'))
      try {
        await navigator.clipboard.writeText(lines.join('\n'))
        notify('Credenciales copiadas. Guárdalas en un lugar privado y entrega cada una a su alumno.', 'success')
      } catch {
        notify('No se pudo copiar automáticamente. Selecciona y copia la tabla manualmente.', 'error')
      }
    })
    notify('Operación terminada. Revisa los estados de los siete alumnos.', 'success')
    button.textContent = 'Volver a comprobar / completar inscripciones'
  } catch (error) {
    console.error(error)
    notify(error.message || 'No se pudieron crear las cuentas.', 'error')
    button.textContent = 'Reintentar creación e inscripción'
  } finally {
    button.disabled = false
  }
})
