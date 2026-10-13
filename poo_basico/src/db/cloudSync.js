import { supabase } from '../config/supabase.js'

const isUuid = value =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const clean = value => value === '' || value === undefined ? null : value

function fromCloudStatus(status) {
  return ({ Lista: 'Preparada', Impartida: 'Completada', Reprogramar: 'Borrador' })[status] || status || 'Borrador'
}
function toCloudStatus(status) {
  return ({ Preparada: 'Lista', Completada: 'Impartida' })[status] || (['Borrador', 'Lista', 'Impartida', 'Reprogramar'].includes(status) ? status : 'Borrador')
}

async function must(query, label) {
  const { data, error } = await query
  if (error) throw new Error(label + ': ' + error.message)
  return data
}

export async function loadPlannerFromCloud(userId, currentDb) {
  if (!userId) throw new Error('Debes iniciar sesión.')

  const [settingsRows, coursesRows, sessionsRows, resourcesRows, tasksRows] = await Promise.all([
    must(supabase.from('user_settings').select('*').eq('user_id', userId), 'Configuración'),
    must(supabase.from('courses').select('*, units(*, topics(*))').eq('user_id', userId).order('created_at'), 'Cursos'),
    must(supabase.from('sessions').select('*').eq('user_id', userId).order('date', { ascending: true, nullsFirst: false }), 'Sesiones'),
    must(supabase.from('resources').select('*').eq('user_id', userId).order('created_at', { ascending: false }), 'Recursos'),
    must(supabase.from('tasks').select('*').eq('user_id', userId).order('due_date', { ascending: true, nullsFirst: false }), 'Tareas')
  ])

  const settings = settingsRows[0]
  const courses = coursesRows.length ? coursesRows.map(course => ({
    id: course.id,
    name: course.name,
    grade: course.level || '',
    color: course.color || 'blue',
    desc: course.description || '',
    units: (course.units || []).sort((a,b) => a.order_index-b.order_index).map(unit => [
      unit.name,
      (unit.topics || []).sort((a,b) => a.order_index-b.order_index).map(topic => topic.title)
    ])
  })) : currentDb.courses

  return {
    ...currentDb,
    courses,
    sessions: sessionsRows.map(s => ({
      id: s.id, title: s.title, courseId: s.course_id,
      objective: s.objective || '', date: s.date || '', duration: s.duration || '',
      status: fromCloudStatus(s.status), introduction: s.introduction || '',
      development: s.development || '', activities: s.activities || '',
      closure: s.closure || '', evidence: s.evidence || '',
      materialUrl: s.material_url || '', notes: s.notes || ''
    })),
    resources: resourcesRows.map(r => ({
      id: r.id, title: r.title, courseId: r.course_id || '',
      type: r.kind || 'Otro', url: r.url || '', notes: r.notes || ''
    })),
    tasks: tasksRows.map(t => ({
      id: t.id, title: t.title, courseId: t.course_id || '',
      description: t.description || '', dueDate: t.due_date || '',
      points: t.points ?? '', status: t.status || 'Pendiente',
      url: t.classroom_url || '', instructions: t.instructions || ''
    })),
    settings: {
      year: settings?.school_year || '',
      start: settings?.start_date || '',
      end: settings?.end_date || '',
      block: settings?.block_duration || '',
      schedule: settings?.schedule_status || 'Pendiente de confirmar'
    }
  }
}

export async function savePlannerToCloud(userId, db) {
  if (!userId) throw new Error('Debes iniciar sesión.')

  const report = { courses: 0, units: 0, topics: 0, sessions: 0, resources: 0, tasks: 0, skippedResources: 0 }
  const remoteCourses = await must(supabase.from('courses').select('*, units(*, topics(*))').eq('user_id', userId), 'Leer cursos')
  const courseIds = new Map()
  const remoteCourseByName = new Map(remoteCourses.map(c => [c.name, c]))

  for (const course of db.courses || []) {
    let remote = remoteCourseByName.get(course.name)
    const knownUnits = remote?.units || []
    const payload = {
      user_id: userId, name: course.name, level: course.grade || null,
      color: course.color || 'blue', description: course.desc || null, is_active: true
    }
    if (remote) {
      remote = { ...await must(supabase.from('courses').update(payload).eq('id', remote.id).select().single(), 'Actualizar curso'), units: knownUnits }
    } else {
      remote = await must(supabase.from('courses').insert(payload).select().single(), 'Crear curso')
      remoteCourseByName.set(course.name, { ...remote, units: [] })
    }
    courseIds.set(String(course.id), remote.id)
    course.id = remote.id
    report.courses++

    const remoteUnits = remote.units || []
    for (let i = 0; i < (course.units || []).length; i++) {
      const unitDef = course.units[i]
      const unitName = Array.isArray(unitDef) ? unitDef[0] : unitDef.name
      const topics = Array.isArray(unitDef) ? (unitDef[1] || []) : (unitDef.topics || [])
      let unit = remoteUnits.find(u => u.name === unitName)
      if (!unit) {
        unit = await must(supabase.from('units').insert({ course_id: remote.id, name: unitName, order_index: i }).select().single(), 'Crear unidad')
        remoteUnits.push({ ...unit, topics: [] })
      } else if (unit.order_index !== i) {
        await must(supabase.from('units').update({ order_index: i }).eq('id', unit.id), 'Ordenar unidad')
      }
      report.units++
      const existingTopics = unit.topics || []
      for (let j = 0; j < topics.length; j++) {
        const topicTitle = typeof topics[j] === 'string' ? topics[j] : topics[j].title
        const existingTopic = existingTopics.find(t => t.title === topicTitle)
        if (!existingTopic) {
          const inserted = await must(supabase.from('topics').insert({ unit_id: unit.id, title: topicTitle, order_index: j }).select().single(), 'Crear tema')
          existingTopics.push(inserted)
        } else if (existingTopic.order_index !== j) {
          await must(supabase.from('topics').update({ order_index: j }).eq('id', existingTopic.id), 'Ordenar tema')
        }
        report.topics++
      }
    }
  }

  const mappedCourse = id => courseIds.get(String(id)) || (isUuid(id) ? id : null)
  const remoteSessions = await must(supabase.from('sessions').select('*').eq('user_id', userId), 'Leer sesiones')
  for (const item of db.sessions || []) {
    const courseId = mappedCourse(item.courseId)
    const payload = {
      user_id: userId, course_id: courseId, title: item.title || 'Sesión sin título',
      status: toCloudStatus(item.status), date: clean(item.date), duration: item.duration ? Number(item.duration) : null,
      objective: clean(item.objective), introduction: clean(item.introduction), development: clean(item.development),
      activities: clean(item.activities), closure: clean(item.closure), evidence: clean(item.evidence),
      material_url: clean(item.materialUrl), notes: clean(item.notes)
    }
    const match = (isUuid(item.id) && remoteSessions.find(x => x.id === item.id)) ||
      remoteSessions.find(x => x.title === payload.title && x.course_id === courseId && x.date === payload.date)
    if (match) await must(supabase.from('sessions').update(payload).eq('id', match.id), 'Actualizar sesión')
    else await must(supabase.from('sessions').insert(payload), 'Crear sesión')
    report.sessions++
  }

  const remoteResources = await must(supabase.from('resources').select('*').eq('user_id', userId), 'Leer recursos')
  for (const item of db.resources || []) {
    if (!item.url || !String(item.url).trim()) { report.skippedResources++; continue }
    const courseId = mappedCourse(item.courseId)
    const payload = { user_id: userId, course_id: courseId, title: item.title || 'Recurso sin título',
      kind: item.type || item.kind || 'Otro', url: String(item.url).trim(), notes: clean(item.notes) }
    const match = (isUuid(item.id) && remoteResources.find(x => x.id === item.id)) ||
      remoteResources.find(x => x.title === payload.title && x.url === payload.url && x.course_id === courseId)
    if (match) await must(supabase.from('resources').update(payload).eq('id', match.id), 'Actualizar recurso')
    else await must(supabase.from('resources').insert(payload), 'Crear recurso')
    report.resources++
  }

  const remoteTasks = await must(supabase.from('tasks').select('*').eq('user_id', userId), 'Leer tareas')
  for (const item of db.tasks || []) {
    const courseId = mappedCourse(item.courseId)
    const payload = { user_id: userId, course_id: courseId, title: item.title || 'Tarea sin título',
      description: clean(item.description), due_date: clean(item.dueDate), points: item.points === '' || item.points == null ? null : Number(item.points),
      status: ['Pendiente','Publicada','En revisión','Revisada'].includes(item.status) ? item.status : 'Pendiente',
      classroom_url: clean(item.url), instructions: clean(item.instructions) }
    const match = (isUuid(item.id) && remoteTasks.find(x => x.id === item.id)) ||
      remoteTasks.find(x => x.title === payload.title && x.course_id === courseId && x.due_date === payload.due_date)
    if (match) await must(supabase.from('tasks').update(payload).eq('id', match.id), 'Actualizar tarea')
    else await must(supabase.from('tasks').insert(payload), 'Crear tarea')
    report.tasks++
  }

  const { error: settingsError } = await supabase.from('user_settings').upsert({
    user_id: userId, school_year: clean(db.settings?.year), start_date: clean(db.settings?.start),
    end_date: clean(db.settings?.end), block_duration: db.settings?.block ? Number(db.settings.block) : null,
    schedule_status: db.settings?.schedule === 'Confirmado' ? 'Confirmado' : 'Pendiente de confirmar'
  }, { onConflict: 'user_id' })
  if (settingsError) throw new Error('Guardar configuración: ' + settingsError.message)

  return report
}
