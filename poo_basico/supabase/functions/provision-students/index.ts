import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedTeacherId = "3d54855e-5db9-44f2-89e0-36053a5e2608";
const roster = [
  { name: "Alvarez Montes, Santiago Felipe", username: "santiago.alvarez" },
  { name: "Celada Calderon, Santiago Josué", username: "santiago.celada" },
  { name: "Jiménez Vásquez, Leonardo Jefté", username: "leonardo.jimenez" },
  { name: "López Sum, Marcco Sammuel", username: "marcco.lopez" },
  { name: "Maldonado Cahuex, Luis Pedro", username: "luis.maldonado" },
  { name: "Pérez Cruz, Erick Abimael", username: "erick.perez" },
  { name: "Villagrán Escobar, Miguel Adrian", username: "miguel.villagran" },
];
const internalDomain = "alumnos.4to-computacion.test";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newPassword = () => "Aula-" + Array.from(crypto.getRandomValues(new Uint8Array(9)), b => alphabet[b % alphabet.length]).join("") + "!";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return Response.json({ error: "Método no permitido." }, { status: 405 });
  const authorization = req.headers.get("Authorization");
  if (!authorization) return Response.json({ error: "Se requiere una sesión docente." }, { status: 401 });
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return Response.json({ error: "Falta configuración segura del servidor." }, { status: 500 });

  const caller = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const token = authorization.replace(/^Bearer\s+/i, "");
  const { data: userData, error: userError } = await caller.auth.getUser(token);
  if (userError || !userData.user || userData.user.id !== allowedTeacherId) {
    return Response.json({ error: "Solo la cuenta docente autorizada puede crear estas cuentas." }, { status: 403 });
  }
  const { data: profile, error: profileError } = await caller.from("teacher_profiles").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (profileError || !profile) return Response.json({ error: "La cuenta no está habilitada como docente." }, { status: 403 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: classRows, error: classError } = await admin.from("learning_classes")
    .select("id,name").eq("teacher_id", allowedTeacherId)
    .in("name", ["Laboratorio 2", "Mantenimiento y Reparación"]);
  if (classError) return Response.json({ error: "No se pudieron localizar las dos clases.", detail: classError.message }, { status: 500 });
  const classIds = new Map((classRows || []).map(c => [c.name, c.id]));
  if (!classIds.has("Laboratorio 2") || !classIds.has("Mantenimiento y Reparación")) {
    return Response.json({ error: "Falta la clase Laboratorio 2 o Mantenimiento y Reparación." }, { status: 409 });
  }

  const results = [];
  for (const student of roster) {
    const email = student.username + "@" + internalDomain;
    let existing = null;
    for (let page = 1; page <= 10 && !existing; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return Response.json({ error: "No se pudo consultar el registro de alumnos.", detail: error.message }, { status: 500 });
      existing = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase()) || null;
      if (data.users.length < 1000) break;
    }

    let studentId;
    let password = "";
    let newlyProvisioned = false;
    if (existing) {
      studentId = existing.id;
      if (existing.app_metadata?.provisioned_by_teacher_id !== allowedTeacherId) {
        results.push({ name: student.name, username: student.username, status: "conflict" });
        continue;
      }
      if (existing.app_metadata?.accounts_setup_complete !== true) {
        password = newPassword();
        const { error } = await admin.auth.admin.updateUserById(studentId, {
          password, email_confirm: true,
          user_metadata: { ...existing.user_metadata, full_name: student.name, username: student.username },
          app_metadata: { ...existing.app_metadata, provisioned_by_teacher_id: allowedTeacherId },
        });
        if (error) return Response.json({ error: "No se pudo completar la cuenta de " + student.name + ".", detail: error.message }, { status: 500 });
        newlyProvisioned = true;
      }
    } else {
      password = newPassword();
      const { data, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: student.name, username: student.username },
        app_metadata: { provisioned_by_teacher_id: allowedTeacherId, accounts_setup_complete: false },
      });
      if (error || !data.user) return Response.json({ error: "No se pudo crear la cuenta de " + student.name + ".", detail: error?.message || "Sin usuario devuelto." }, { status: 500 });
      studentId = data.user.id;
      newlyProvisioned = true;
    }

    for (const className of ["Laboratorio 2", "Mantenimiento y Reparación"]) {
      const classId = classIds.get(className);
      const { data: membership, error: membershipError } = await admin.from("class_memberships")
        .select("id,status").eq("class_id", classId).eq("student_id", studentId).maybeSingle();
      if (membershipError) return Response.json({ error: "No se pudo revisar la inscripción de " + student.name + ".", detail: membershipError.message }, { status: 500 });
      if (membership) {
        if (membership.status !== "active") {
          const { error } = await admin.from("class_memberships").update({ status: "active", student_name: student.name }).eq("id", membership.id);
          if (error) return Response.json({ error: "No se pudo activar una inscripción.", detail: error.message }, { status: 500 });
        }
      } else {
        const { error } = await admin.from("class_memberships").insert({ class_id: classId, student_id: studentId, student_name: student.name, status: "active" });
        if (error) return Response.json({ error: "Falló la inscripción de " + student.name + ".", detail: error.message }, { status: 500 });
      }
    }
    if (newlyProvisioned) {
      const { error } = await admin.auth.admin.updateUserById(studentId, {
        app_metadata: { provisioned_by_teacher_id: allowedTeacherId, accounts_setup_complete: true },
      });
      if (error) return Response.json({ error: "Las inscripciones se guardaron, pero no se pudo cerrar el alta de " + student.name + ".", detail: error.message }, { status: 500 });
    }
    results.push({ name: student.name, username: student.username, ...(password ? { password } : {}), status: password ? "ready" : "already_exists" });
  }
  return Response.json({ ok: true, classes: ["Laboratorio 2", "Mantenimiento y Reparación"], accounts: results });
});
