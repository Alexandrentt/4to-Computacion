#!/usr/bin/env python3
"""
Script para importar el curriculum de POO al planificador Aula.

Este script lee los archivos JSON del curriculum y crea las estructuras
en el backend de Supabase.

Requisitos:
- Backend de Supabase configurado
- Usuario autenticado
- Archivos JSON del curriculum presentes
"""

import json
import sys
from pathlib import Path

# Este script asume que tienes el backend configurado
# Descomenta las siguientes líneas cuando tengas el backend listo:

# from src.config.supabase import supabase
# from src.auth.auth import getCurrentUser
# from src.api.courses import createCourse, createUnit, createTopic
# from src.api.sessions import createSession

def load_curriculum():
    """Carga todos los archivos del curriculum."""
    curriculum = {
        'course': None,
        'units': []
    }
    
    # Cargar Unidad 1
    try:
        with open('poo_curriculum.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            curriculum['course'] = data['course']
            curriculum['units'].append(data['course']['units'][0])
    except FileNotFoundError:
        print("Advertencia: poo_curriculum.json no encontrado")
    
    # Cargar Unidad 2
    try:
        with open('poo_curriculum_extended.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            curriculum['units'].append(data['unidades_restantes'][0])
    except FileNotFoundError:
        print("Advertencia: poo_curriculum_extended.json no encontrado")
    
    # Cargar Unidades 3 y 4
    try:
        with open('poo_curriculum_units3_4.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            curriculum['units'].extend(data['unidades_finales'])
    except FileNotFoundError:
        print("Advertencia: poo_curriculum_units3_4.json no encontrado")
    
    return curriculum

def create_course_structure(curriculum, user_id):
    """
    Crea la estructura completa del curso en el backend.
    
    Args:
        curriculum: Diccionario con el curriculum completo
        user_id: ID del usuario autenticado
        
    Returns:
        Diccionario con IDs creados
    """
    print("📚 Importando curriculum de POO...")
    
    # Crear curso
    print("📝 Creando curso...")
    course_data = {
        'user_id': user_id,
        'name': curriculum['course']['name'],
        'level': curriculum['course']['level'],
        'area': curriculum['course']['area'],
        'color': 'blue',
        'description': curriculum['course']['description']
    }
    
    # course = createCourse(course_data)
    # course_id = course['id']
    course_id = "demo_course_id"  # Placeholder
    
    print(f"✅ Curso creado: {course_data['name']}")
    
    # Crear unidades y temas
    created_units = []
    created_topics = []
    created_sessions = []
    
    for unit in curriculum['units']:
        print(f"\n📖 Creando unidad: {unit['name']}")
        
        # Crear unidad
        unit_data = {
            'course_id': course_id,
            'name': unit['name'],
            'order_index': unit['order']
        }
        
        # unit_obj = createUnit(unit_data)
        # unit_id = unit_obj['id']
        unit_id = f"demo_unit_{unit['order']}"  # Placeholder
        
        created_units.append({
            'id': unit_id,
            'name': unit['name'],
            'order': unit['order']
        })
        
        print(f"  ✅ Unidad creada")
        
        # Crear temas y sesiones
        for topic in unit['topics']:
            print(f"  📄 Creando tema: {topic['name']}")
            
            # Crear tema
            topic_data = {
                'unit_id': unit_id,
                'title': topic['name'],
                'order_index': topic['order']
            }
            
            # topic_obj = createTopic(topic_data)
            # topic_id = topic_obj['id']
            topic_id = f"demo_topic_{topic['order']}"  # Placeholder
            
            created_topics.append({
                'id': topic_id,
                'title': topic['name'],
                'order': topic['order']
            })
            
            # Crear sesión
            session_data = {
                'user_id': user_id,
                'course_id': course_id,
                'title': topic['name'],
                'objective': '; '.join(topic['content']['key_concepts']),
                'introduction': topic['content']['introduction'],
                'development': topic['content']['development'],
                'activities': '\n'.join([f"- {a['title']}: {a['description']}" for a in topic['activities']]),
                'closure': f"Tarea: {topic['homework']['title']}",
                'evidence': topic['homework']['deliverable'],
                'duration': topic['duration_minutes'],
                'status': 'Borrador'
            }
            
            # session = createSession(session_data)
            # session_id = session['id']
            session_id = f"demo_session_{topic['order']}"  # Placeholder
            
            created_sessions.append({
                'id': session_id,
                'title': topic['name'],
                'unit': unit['name']
            })
            
            print(f"    ✅ Tema y sesión creados")
    
    # Resumen
    print("\n" + "="*50)
    print("📊 RESUMEN DE IMPORTACIÓN")
    print("="*50)
    print(f"✅ Curso: {course_data['name']}")
    print(f"✅ Unidades creadas: {len(created_units)}")
    print(f"✅ Temas creados: {len(created_topics)}")
    print(f"✅ Sesiones creadas: {len(created_sessions)}")
    print("="*50)
    
    return {
        'course_id': course_id,
        'units': created_units,
        'topics': created_topics,
        'sessions': created_sessions
    }

def export_to_plan_format(curriculum):
    """
    Exporta el curriculum a un formato que puede importarse
    manualmente en el planificador (formato JSON del planificador).
    """
    print("📦 Exportando a formato del planificador...")
    
    plan_data = {
        'courses': [curriculum['course']],
        'sessions': [],
        'resources': [],
        'tasks': []
    }
    
    course_id = curriculum['course']['id']
    
    for unit in curriculum['units']:
        for topic in unit['topics']:
            # Crear sesión
            session = {
                'id': f"{course_id}_{unit['id']}_{topic['id']}",
                'courseId': course_id,
                'title': topic['name'],
                'objective': '; '.join(topic['content']['key_concepts']),
                'introduction': topic['content']['introduction'],
                'development': topic['content']['development'],
                'activities': '\n'.join([a['description'] for a in topic['activities']]),
                'closure': f"Tarea: {topic['homework']['title']}",
                'evidence': topic['homework']['deliverable'],
                'materialUrl': '',
                'notes': f"Duración: {topic['duration_minutes']} minutos",
                'status': 'Borrador',
                'date': None,
                'duration': topic['duration_minutes']
            }
            plan_data['sessions'].append(session)
            
            # Crear tarea
            task = {
                'id': f"task_{topic['id']}",
                'courseId': course_id,
                'title': topic['homework']['title'],
                'description': topic['homework']['description'],
                'dueDate': None,  # Se asigna al publicar
                'points': topic['homework']['points'],
                'status': 'Pendiente',
                'classroomUrl': '',
                'instructions': topic['homework']['description']
            }
            plan_data['tasks'].append(task)
    
    # Guardar archivo
    output_file = 'aula_planner_import.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(plan_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exportado a {output_file}")
    print(f"📊 Estadísticas:")
    print(f"   - Sesiones: {len(plan_data['sessions'])}")
    print(f"   - Tareas: {len(plan_data['tasks'])}")
    print(f"\n💡 Para importar manualmente:")
    print(f"   1. Abre el planificador")
    print(f"   2. Ve a Configuración > Importar copia")
    print(f"   3. Selecciona el archivo {output_file}")
    
    return output_file

def main():
    """Función principal."""
    print("="*60)
    print("🎓 IMPORTADOR DE CURRICULUM POO - AULA PLANNER")
    print("="*60)
    
    # Cargar curriculum
    curriculum = load_curriculum()
    
    if not curriculum['course']:
        print("❌ Error: No se pudo cargar el curriculum")
        print("   Asegúrate de que los archivos JSON estén presentes:")
        print("   - poo_curriculum.json")
        print("   - poo_curriculum_extended.json")
        print("   - poo_curriculum_units3_4.json")
        sys.exit(1)
    
    print(f"✅ Curriculum cargado: {curriculum['course']['name']}")
    print(f"📊 Total de unidades: {len(curriculum['units'])}")
    
    # Opciones de importación
    print("\n🔧 Opciones de importación:")
    print("1. Exportar a formato del planificador (recomendado para ahora)")
    print("2. Importar directamente a Supabase (requiere backend configurado)")
    
    try:
        opcion = input("\nSelecciona una opción (1 o 2): ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\n👋 Cancelado por el usuario")
        sys.exit(0)
    
    if opcion == '1':
        # Exportar a formato del planificador
        export_to_plan_format(curriculum)
    elif opcion == '2':
        # Importar a Supabase (requiere backend)
        print("\n⚠️  Esta opción requiere el backend de Supabase configurado.")
        print("   Asegúrate de:")
        print("   1. Tener el backend configurado (ver IMPLEMENTATION_GUIDE.md)")
        print("   2. Estar autenticado")
        print("   3. Tener las dependencias instaladas")
        
        try:
            confirm = input("\n¿Continuar? (s/n): ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print("\n👋 Cancelado")
            sys.exit(0)
        
        if confirm == 's':
            # user = getCurrentUser()
            # if not user:
            #     print("❌ Error: No hay usuario autenticado")
            #     sys.exit(1)
            # 
            # create_course_structure(curriculum, user['id'])
            print("⚠️  Funcionalidad no implementada aún.")
            print("   Descomenta el código en import_curriculum.py cuando tengas el backend listo.")
        else:
            print("👋 Cancelado")
    else:
        print("❌ Opción inválida")
        sys.exit(1)

if __name__ == '__main__':
    main()
