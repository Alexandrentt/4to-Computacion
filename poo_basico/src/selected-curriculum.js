// Malla seleccionada por el docente para Sistemas e Instalación y Mantenimiento.
// Los títulos y duraciones proceden de las listas compartidas. Los temas adicionales
// amplían el curso para alfabetización digital y trabajo técnico seguro.
export const systemsUnits = [
  ['Unidad 1 · Computación básica y alfabetización digital', [
    'Proceso de arranque y encendido de computadoras y móviles',
    'Cómo funciona un circuito electrónico',
    'Qué es un bit y qué es un byte',
    'Cómo funciona una CPU por dentro',
    'Qué hace un sistema operativo por dentro',
    'Cómo funciona internet',
    'Cómo guarda y borra datos tu computadora',
    'Cómo se organizan los archivos',
    'Qué es y cómo funciona un system on a chip',
    'GPUs: Procesadores gráficos y de AI',
    'Qué es un algoritmo y cómo funciona'
  ]],
  ['Unidad 2 · Redes e Internet', [
    'Qué es una dirección IP y cómo funciona',
    'Qué es el DNS y cómo comprar tu dominio',
    'Cómo funciona el modelo cliente servidor',
    'Redes locales: router, Wi-Fi y Ethernet',
    'Seguridad, privacidad y buenas prácticas en Internet'
  ]],
  ['Unidad 3 · Sistemas operativos, arranque y controladores', [
    'Diferencias entre Windows, Linux y MacOS',
    'Permisos de archivos rwx en Linux',
    'Cómo los archivos saben lo que son',
    'BIOS y UEFI: configuración y secuencia de arranque',
    'Controladores (drivers): función, instalación y actualización',
    'Particiones, tablas de particiones y sistemas de archivos',
    'Arranque dual (dual boot): conceptos, riesgos y planificación',
    'Gestores de arranque y selección de sistema operativo',
    'Compatibilidad de hardware, arquitectura de 32 y 64 bits'
  ]],
  ['Unidad 4 · Archivos, datos y formatos digitales', [
    'Qué son las bases de datos',
    'Cómo funciona el formato .JPG',
    'Videos: contenedores, codecs y protocolos',
    'Cómo Funciona un .zip',
    'Extensiones, tipos MIME y asociaciones de archivos',
    'Compresión, copias de seguridad y recuperación de archivos',
    'Almacenamiento HDD, SSD, USB y tarjetas de memoria'
  ]],
  ['Unidad 5 · Instalación, configuración y virtualización', [
    'Requisitos de instalación y compatibilidad del equipo',
    'Descarga segura de imágenes ISO y verificación de origen',
    'Creación de USB de instalación y medios de arranque',
    'Instalación limpia frente a actualización del sistema',
    'Particionado durante la instalación y prevención de pérdida de datos',
    'Instalación de Windows y Linux en entornos de práctica',
    'Máquinas virtuales: concepto, hipervisor y configuración inicial',
    'Snapshots, clonación y puntos de restauración en máquinas virtuales',
    'Instalación de aplicaciones, actualizaciones y desinstalación segura',
    'Usuarios, permisos, contraseñas y protección de datos',
    'Respaldos, restauración y recuperación de arranque',
    'Diagnóstico básico: Administrador de dispositivos, registros y herramientas del sistema',
    'Higiene digital: phishing, malware, licencias y actualizaciones',
    'Práctica integradora: instalar, configurar y documentar un sistema operativo'
  ]]
]

export const maintenanceUnits = [
  ['Unidad 1 · Entender los fundamentos de la electricidad', [
    'Fundamentos de Electricidad y Electrónica Práctica',
    'Compra de Componentes Electrónicos en tu Ciudad',
    'Fundamentos de Electricidad y Cargas Eléctricas',
    'Voltaje, Corriente y Potencia Eléctrica: Conceptos Fundamentales',
    'Cálculo de Potencia Eléctrica en Circuitos Domésticos',
    'Campos de Aplicación de la Electricidad: Ingeniería, Electrónica y Computación',
    'Ley de Ohm: Concepto y Aplicación en Circuitos Eléctricos'
  ]],
  ['Unidad 2 · Medir voltaje, corriente y resistencia', [
    'Uso básico y compra de multímetros para principiantes',
    'Circuitos Eléctricos: Serie y Paralelo',
    'Fuentes de Poder: Baterías y Cargadores en Circuitos Electrónicos',
    'Concepto de Tierra en Circuitos Eléctricos y Electrónicos',
    'Seguridad eléctrica: tensión, corriente, cortocircuitos y desconexión segura',
    'Electricidad estática y protección ESD al manipular componentes de computadora'
  ]],
  ['Unidad 3 · Construir circuitos básicos', [
    'Prácticas con Resistencias y Ley de Ohm en Circuitos Básicos',
    'Uso de Protoboard para Circuitos Electrónicos Básicos',
    'Construcción de un Circuito Básico con LED y Botón',
    'Lectura de diagramas, identificación de polaridad y comprobación de continuidad'
  ]],
  ['Unidad 4 · Resistencias y componentes electrónicos', [
    'Código de Colores y Medición de Resistencias en Circuitos Eléctricos',
    'Funcionamiento y aplicaciones de potenciómetros en dispositivos electrónicos',
    'Funcionamiento de Fotoceldas: Medición de Resistencia a la Luz',
    'Funcionamiento de Fotoresistencias en Circuitos LED',
    'Uso del Potenciómetro en Circuitos Electrónicos Básicos',
    'Fundamentos de Electricidad y Electrónica Básica',
    'Diodos, LED, capacitores, transistores y sensores: identificación básica',
    'Lectura de valores, tolerancias y hojas de datos de componentes'
  ]],
  ['Unidad 5 · Mantenimiento y reparación de computadoras', [
    'Seguridad del taller, herramientas y registro de ingreso del equipo',
    'Identificación de placa base, CPU, RAM, almacenamiento y fuente de poder',
    'Cómo funciona una fuente de poder ATX y cómo interpretar sus especificaciones',
    'Refrigeración, ventiladores, disipadores y pasta térmica',
    'Inspección visual: conectores, cables, corrosión, polvo y daños físicos',
    'Diagnóstico por síntomas: no enciende, no da video, se reinicia o está lenta',
    'POST, pitidos, indicadores de diagnóstico y orden de comprobaciones',
    'Pruebas de memoria RAM, almacenamiento, temperaturas y alimentación',
    'Limpieza interna y mantenimiento preventivo seguro',
    'Compatibilidad y sustitución supervisada de componentes',
    'Pruebas posteriores a la reparación y verificación de estabilidad',
    'Presupuesto, inventario de repuestos e informe técnico de reparación',
    'Práctica integradora: diagnosticar, justificar la hipótesis y documentar la solución'
  ]]
]

export const selectedVideoLessons = [
  { course: 'sistemas', unit: 1, number: 1, title: 'Proceso de arranque y encendido de computadoras y móviles', duration: 'duración no indicada; ya marcado como completado', status: 'Completada' },
  { course: 'sistemas', unit: 1, number: 2, title: 'Cómo funciona un circuito electrónico', duration: 'duración no indicada; ya marcado como completado', status: 'Completada' },
  { course: 'sistemas', unit: 1, number: 3, title: 'Qué es un bit y qué es un byte', duration: 'duración no indicada; ya marcado como completado', status: 'Completada' },
  { course: 'sistemas', unit: 1, number: 4, title: 'Cómo funciona una CPU por dentro', duration: 'duración no indicada; ya marcado como completado', status: 'Completada' },
  { course: 'sistemas', unit: 1, number: 5, title: 'Qué hace un sistema operativo por dentro', duration: 'duración no indicada; ya marcado como completado', status: 'Completada' },
  { course: 'sistemas', unit: 1, number: 6, title: 'Cómo funciona internet', duration: 'duración no indicada; ya marcado como completado', status: 'Completada' },
  { course: 'sistemas', unit: 1, number: 7, title: 'Cómo guarda y borra datos tu computadora', duration: '10:07', status: 'Borrador' },
  { course: 'sistemas', unit: 1, number: 8, title: 'Cómo se organizan los archivos', duration: '10:54', status: 'Borrador' },
  { course: 'sistemas', unit: 1, number: 9, title: 'Qué es y cómo funciona un system on a chip', duration: '12:53', status: 'Borrador' },
  { course: 'sistemas', unit: 1, number: 10, title: 'GPUs: Procesadores gráficos y de AI', duration: '13:07', status: 'Borrador' },
  { course: 'sistemas', unit: 1, number: 11, title: 'Qué es un algoritmo y cómo funciona', duration: '07:03', status: 'Borrador' },
  { course: 'sistemas', unit: 2, number: 12, title: 'Qué es una dirección IP y cómo funciona', duration: '08:56', status: 'Borrador' },
  { course: 'sistemas', unit: 2, number: 13, title: 'Qué es el DNS y cómo comprar tu dominio', duration: '10:12', status: 'Borrador' },
  { course: 'sistemas', unit: 2, number: 14, title: 'Cómo funciona el modelo cliente servidor', duration: '08:35', status: 'Borrador' },
  { course: 'sistemas', unit: 3, number: 15, title: 'Diferencias entre Windows, Linux y MacOS', duration: '08:19', status: 'Borrador' },
  { course: 'sistemas', unit: 3, number: 16, title: 'Permisos de archivos rwx en Linux', duration: '06:00', status: 'Borrador' },
  { course: 'sistemas', unit: 3, number: 17, title: 'Cómo los archivos saben lo que son', duration: '08:35', status: 'Borrador' },
  { course: 'sistemas', unit: 4, number: 18, title: 'Qué son las bases de datos', duration: '09:26', status: 'Borrador' },
  { course: 'sistemas', unit: 4, number: 19, title: 'Cómo funciona el formato .JPG', duration: '06:43', status: 'Borrador' },
  { course: 'sistemas', unit: 4, number: 20, title: 'Videos: contenedores, codecs y protocolos', duration: '10:28', status: 'Borrador' },
  { course: 'sistemas', unit: 4, number: 21, title: 'Cómo Funciona un .zip', duration: '08:28', status: 'Borrador' },
  { course: 'mantenimiento', unit: 1, number: 1, title: 'Fundamentos de Electricidad y Electrónica Práctica', duration: '02:34', status: 'Borrador' },
  { course: 'mantenimiento', unit: 1, number: 2, title: 'Compra de Componentes Electrónicos en tu Ciudad', duration: '02:08', status: 'Borrador' },
  { course: 'mantenimiento', unit: 1, number: 3, title: 'Fundamentos de Electricidad y Cargas Eléctricas', duration: '06:35', status: 'Borrador' },
  { course: 'mantenimiento', unit: 1, number: 4, title: 'Voltaje, Corriente y Potencia Eléctrica: Conceptos Fundamentales', duration: '06:56', status: 'Borrador' },
  { course: 'mantenimiento', unit: 1, number: 5, title: 'Cálculo de Potencia Eléctrica en Circuitos Domésticos', duration: '02:13', status: 'Borrador' },
  { course: 'mantenimiento', unit: 1, number: 6, title: 'Campos de Aplicación de la Electricidad: Ingeniería, Electrónica y Computación', duration: '05:32', status: 'Borrador' },
  { course: 'mantenimiento', unit: 1, number: 7, title: 'Ley de Ohm: Concepto y Aplicación en Circuitos Eléctricos', duration: '03:20', status: 'Borrador' },
  { course: 'mantenimiento', unit: 2, number: 8, title: 'Uso básico y compra de multímetros para principiantes', duration: '04:58', status: 'Borrador' },
  { course: 'mantenimiento', unit: 2, number: 9, title: 'Circuitos Eléctricos: Serie y Paralelo', duration: '07:08', status: 'Borrador' },
  { course: 'mantenimiento', unit: 2, number: 10, title: 'Fuentes de Poder: Baterías y Cargadores en Circuitos Electrónicos', duration: '01:51', status: 'Borrador' },
  { course: 'mantenimiento', unit: 2, number: 11, title: 'Concepto de Tierra en Circuitos Eléctricos y Electrónicos', duration: '02:24', status: 'Borrador' },
  { course: 'mantenimiento', unit: 3, number: 12, title: 'Prácticas con Resistencias y Ley de Ohm en Circuitos Básicos', duration: '02:10', status: 'Borrador' },
  { course: 'mantenimiento', unit: 3, number: 13, title: 'Uso de Protoboard para Circuitos Electrónicos Básicos', duration: '05:56', status: 'Borrador' },
  { course: 'mantenimiento', unit: 3, number: 14, title: 'Construcción de un Circuito Básico con LED y Botón', duration: '00:15', status: 'Borrador' },
  { course: 'mantenimiento', unit: 4, number: 15, title: 'Código de Colores y Medición de Resistencias en Circuitos Eléctricos', duration: '04:30', status: 'Borrador' },
  { course: 'mantenimiento', unit: 4, number: 16, title: 'Funcionamiento y aplicaciones de potenciómetros en dispositivos electrónicos', duration: '07:44', status: 'Borrador' },
  { course: 'mantenimiento', unit: 4, number: 17, title: 'Funcionamiento de Fotoceldas: Medición de Resistencia a la Luz', duration: '04:29', status: 'Borrador' },
  { course: 'mantenimiento', unit: 4, number: 18, title: 'Funcionamiento de Fotoresistencias en Circuitos LED', duration: '01:59', status: 'Borrador' },
  { course: 'mantenimiento', unit: 4, number: 19, title: 'Uso del Potenciómetro en Circuitos Electrónicos Básicos', duration: '04:37', status: 'Borrador' },
  { course: 'mantenimiento', unit: 4, number: 20, title: 'Fundamentos de Electricidad y Electrónica Básica', duration: 'Video de referencia sin duración proporcionada', status: 'Borrador' }
]

export function applySelectedCurriculum(db) {
  if (!db || !Array.isArray(db.courses)) return db
  const systems = db.courses.find(c => c.id === 'sistemas' || c.name === 'Sistemas e Instalación de Software')
  const maintenance = db.courses.find(c => c.id === 'mantenimiento' || c.name === 'Mantenimiento y Reparación de Computadoras')
  if (systems) systems.units = systemsUnits.map(([name, topics]) => [name, [...topics]])
  if (maintenance) maintenance.units = maintenanceUnits.map(([name, topics]) => [name, [...topics]])
  db.sessions = Array.isArray(db.sessions) ? db.sessions : []
  db.resources = Array.isArray(db.resources) ? db.resources : []
  db.tasks = Array.isArray(db.tasks) ? db.tasks : []
  for (const lesson of selectedVideoLessons) {
    const course = db.courses.find(c => c.id === lesson.course || c.name === (lesson.course === 'sistemas' ? 'Sistemas e Instalación de Software' : 'Mantenimiento y Reparación de Computadoras'))
    if (!course) continue
    const key = 'curriculum-' + lesson.course + '-' + lesson.number
    const title = String(lesson.number).padStart(2, '0') + ' · ' + lesson.title
    const existing = db.sessions.find(s => s.curriculumKey === key || (s.courseId === course.id && s.title === title))
    if (existing) {
      existing.courseId = course.id
      if (lesson.status === 'Completada') existing.status = 'Completada'
      existing.curriculumKey = key
      existing.notes = 'Video de referencia. Duración: ' + lesson.duration + '. Enlace específico pendiente de asociar.'
      continue
    }
    db.sessions.push({
      id: key,
      curriculumKey: key,
      courseId: course.id,
      title,
      objective: 'Estudiar el contenido del video y registrar los conceptos técnicos principales.',
      introduction: 'Activación: anotar lo que ya sabes del tema y una pregunta que quieras resolver.',
      development: 'Ver el material de referencia, tomar apuntes y relacionar los conceptos con un equipo o situación real.',
      activities: 'Escribir un resumen breve, identificar vocabulario técnico y resolver una pregunta aplicada.',
      closure: 'Explicar con tus palabras qué aprendiste y qué duda queda pendiente.',
      evidence: 'Apuntes propios y respuestas correctas a las preguntas de comprobación.',
      materialUrl: '',
      notes: 'Video de referencia. Duración: ' + lesson.duration + '. Enlace específico pendiente de asociar.',
      date: '',
      duration: '',
      status: lesson.status
    })
  }
  db.settings = { ...(db.settings || {}), selectedCurriculumVersion: 1 }
  return db
}
