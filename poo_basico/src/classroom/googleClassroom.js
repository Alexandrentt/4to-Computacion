const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
let accessToken = ''
let expiresAt = 0

export function classroomConfigured() { return Boolean(CLIENT_ID) }
export function classroomConnected() { return Boolean(accessToken && Date.now() < expiresAt) }

export async function connectClassroom() {
  if (!CLIENT_ID) throw new Error('Falta configurar VITE_GOOGLE_CLIENT_ID en Vercel.')
  await new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve()
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = resolve
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'))
    document.head.appendChild(script)
  })
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.students',
      callback: response => {
        if (response.error) return reject(new Error(response.error_description || response.error))
        accessToken = response.access_token
        expiresAt = Date.now() + (Number(response.expires_in || 3600) - 60) * 1000
        resolve(true)
      }
    })
    client.requestAccessToken({ prompt: 'consent' })
  })
}

async function request(path, options = {}) {
  if (!classroomConnected()) throw new Error('La sesión de Google Classroom expiró. Vuelve a conectar.')
  const response = await fetch('https://classroom.googleapis.com/v1' + path, {
    ...options,
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.message || 'Error de Google Classroom: ' + response.status)
  return data
}

export async function listClassroomCourses() {
  const data = await request('/courses?pageSize=100&courseStates=ACTIVE')
  return data.courses || []
}

export async function listCourseWork(courseId) {
  const data = await request('/courses/' + encodeURIComponent(courseId) + '/courseWork?pageSize=100')
  return data.courseWork || []
}

export async function publishClassroomTask(courseId, task) {
  if (!courseId) throw new Error('Vincula primero este curso con Google Classroom en Configuración.')
  const body = { title: String(task.title || 'Tarea').slice(0, 300), description: String(task.description || '').slice(0, 30000), workType: 'ASSIGNMENT', state: 'PUBLISHED' }
  if (task.dueDate) {
    const [year, month, day] = task.dueDate.split('-').map(Number)
    if (year && month && day) body.dueDate = { year, month, day }
  }
  const result = await request('/courses/' + encodeURIComponent(courseId) + '/courseWork', { method: 'POST', body: JSON.stringify(body) })
  return { id: result.id, url: result.alternateLink, title: result.title }
}
