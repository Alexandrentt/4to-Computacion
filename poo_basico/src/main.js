import { getCurrentUser, onAuthStateChange, signOut, signIn, signUp } from './auth/auth.js'
import { loadPlannerFromCloud, savePlannerToCloud } from './db/cloudSync.js'
import { applySelectedCurriculum } from './selected-curriculum.js'
import { isSupabaseConfigured } from './config/supabase.js'

// Datos iniciales de cursos
const starterCourses = [
  {
    id: "prog",
    name: "Programación I / Laboratorio 1",
    grade: "4.º Bachillerato",
    color: "blue",
    desc: "De algoritmos y PSeInt a Python estructurado y modular.",
    units: [
      ["Unidad 1 · Pensamiento algorítmico", ["Pensamiento computacional y resolución de problemas", "Entradas, procesos y salidas", "Algoritmos y pseudocódigo", "Diagramas de flujo", "Uso de PSeInt", "Variables y operaciones en pseudocódigo", "Práctica integradora de lógica"]],
      ["Unidad 2 · Fundamentos de Python", ["Preparación del entorno Python", "Primer programa, print y comentarios", "Variables, tipos y conversiones", "Operadores aritméticos, relacionales y lógicos", "Entrada de datos", "Condicionales simples y múltiples", "Problemas de decisión en Python y PSeInt"]],
      ["Unidad 3 · Control y colecciones", ["Ciclo while", "Ciclo for y rangos", "Contadores, acumuladores y validación", "Cadenas de texto", "Listas y recorridos", "Listas anidadas y matrices", "Reto con ciclos y colecciones"]],
      ["Unidad 4 · Programación modular", ["Descomposición en funciones", "Parámetros y retorno", "Alcance de variables", "Módulos e importaciones", "Validación y errores", "Archivos de texto según el ritmo", "Proyecto estructurado y documentado"]]
    ]
  },
  {
    id: "sistemas",
    name: "Sistemas e Instalación de Software",
    grade: "4.º Bachillerato",
    color: "green",
    desc: "Instalación, configuración y recuperación segura de sistemas.",
    units: [
      ["Unidad 1 · Fundamentos y preparación", ["Hardware, firmware y software", "Sistemas operativos y licencias", "BIOS/UEFI y arranque", "Particiones y sistemas de archivos", "Requisitos y compatibilidad", "Medios de instalación", "Lista de comprobación previa"]],
      ["Unidad 2 · Instalación de sistemas", ["Respaldos y autorización", "Instalación en máquina virtual o equipo de práctica", "Particionado y riesgos", "Configuración inicial", "Instalación limpia frente a actualización", "Verificación del arranque", "Informe de instalación"]],
      ["Unidad 3 · Configuración", ["Controladores", "Actualizaciones", "Instalación de aplicaciones", "Usuarios, grupos y permisos", "Licencias y software legítimo", "Configuración básica de red", "Herramientas de diagnóstico"]],
      ["Unidad 4 · Recuperación", ["Copias de seguridad", "Restauración de archivos", "Recuperación del sistema", "Máquinas virtuales y snapshots", "Errores frecuentes de arranque", "Bitácora de recuperación", "Informe técnico final"]]
    ]
  },
  {
    id: "mantenimiento",
    name: "Mantenimiento y Reparación de Computadoras",
    grade: "5.º Bachillerato",
    color: "amber",
    desc: "Prevención, diagnóstico sistemático y reparación documentada.",
    units: [
      ["Unidad 1 · Seguridad y componentes", ["Seguridad del taller y registro del equipo", "Electricidad estática y ESD", "Herramientas y organización", "Placa base, CPU, RAM y discos", "Fuente de poder y refrigeración", "Inspección visual", "Rutina preventiva"]],
      ["Unidad 2 · Diagnóstico", ["Síntoma, hipótesis, prueba y resultado", "Equipo no enciende", "POST e indicadores de error", "Memoria RAM y almacenamiento", "Temperatura y ventilación", "Software frente a hardware", "Árbol de diagnóstico"]],
      ["Unidad 3 · Mantenimiento correctivo", ["Limpieza interna segura", "Montaje y desmontaje supervisado", "Compatibilidad de componentes", "Sustitución de piezas", "Pruebas posteriores", "Inventario y repuestos", "Evaluación práctica"]],
      ["Unidad 4 · Casos integrales", ["Árbol de decisión para averías", "Caso de equipo que no arranca", "Caso de lentitud o temperatura", "Estimación de costos", "Informe técnico", "Recepción y entrega simulada", "Caso final documentado"]]
    ]
  },
  {
    id: "lab2",
    name: "Laboratorio 2",
    grade: "5.º Bachillerato",
    color: "blue",
    desc: "Diseño de software con clases, objetos y relaciones.",
    units: [
      ["Unidad 1 · Clases y objetos", ["Repaso de funciones y módulos", "Clases y objetos", "Atributos y métodos", "Constructores", "Estado y comportamiento", "Modelado de entidades", "Práctica de objetos"]],
      ["Unidad 2 · Diseño de objetos", ["Encapsulación", "Validación del estado", "Composición", "Relaciones entre clases", "Responsabilidades y cohesión", "Modelo de dominio", "Implementación y pruebas"]],
      ["Unidad 3 · Reutilización", ["Herencia y especialización", "Sobrescritura de métodos", "Polimorfismo", "Composición frente a herencia", "Organización por archivos", "Pruebas y depuración", "Ejercicio integrador"]],
      ["Unidad 4 · Proyecto integrador", ["Problema y requisitos", "Diseño de clases", "Implementación incremental", "Validación de entradas", "Pruebas normales y límites", "Documentación técnica", "Demostración y retrospectiva"]]
    ]
  }
]

// Estado de la aplicación
let currentUser = null
let isRegistering = false
let db = {
  courses: starterCourses,
  sessions: [],
  resources: [],
  tasks: [],
  settings: {
    year: "",
    start: "",
    end: "",
    block: "",
    schedule: "Pendiente de confirmar"
  }
}
let page = "home"
let editing = null
let kind = null
let filterCourse = "all"

// Utilidades
const $ = s => document.querySelector(s)
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]))

function msg(t) {
  $("#toast").textContent = t
  $("#toast").classList.add("show")
  setTimeout(() => $("#toast").classList.remove("show"), 2200)
}

function cname(id) {
  return db.courses.find(c => c.id === id)?.name || "Curso no asignado"
}

function datefmt(d) {
  return d ? new Date(d + "T12:00:00").toLocaleDateString("es-GT", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "Sin fecha"
}

function courseOptions(id) {
  return db.courses.map(c => `<option value="${c.id}" ${c.id === id ? 'selected' : ''}>${esc(c.name)}</option>`).join("")
}

function unitsToText(units) {
  return (units || []).map(u => Array.isArray(u)
    ? `${u[0]} | ${(u[1] || []).join("; ")}`
    : `${u.name || ""} | ${(u.topics || []).join("; ")}`
  ).join("\n")
}

function textToUnits(text) {
  return String(text || "").split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const [name, topicsPart] = line.split("|")
    const topics = String(topicsPart || "").split(";").map(t => t.trim()).filter(Boolean)
    return [String(name || "").trim(), topics]
  })
}

// Navegación
function setPage(p) {
  page = p
  document.querySelectorAll("[data-page]").forEach(b => b.classList.toggle("active", b.dataset.page === p))
  let names = {
    home: "Resumen",
    courses: "Plan de estudios",
    sessions: "Sesiones",
    resources: "Recursos",
    tasks: "Tareas y Classroom",
    settings: "Configuración"
  }
  $("#crumb").textContent = names[p]
  $("#topTitle").textContent = names[p]
  render()
}

function head(eyebrow, title, sub, button = "") {
  return `<div class="head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><div class="sub">${sub}</div></div>${button}</div>`
}

// Renderizado
function render() {
  let v = $("#view")
  if (page === "home") v.innerHTML = home()
  if (page === "courses") v.innerHTML = coursesPage()
  if (page === "sessions") v.innerHTML = tablePage("sessions")
  if (page === "resources") v.innerHTML = tablePage("resources")
  if (page === "tasks") v.innerHTML = tablePage("tasks")
  if (page === "settings") v.innerHTML = settingsPage()
  bind()
}

function home() {
  return head("Ciclo lectivo · " + esc(db.settings.year || "Por configurar"), "Tu planificación, en un solo lugar.", "Organiza los cuatro cursos, prepara sesiones, guarda recursos y registra el seguimiento de Classroom.", '<button class="btn primary" data-new="sessions">＋ Planificar sesión</button>') +
    `<div class="stats"><div class="stat"><small>Cursos activos</small><strong>${db.courses.length}</strong><small>4.º y 5.º Bachillerato</small></div><div class="stat"><small>Sesiones</small><strong>${db.sessions.length}</strong><small>${db.sessions.filter(x => x.date).length} con fecha</small></div><div class="stat"><small>Recursos</small><strong>${db.resources.length}</strong><small>Enlaces externos</small></div><div class="stat"><small>Tareas</small><strong>${db.tasks.length}</strong><small>${db.tasks.filter(x => x.status === "Revisada").length} revisadas</small></div></div>` +
    `<div class="columns"><section class="panel"><div class="panel-head"><h2>Tus cursos</h2><button class="btn small" data-page="courses">Ver plan →</button></div><div class="grid-courses">${db.courses.map(c => `<div class="course" data-course="${c.id}"><span class="tag ${c.color}">${esc(c.grade)}</span><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><span class="tag">${c.units.length} unidades · ${db.sessions.filter(s => s.courseId === c.id).length} sesiones</span></div>`).join("")}</div></section><section><div class="panel"><div class="panel-head"><h2>Horario y ciclo</h2><span class="tag amber">${esc(db.settings.schedule)}</span></div><div class="notice warn">No se asignan fechas ni duración fija hasta confirmar el horario del establecimiento.</div><div class="list"><div class="listrow"><div>01</div><div><strong>Finales de enero</strong><small>Inicio previsto</small></div></div><div class="listrow"><div>04</div><div><strong>Cuatro unidades por curso</strong><small>Secuencia curricular inicial</small></div></div><div class="listrow"><div>10</div><div><strong>Mediados de octubre</strong><small>Cierre previsto, sujeto al calendario</small></div></div></div></div><div class="panel"><h2>Flujo de trabajo</h2><p class="sub">Planifica aquí → enlaza materiales → publica en Classroom → registra el estado manualmente.</p><p class="sub">Los archivos siguen en Drive o OneDrive; no se duplican.</p></div></section></div>`
}

function coursesPage() {
  return head("Estructura curricular", "Plan de estudios", "Propuesta editable de cuatro unidades por curso; las fechas se asignarán después de confirmar el calendario.") +
    `<div class="notice">Plan inicial de referencia. Debe cotejarse con el programa oficial, el CNB y las indicaciones del centro educativo.</div>` +
    db.courses.map(c => `<section class="panel"><div class="panel-head"><div><span class="tag ${c.color}">${esc(c.grade)}</span><h2 style="margin-top:8px">${esc(c.name)}</h2><p class="sub">${esc(c.desc)}</p></div><button class="btn small" data-edit-course="${c.id}">Editar curso</button></div>${c.units.map((u, i) => `<details class="unit" ${i === 0 ? 'open' : ''}><summary>${esc(u[0])} · ${u[1].length} temas</summary><div class="unitbody">${u[1].map((t, j) => `<div class="topic">${esc(t)}<small>Unidad ${i + 1} · tema ${j + 1}</small></div>`).join("")}</div></details>`).join("")}</section>`).join("")
}

function tablePage(k) {
  let conf = {
    sessions: { title: "Sesiones", sub: "Fecha y duración opcionales; cada clase puede prepararse antes de confirmar el horario.", button: "＋ Nueva sesión" },
    resources: { title: "Recursos", sub: "Guarda enlaces de Drive, OneDrive, YouTube y documentos externos.", button: "＋ Añadir recurso" },
    tasks: { title: "Tareas y Classroom", sub: "Classroom gestiona entregas y notas oficiales; aquí llevas un seguimiento manual.", button: "＋ Registrar tarea" }
  }[k]
  let rows = db[k].filter(x => filterCourse === "all" || x.courseId === filterCourse)
  let body = rows.length ? rows.map(x => {
    if (k === "sessions") return `<tr><td><strong>${esc(x.title)}</strong><small>${esc(x.objective || "Sin objetivo")}</small></td><td>${esc(cname(x.courseId))}</td><td>${datefmt(x.date)}<small>${x.duration ? esc(x.duration) + " min" : "Duración pendiente"}</small></td><td><span class="tag">${esc(x.status || "Borrador")}</span></td><td><button class="btn small" data-edit="${k}:${x.id}">Editar</button></td></tr>`
    if (k === "resources") return `<tr><td><strong>${esc(x.title)}</strong><small>${esc(x.notes || "")}</small></td><td>${esc(cname(x.courseId))}</td><td>${esc(x.type || "Otro")}</td><td>${x.url ? `<a target="_blank" rel="noreferrer" href="${esc(x.url)}">Abrir ↗</a>` : "—"}</td><td><button class="btn small" data-edit="${k}:${x.id}">Editar</button></td></tr>`
    return `<tr><td><strong>${esc(x.title)}</strong><small>${esc(x.description || "")}</small></td><td>${esc(cname(x.courseId))}</td><td>${datefmt(x.dueDate)}</td><td><select class="cell-select" data-status="${x.id}">${["Pendiente", "Publicada", "En revisión", "Revisada"].map(s => `<option ${s === (x.status || "Pendiente") ? 'selected' : ''}>${s}</option>`).join("")}</select></td><td>${x.url ? `<a target="_blank" rel="noreferrer" href="${esc(x.url)}">Classroom ↗</a>` : "Sin enlace"}</td><td><button class="btn small" data-edit="${k}:${x.id}">Editar</button></td></tr>`
  }).join("") : `<tr><td colspan="6"><div class="empty">Todavía no hay registros. Crea el primero con el botón de arriba.</div></td></tr>`
  return head(conf.title, conf.title, conf.sub, `<button class="btn primary" data-new="${k}">${conf.button}</button>`) +
    `<div class="filterbar"><select id="courseFilter"><option value="all">Todos los cursos</option>${db.courses.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select><input id="search" placeholder="Buscar..."></div>` +
    `<table><thead><tr><th>Título</th><th>Curso</th><th>${k === "sessions" ? "Fecha" : k === "resources" ? "Tipo" : "Fecha entrega"}</th><th>${k === "sessions" ? "Estado" : k === "resources" ? "Enlace" : "Estado"}</th><th>${k === "tasks" ? "Classroom" : k === "resources" ? "Enlace" : ""}</th><th>Acciones</th></tr></thead><tbody id="rows">${body}</tbody></table>`
}

function settingsPage() {
  return head("Preferencias", "Configuración", "Define el ciclo y la duración solo cuando tengas confirmación del centro.") +
    `<div class="columns"><section class="panel"><h2>Calendario lectivo</h2><div class="field"><label>Año o ciclo</label><input id="year" value="${esc(db.settings.year)}" placeholder="Ej. 2027"></div><div class="formgrid"><div class="field"><label>Inicio previsto</label><input id="start" type="date" value="${esc(db.settings.start)}"></div><div class="field"><label>Cierre previsto</label><input id="end" type="date" value="${esc(db.settings.end)}"></div></div><div class="field"><label>Duración del bloque (minutos, opcional)</label><input id="block" type="number" min="1" value="${esc(db.settings.block)}" placeholder="Dejar vacío hasta confirmar"></div><div class="field"><label>Estado del horario</label><select id="schedule"><option>Pendiente de confirmar</option><option ${db.settings.schedule === "Confirmado" ? 'selected' : ''}>Confirmado</option></select></div><button class="btn primary" id="saveSettings">Guardar configuración</button></section><section class="panel"><h2>Usuario</h2>${!isSupabaseConfigured ? '<div class="notice warn">La nube está desactivada. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en <code>.env.local</code> y reinicia para activar la sincronización.</div>' : currentUser ? `<p class="sub">Autenticado como: ${esc(currentUser.email)}</p><button class="btn danger" id="logout">Cerrar sesión</button><button class="btn" id="syncFromCloud">⇩ Cargar desde la nube</button><button class="btn" id="syncToCloud">⇧ Guardar en la nube</button>` : '<p class="sub">No autenticado: los datos se guardan solo en este navegador.</p><button class="btn primary" id="login">Iniciar sesión</button>'}</section><section class="panel"><h2>Respaldo de datos</h2><div class="notice warn">${currentUser ? "Los datos se sincronizan con Supabase cuando estás autenticado." : "Los datos de esta versión se guardan en el navegador actual. No se sincronizan todavía entre dispositivos."}</div><button class="btn" id="export2">⇩ Exportar JSON</button> <button class="btn" id="import2">⇧ Importar JSON</button></section></div>`
}

// Event binding
function bind() {
  document.querySelectorAll("[data-page]").forEach(b => b.onclick = () => setPage(b.dataset.page))
  document.querySelectorAll("[data-new]").forEach(b => b.onclick = () => openForm(b.dataset.new))
  document.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => {
    let [k, id] = b.dataset.edit.split(":")
    openForm(k, id)
  })
  document.querySelectorAll("[data-edit-course]").forEach(b => b.onclick = () => openForm("course", b.dataset.editCourse))
  document.querySelectorAll("[data-course]").forEach(b => b.onclick = () => setPage("courses"))
  let cf = $("#courseFilter")
  if (cf) {
    cf.value = filterCourse
    cf.onchange = () => {
      filterCourse = cf.value
      render()
    }
    $("#search").oninput = () => document.querySelectorAll("#rows tr").forEach(r => r.style.display = r.textContent.toLowerCase().includes($("#search").value.toLowerCase()) ? "" : "none")
  }
  document.querySelectorAll("[data-status]").forEach(s => s.onchange = () => {
    let t = db.tasks.find(t => t.id === s.dataset.status)
    if (t) {
      t.status = s.value
      save()
      msg("Seguimiento actualizado")
    }
  })
  if ($("#saveSettings")) $("#saveSettings").onclick = () => {
    db.settings = {
      year: $("#year").value,
      start: $("#start").value,
      end: $("#end").value,
      block: $("#block").value,
      schedule: $("#schedule").value
    }
    save()
    render()
    msg("Configuración guardada")
  }
  if ($("#logout")) $("#logout").onclick = async () => {
    await signOut()
    currentUser = null
    render()
    msg("Sesión cerrada")
  }
  if ($("#syncFromCloud")) $("#syncFromCloud").onclick = async () => {
    if (currentUser) {
      msg("Cargando datos desde la nube...")
      await loadFromSupabase(currentUser.id)
    }
  }
  if ($("#syncToCloud")) $("#syncToCloud").onclick = async () => {
    if (currentUser) {
      msg("Guardando datos en la nube...")
      await saveToSupabase(currentUser.id)
    }
  }
  if ($("#login")) $("#login").onclick = () => {
    isRegistering = false
    $("#authTitle").textContent = "Iniciar sesión"
    $("#authNameField").style.display = "none"
    $("#authSubmit").textContent = "Iniciar sesión"
    $("#authToggle").textContent = "¿No tienes cuenta? Regístrate"
    $("#authEmail").value = ""
    $("#authPassword").value = ""
    $("#authName").value = ""
    $("#authModal").classList.add("show")
  }
  if ($("#authClose")) $("#authClose").onclick = closeAuthModal
  if ($("#authCancel")) $("#authCancel").onclick = closeAuthModal
  if ($("#authToggle")) $("#authToggle").onclick = () => {
    isRegistering = !isRegistering
    if (isRegistering) {
      $("#authTitle").textContent = "Crear cuenta"
      $("#authNameField").style.display = "block"
      $("#authSubmit").textContent = "Registrarse"
      $("#authToggle").textContent = "¿Ya tienes cuenta? Inicia sesión"
    } else {
      $("#authTitle").textContent = "Iniciar sesión"
      $("#authNameField").style.display = "none"
      $("#authSubmit").textContent = "Iniciar sesión"
      $("#authToggle").textContent = "¿No tienes cuenta? Regístrate"
    }
  }
  if ($("#authForm")) $("#authForm").onsubmit = async (e) => {
    e.preventDefault()
    const email = $("#authEmail").value.trim()
    const password = $("#authPassword").value
    const fullName = $("#authName").value.trim()

    if (!email || !password) {
      msg("Por favor completa todos los campos")
      return
    }

    if (password.length < 6) {
      msg("La contraseña debe tener al menos 6 caracteres")
      return
    }

    let result
    if (isRegistering) {
      result = await signUp(email, password, fullName)
    } else {
      result = await signIn(email, password)
    }

    if (result.error) {
      msg("No se pudo autenticar: " + result.error.message)
      return
    }

    if (isRegistering && result.data && !result.data.session) {
      msg("Cuenta creada. Revisa tu correo para confirmar el registro.")
      closeAuthModal()
      return
    }

    currentUser = result.data?.user || null
    closeAuthModal()
    if (currentUser) {
      msg("Sesión iniciada. Elige cargar desde la nube o guardar tus datos locales en Configuración.")
    } else {
      msg("Revisa tu correo para continuar")
    }
    render()
  }
  $("#authModal").onclick = (e) => {
    if (e.target === $("#authModal")) closeAuthModal()
  }
  if ($("#export2")) $("#export2").onclick = exportData
  if ($("#import2")) $("#import2").onclick = () => $("#importFile").click()
}

function closeAuthModal() {
  $("#authModal").classList.remove("show")
}

// Formularios
function openForm(k, id = null) {
  kind = k
  editing = id
  let title = {
    course: "Editar curso",
    sessions: "Nueva sesión",
    resources: "Nuevo recurso",
    tasks: "Nueva tarea"
  }[k]
  $("#mtitle").textContent = title
  let fields = ""
  if (k === "course") {
    let c = db.courses.find(x => x.id === id)
    fields = `<div class="field"><label>Nombre del curso</label><input name="name" value="${c ? esc(c.name) : ""}"></div><div class="field"><label>Grado</label><input name="grade" value="${c ? esc(c.grade) : ""}"></div><div class="field"><label>Descripción</label><textarea name="desc">${c ? esc(c.desc) : ""}</textarea></div><div class="field"><label>Color</label><select name="color">${["blue", "green", "amber", "purple", "red"].map(x => `<option ${c && c.color === x ? 'selected' : ''}>${x}</option>`).join("")}</select></div><div class="field"><label>Unidades y temas</label><textarea name="unitsText" placeholder="Unidad 1 · Título | Tema 1; Tema 2; Tema 3">${c ? esc(unitsToText(c.units)) : ""}</textarea><small style="display:block;color:var(--muted);font-size:11px;margin-top:4px">Una unidad por línea con el formato <b>nombre | tema 1; tema 2</b>.</small></div>`
  } else if (k === "sessions") {
    let s = db.sessions.find(x => x.id === id)
    fields = `<div class="field"><label>Título</label><input name="title" value="${s ? esc(s.title) : ""}"></div><div class="field"><label>Curso</label><select name="courseId">${courseOptions(s ? s.courseId : "")}</select></div><div class="field"><label>Objetivo</label><textarea name="objective">${s ? esc(s.objective || "") : ""}</textarea></div><div class="formgrid"><div class="field"><label>Fecha (opcional)</label><input name="date" type="date" value="${s ? esc(s.date || "") : ""}"></div><div class="field"><label>Duración min (opcional)</label><input name="duration" type="number" value="${s ? esc(s.duration || "") : ""}"></div></div><div class="field"><label>Estado</label><select name="status">${["Borrador", "Preparada", "Completada"].map(x => `<option ${s && s.status === x ? 'selected' : ''}>${x}</option>`).join("")}</select></div>`
  } else if (k === "resources") {
    let r = db.resources.find(x => x.id === id)
    fields = `<div class="field"><label>Título</label><input name="title" value="${r ? esc(r.title) : ""}"></div><div class="field"><label>Curso</label><select name="courseId">${courseOptions(r ? r.courseId : "")}</select></div><div class="field"><label>Tipo</label><select name="type">${["Video", "Documento", "Drive", "OneDrive", "Otro"].map(x => `<option ${r && r.type === x ? 'selected' : ''}>${x}</option>`).join("")}</select></div><div class="field"><label>URL</label><input name="url" value="${r ? esc(r.url || "") : ""}"></div><div class="field"><label>Notas</label><textarea name="notes">${r ? esc(r.notes || "") : ""}</textarea></div>`
  } else if (k === "tasks") {
    let t = db.tasks.find(x => x.id === id)
    fields = `<div class="field"><label>Título</label><input name="title" value="${t ? esc(t.title) : ""}"></div><div class="field"><label>Curso</label><select name="courseId">${courseOptions(t ? t.courseId : "")}</select></div><div class="field"><label>Descripción</label><textarea name="description">${t ? esc(t.description || "") : ""}</textarea></div><div class="formgrid"><div class="field"><label>Fecha entrega</label><input name="dueDate" type="date" value="${t ? esc(t.dueDate || "") : ""}"></div><div class="field"><label>Estado</label><select name="status">${["Pendiente", "Publicada", "En revisión", "Revisada"].map(x => `<option ${t && t.status === x ? 'selected' : ''}>${x}</option>`).join("")}</select></div></div><div class="field"><label>URL de Classroom</label><input name="url" value="${t ? esc(t.url || "") : ""}"></div>`
  }
  $("#fields").innerHTML = fields
  $("#delete").classList.toggle("hidden", !id)
  $("#back").classList.add("show")
}

// Guardar formulario
$("#form").onsubmit = async (e) => {
  e.preventDefault()
  let fd = new FormData(e.target)
  let data = Object.fromEntries(fd)
  if (kind === "course") {
    const { unitsText, ...rest } = data
    const units = textToUnits(unitsText)
    if (editing) {
      let c = db.courses.find(x => x.id === editing)
      Object.assign(c, rest, { units })
    } else {
      rest.id = "c" + Date.now()
      rest.units = units
      db.courses.push(rest)
    }
  } else {
    data.id = editing || kind.charAt(0) + Date.now()
    if (editing) {
      let idx = db[kind].findIndex(x => x.id === editing)
      db[kind][idx] = data
    } else {
      db[kind].push(data)
    }
  }
  save()
  closeModal()
  render()
  msg("Guardado")
}

// Eliminar
$("#delete").onclick = () => {
  if (confirm("¿Eliminar este registro?")) {
    if (kind === "course") {
      db.courses = db.courses.filter(x => x.id !== editing)
    } else {
      db[kind] = db[kind].filter(x => x.id !== editing)
    }
    save()
    closeModal()
    render()
    msg("Eliminado")
  }
}

// Modal
function closeModal() {
  $("#back").classList.remove("show")
  editing = null
  kind = null
}
$("#close").onclick = closeModal
$("#cancel").onclick = closeModal
$("#back").onclick = (e) => {
  if (e.target === $("#back")) closeModal()
}

// Exportar/Importar
function exportData() {
  let blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" })
  let url = URL.createObjectURL(blob)
  let a = document.createElement("a")
  a.href = url
  a.download = "aula-respaldo-" + new Date().toISOString().split("T")[0] + ".json"
  a.click()
  URL.revokeObjectURL(url)
  msg("Datos exportados")
}

$("#importFile").onchange = (e) => {
  let f = e.target.files[0]
  if (!f) return
  let r = new FileReader()
  r.onload = () => {
    try {
      let x = JSON.parse(r.result)
      if (x.courses && Array.isArray(x.courses)) {
        db = x
        save()
        render()
        msg("Datos importados")
      } else {
        msg("Formato inválido")
      }
    } catch (e) {
      msg("Error al importar")
    }
  }
  r.readAsText(f)
}

// Persistencia local
const KEY = "aula-docente-4to-v2"

function load() {
  try {
    let x = JSON.parse(localStorage.getItem(KEY))
    if (x && Array.isArray(x.courses)) db = x
  } catch (e) {}
  applySelectedCurriculum(db)
  save()
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(db))
}

// Sincronización explícita con Supabase
// La carga y la subida son acciones manuales para no sobrescribir datos locales sin permiso.
async function loadFromSupabase(userId) {
  if (!userId) return
  try {
    const cloudDb = await loadPlannerFromCloud(userId, db)
    if (!window.confirm("Cargar desde la nube reemplazará los registros locales actuales de cursos, sesiones, recursos y tareas. Antes, exporta un respaldo si necesitas conservarlos. ¿Continuar?")) {
      msg("Carga cancelada; tus datos locales no cambiaron")
      return
    }
    db = applySelectedCurriculum(cloudDb)
    save()
    render()
    msg("Datos cargados desde Supabase")
  } catch (error) {
    console.error("Error cargando desde Supabase:", error)
    msg("Error al cargar: " + error.message)
  }
}

async function saveToSupabase(userId) {
  if (!userId) return
  if (!window.confirm("Se combinarán los datos locales con Supabase. Los registros locales se agregarán o actualizarán; no se borrarán registros de la nube. ¿Continuar?")) return
  try {
    const report = await savePlannerToCloud(userId, db)
    save()
    render()
    const skipped = report.skippedResources ? ` ${report.skippedResources} recurso(s) sin URL se omitieron.` : ""
    msg(`Nube actualizada: ${report.courses} cursos, ${report.units} unidades, ${report.topics} temas, ${report.sessions} sesiones, ${report.resources} recursos y ${report.tasks} tareas.${skipped}`)
  } catch (error) {
    console.error("Error guardando en Supabase:", error)
    msg("No se completó la sincronización: " + error.message)
  }
}

// Inicialización
load()
$("#export").onclick = exportData
$("#quick").onclick = () => openForm("sessions")
setPage("home")

// Escuchar cambios de autenticación
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
    currentUser = session?.user || null
    if (page === "settings") render()
  } else if (event === 'SIGNED_OUT') {
    currentUser = null
    if (page === "settings") render()
  }
})

// Restaurar la sesión guardada por Supabase al abrir la aplicación.
getCurrentUser().then(user => {
  currentUser = user
  if (page === "settings") render()
}).catch(error => console.error("No se pudo restaurar la sesión:", error))
