-- Seed the four planned units per course. Units are drafts until the teacher publishes them.
with units(course_name, order_index, title, summary, topics) as (
 values
 ('Programación I / Laboratorio 1',1,'Unidad 1. Pensamiento algorítmico','Descomposición de problemas, patrones, algoritmos, pseudocódigo y diagramas de flujo.',array['Descomponer problemas en pasos pequeños','Identificar entrada, proceso y salida','Representar algoritmos con pseudocódigo','Trazar y probar algoritmos con casos simples']::text[]),
 ('Programación I / Laboratorio 1',2,'Unidad 2. Fundamentos de Python','Variables, tipos de datos, expresiones, entrada y salida.',array['print() e input()','Variables y asignación','Tipos int, float, str y bool','Operadores y conversión de tipos']::text[]),
 ('Programación I / Laboratorio 1',3,'Unidad 3. Control y colecciones','Condicionales, ciclos, listas y cadenas.',array['if, elif y else','Ciclos while y for','Listas, índices y recorridos','Pruebas con casos normales y límites']::text[]),
 ('Programación I / Laboratorio 1',4,'Unidad 4. Programación modular','Funciones, parámetros, retorno, alcance y depuración.',array['Definir funciones con def','Parámetros y return','Separar responsabilidades','Depurar y probar funciones']::text[]),
 ('Sistemas e Instalación de Software',1,'Unidad 1. Computación básica','Componentes, representación de datos, archivos y almacenamiento.',array['Hardware, software y firmware','Bits, bytes y unidades de almacenamiento','Archivos, extensiones y carpetas','Organización y copias de seguridad']::text[]),
 ('Sistemas e Instalación de Software',2,'Unidad 2. Redes, Internet, archivos y datos','Conectividad, servicios de Internet, protocolos y gestión segura de datos.',array['LAN, WAN, router y switch','Direcciones IP, DNS y DHCP','HTTP/HTTPS y servicios web','Permisos, privacidad y respaldo de datos']::text[]),
 ('Sistemas e Instalación de Software',3,'Unidad 3. Sistemas operativos y almacenamiento','Funciones del sistema operativo, drivers, discos y diagnóstico.',array['Procesos, memoria y usuarios','Drivers y actualizaciones','HDD, SSD y sistemas de archivos','Herramientas básicas de diagnóstico']::text[]),
 ('Sistemas e Instalación de Software',4,'Unidad 4. Instalación, configuración y virtualización','Preparación, instalación, configuración inicial y máquinas virtuales.',array['Verificar requisitos y respaldar información','Preparar medios y opciones de arranque','Instalar actualizaciones y drivers','Máquinas virtuales y snapshots']::text[]),
 ('Mantenimiento y Reparación',1,'Unidad 1. Electricidad y seguridad','Riesgos eléctricos, ESD, desconexión segura y magnitudes eléctricas.',array['Seguridad del área de trabajo','Electricidad estática y protección ESD','Voltaje, corriente, resistencia y potencia','Procedimientos antes de abrir un equipo']::text[]),
 ('Mantenimiento y Reparación',2,'Unidad 2. Multímetro y circuitos','Uso seguro del multímetro y medición de circuitos básicos.',array['Bornes y escalas del multímetro','Continuidad y resistencia con circuito desenergizado','Diferencias entre medir voltaje y corriente','Registrar resultados y evitar cortocircuitos']::text[]),
 ('Mantenimiento y Reparación',3,'Unidad 3. Componentes electrónicos','Identificación y función de componentes electrónicos y partes del equipo.',array['Resistencias, capacitores, diodos y transistores','Fuente, placa madre, RAM y almacenamiento','Conectores, ventilación y disipación térmica','Inspección visual y manipulación segura']::text[]),
 ('Mantenimiento y Reparación',4,'Unidad 4. Diagnóstico y reparación','Diagnóstico sistemático, mantenimiento preventivo y documentación.',array['Recopilar síntomas y reproducir el fallo','Formular y comprobar hipótesis','Limpieza y revisión de conexiones','Documentar y verificar la reparación']::text[]),
 ('Laboratorio 2',1,'Unidad 1. Clases y objetos','Modelado de objetos, atributos, métodos, estado e instancias.',array['Identificar objetos en un problema','Definir clases, atributos y métodos','Crear instancias y usar constructores','Relacionar estado y comportamiento']::text[]),
 ('Laboratorio 2',2,'Unidad 2. Diseño de objetos','Encapsulación, responsabilidades, constructores, validación e interacción.',array['Encapsulación y acceso controlado','Responsabilidad única','Constructores y validación','Colaboración entre objetos']::text[]),
 ('Laboratorio 2',3,'Unidad 3. Reutilización','Composición, herencia, polimorfismo y refactorización.',array['Reutilizar mediante composición','Herencia y polimorfismo introductorios','Evitar duplicación de código','Refactorizar manteniendo el comportamiento']::text[]),
 ('Laboratorio 2',4,'Unidad 4. Proyecto integrador','Diseño, implementación, pruebas, documentación y presentación de una aplicación orientada a objetos.',array['Definir requisitos y casos de uso','Diseñar clases y relaciones','Implementar incrementalmente','Probar, documentar y presentar']::text[])
)
insert into public.learning_lessons (class_id,title,summary,content,order_index,is_published)
select lc.id, u.title, u.summary,
 jsonb_build_object('blocks',jsonb_build_array(
   jsonb_build_object('type','heading','text','Temas de la unidad'),
   jsonb_build_object('type','list','items',to_jsonb(u.topics)),
   jsonb_build_object('type','text','text','Esta unidad es el punto de partida del plan docente. Amplía la explicación, ejemplos guiados y actividades antes de publicarla.')
  )), u.order_index, false
from units u
join public.courses c on c.name = u.course_name
join public.learning_classes lc on lc.course_id = c.id and lc.teacher_id = c.user_id
join public.teacher_profiles tp on tp.user_id = lc.teacher_id
join auth.users au on au.id = tp.user_id
where lower(au.email) = 'perezgomezbrandon6a@gmail.com'
and not exists (select 1 from public.learning_lessons e where e.class_id=lc.id and e.order_index=u.order_index);
