import { supabase } from './config/supabase.js'
const $ = s => document.querySelector(s)
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
let user = null, classes = [], courses = []
function say(t, type=''){const n=$('#notice');n.textContent=t;n.className='notice '+type;n.classList.remove('hidden')}
async function refresh(){
 const profile=await supabase.from('teacher_profiles').select('user_id').eq('user_id',user.id).maybeSingle()
 if(profile.error)throw profile.error
 if(!profile.data){$('#authPanel').classList.remove('hidden');say('Esta cuenta aún no está habilitada como docente. Un administrador debe añadirla a teacher_profiles.','error');return}
 const [cr,co]=await Promise.all([supabase.from('learning_classes').select('id,name,course_id').eq('teacher_id',user.id),supabase.from('courses').select('id,name').eq('user_id',user.id).order('name')])
 if(cr.error)throw cr.error;if(co.error)throw co.error
 classes=cr.data||[];courses=co.data||[]
 $('#authPanel').classList.add('hidden');$('#teacherArea').classList.remove('hidden');$('#logoutBtn').classList.remove('hidden')
 $('#courseId').innerHTML=courses.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('')
 const options=classes.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('')
 $('#classSelect').innerHTML=options;$('#lessonClass').innerHTML=options
 $('#classList').innerHTML=classes.length?classes.map(c=>'<div class="item"><strong>'+esc(c.name)+'</strong><small>'+esc(courses.find(x=>x.id===c.course_id)?.name||'')+'</small></div>').join(''):'<p class="muted">Aún no hay clases.</p>'
 await refreshLessons()
}
async function refreshLessons(){
 if(!classes.length){$('#lessonList').innerHTML='';$('#progressList').innerHTML='<p class="muted">Crea una clase para comenzar.</p>';return}
 const ids=classes.map(c=>c.id)
 const lr=await supabase.from('learning_lessons').select('id,class_id,title,is_published').in('class_id',ids).order('order_index')
 const mr=await supabase.from('class_memberships').select('class_id,student_id,student_name,joined_at,status').in('class_id',ids).eq('status','active')
 if(lr.error)throw lr.error;if(mr.error)throw mr.error
 const lessons=lr.data||[], members=mr.data||[]
 $('#lessonList').innerHTML=lessons.map(l=>'<div class="item">'+esc(l.title)+' · '+(l.is_published?'Publicada':'Borrador')+' <button class="btn" data-pub="'+l.id+'">'+(l.is_published?'Retirar':'Publicar')+'</button></div>').join('')||'<p class="muted">Sin lecciones.</p>'
 document.querySelectorAll('[data-pub]').forEach(b=>b.onclick=async()=>{const l=lessons.find(x=>x.id===b.dataset.pub);const r=await supabase.from('learning_lessons').update({is_published:!l.is_published}).eq('id',l.id);if(r.error)say(r.error.message,'error');else await refreshLessons()})
 let p=[]
 if(lessons.length){const r=await supabase.from('lesson_progress').select('lesson_id,student_id,status').in('lesson_id',lessons.map(l=>l.id));if(r.error)throw r.error;p=r.data||[]}
 $('#progressList').innerHTML=members.length?members.map(m=>'<div class="item"><strong>'+esc(m.student_name||'Estudiante')+'</strong><small>'+esc(classes.find(c=>c.id===m.class_id)?.name||'')+'</small><p>'+p.filter(x=>x.student_id===m.student_id&&x.status==='completed').length+' lecciones completadas</p></div>').join(''):'<p class="muted">Aún no hay alumnos inscritos.</p>'
}
