import { supabase } from './config/supabase.js'

const $ = s => document.querySelector(s)
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
let mode = 'login', user = null, classes = [], progress = new Map()

function say(message, type = '') {
  const el = $('#notice')
  el.textContent = message
  el.className = 'notice' + (type ? ' ' + type : '')
  el.classList.remove('hidden')
}
function clearSay() { $('#notice').classList.add('hidden') }
function setMode(next) {
  mode = next
  $('#loginTab').classList.toggle('active', mode === 'login')
  $('#registerTab').classList.toggle('active', mode === 'register')
  $('#nameField').classList.toggle('hidden', mode !== 'register')
  $('#fullName').required = mode === 'register'
  $('#authSubmit').textContent = mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'
}
function signedIn(u) {
  user = u
  $('#authPanel').classList.add('hidden')
  $('#studentArea').classList.remove('hidden')
  $('#logoutBtn').classList.remove('hidden')
  $('#userLabel').textContent = u.email || 'Sesión activa'
  clearSay()
  loadClasses()
}
function signedOut() {
  user = null; classes = []; progress = new Map()
  $('#authPanel').classList.remove('hidden')
  $('#studentArea').classList.add('hidden')
  $('#logoutBtn').classList.add('hidden')
  $('#userLabel').textContent = ''
}
function lessonHtml(content) {
  if (typeof content === 'string') return content.split('\n').map(t => '<p>' + esc(t) + '</p>').join('')
  const blocks = Array.isArray(content?.blocks) ? content.blocks : []
  if (blocks.length) return blocks.map(b => {
    if (b.type === 'code') return '<div class="content-block"><pre>' + esc(b.code || b.text || '') + '</pre></div>'
    if (b.type === 'heading') return '<div class="content-block"><h3>' + esc(b.text || '') + '</h3></div>'
    if (b.type === 'list' && Array.isArray(b.items)) return '<div class="content-block"><ul>' + b.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul></div>'
    return '<div class="content-block"><p>' + esc(b.text || '') + '</p></div>'
  }).join('')
  if (typeof content?.text === 'string') return content.text.split('\n').map(t => '<p>' + esc(t) + '</p>').join('')
  return '<p class="muted">Esta lección todavía no tiene contenido organizado.</p>'
}
function statusFor(id) { return progress.get(id)?.status || 'not_started' }
function renderClasses() {
  const root = $('#classList')
  if (!classes.length) {
    root.innerHTML = '<div class="empty">Aún no tienes clases. Usa el código que te dio tu docente.</div>'
    return
  }
  root.innerHTML = classes.map(c => {
    const done = c.lessons.filter(l => statusFor(l.id) === 'completed').length
    return '<article class="class-item"><strong>' + esc(c.name) + '</strong><small class="muted">' + c.lessons.length + ' lecciones · ' + done + ' completadas</small>' +
      (c.lessons.length ? c.lessons.map(l => '<button type="button" class="lesson ' + (statusFor(l.id) === 'completed' ? 'done' : '') + '" data-lesson="' + esc(l.id) + '"><strong>' + esc(l.title) + '</strong><small>' + esc(l.summary || 'Lección') + '</small></button>').join('') : '<p class="muted">Tu docente aún no publicó lecciones.</p>') + '</article>'
  }).join('')
  document.querySelectorAll('[data-lesson]').forEach(b => b.addEventListener('click', () => openLesson(b.dataset.lesson)))
}
async function loadClasses() {
  if (!supabase || !user) return
  $('#classList').innerHTML = '<div class="empty">Cargando tus clases…</div>'
  try {
    const { data: ms, error: me } = await supabase.from('class_memberships').select('class_id').eq('student_id', user.id).eq('status', 'active')
    if (me) throw me
    const ids = (ms || []).map(m => m.class_id)
    if (!ids.length) { classes = []; progress = new Map(); renderClasses(); return }
    const results = await Promise.all([
      supabase.from('learning_classes').select('id,name,course_id').in('id', ids).order('name'),
      supabase.from('learning_lessons').select('id,class_id,title,summary,content,order_index').in('class_id', ids).eq('is_published', true).order('order_index'),
      supabase.from('lesson_progress').select('lesson_id,status,last_position,started_at,completed_at,updated_at').eq('student_id', user.id)
    ])
    for (const result of results) if (result.error) throw result.error
    const [cr, lr, pr] = results.map(x => x.data || [])
    progress = new Map(pr.map(p => [p.lesson_id, p]))
    classes = cr.map(c => ({...c, lessons: lr.filter(l => l.class_id === c.id)}))
    renderClasses()
  } catch (e) {
    console.error(e)
    say('No se pudieron cargar las clases. Es posible que falte aplicar la migración del portal.', 'error')
    $('#classList').innerHTML = '<div class="empty">No fue posible cargar tus clases.</div>'
  }
}
function openLesson(id) {
  const l = classes.flatMap(c => c.lessons).find(x => x.id === id)
  if (!l) return
  $('#lessonArea').innerHTML = '<div class="eyebrow">Lección</div><h2>' + esc(l.title) + '</h2>' +
    (l.summary ? '<p class="muted">' + esc(l.summary) + '</p>' : '') +
    '<div class="content-block">' + lessonHtml(l.content) + '</div>' +
    '<div class="notice">Tu avance se guarda en tu cuenta.</div><div class="btnrow"><button id="progressBtn" class="btn">Marcar en progreso</button><button id="doneBtn" class="btn primary">' + (statusFor(id) === 'completed' ? 'Completada ✓' : 'Marcar completada') + '</button></div>'
  $('#progressBtn').onclick = () => saveProgress(l, 'in_progress')
  $('#doneBtn').onclick = () => saveProgress(l, 'completed')
}
async function saveProgress(l, status) {
  const old = progress.get(l.id), now = new Date().toISOString()
  const row = {lesson_id:l.id, student_id:user.id, status, last_position:old?.last_position || 0, started_at:old?.started_at || now, completed_at:status === 'completed' ? now : null, updated_at:now}
  try {
    const {data, error} = await supabase.from('lesson_progress').upsert(row, {onConflict:'lesson_id,student_id'}).select().single()
    if (error) throw error
    progress.set(l.id, data); renderClasses(); openLesson(l.id)
    say(status === 'completed' ? '¡Bien hecho! Lección completada.' : 'Progreso guardado.', 'success')
  } catch (e) { console.error(e); say('No se pudo guardar el progreso. Revisa las políticas de Supabase.', 'error') }
}

$('#loginTab').onclick = () => setMode('login')
$('#registerTab').onclick = () => setMode('register')
$('#authForm').onsubmit = async e => {
  e.preventDefault(); clearSay()
  if (!supabase) { say('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.', 'error'); return }
  const email = $('#email').value.trim(), password = $('#password').value, fullName = $('#fullName').value.trim()
  if (mode === 'register' && fullName.length < 2) { say('Escribe tu nombre completo.', 'error'); return }
  if (password.length < 8) { say('La contraseña debe tener al menos 8 caracteres.', 'error'); return }
  const btn = $('#authSubmit'); btn.disabled = true
  try {
    if (mode === 'register') {
      const {data, error} = await supabase.auth.signUp({email, password, options:{data:{full_name:fullName}}})
      if (error) throw error
      if (!data.session) say('Cuenta creada. Confirma tu correo y luego inicia sesión para ingresar el código de clase.', 'success')
      else { signedIn(data.user); say('Cuenta creada. Ingresa el código que te dio tu docente.', 'success') }
    } else {
      const {data, error} = await supabase.auth.signInWithPassword({email,password})
      if (error) throw error
      signedIn(data.user); say('Sesión iniciada.', 'success')
    }
  } catch (err) { say(err.message || 'No se pudo autenticar.', 'error') }
  finally { btn.disabled = false }
}
$('#joinForm').onsubmit = async e => {
  e.preventDefault(); clearSay()
  if (!user) return say('Inicia sesión primero.', 'error')
  const btn = $('#joinBtn'); btn.disabled = true
  try {
    const {data, error} = await supabase.rpc('join_class_with_code', {p_code:$('#classCode').value.trim()})
    if (error) throw error
    if (!data?.ok) throw new Error(data?.message || 'No se pudo usar el código.')
    $('#classCode').value = ''; await loadClasses(); say('Te inscribiste correctamente.', 'success')
  } catch (err) { say(err.message || 'No se pudo usar el código.', 'error') }
  finally { btn.disabled = false }
}
$('#logoutBtn').onclick = async () => { if (supabase) await supabase.auth.signOut(); signedOut() }
if (!supabase) say('Supabase no está configurado. El portal necesita las variables de entorno públicas.', 'error')
else {
  supabase.auth.getSession().then(({data}) => { if (data.session?.user) signedIn(data.session.user) })
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) signedIn(session.user)
    if (event === 'SIGNED_OUT') signedOut()
  })
}
