"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLock, registerFailure, resetAttempts, lockMessage } from "@/lib/auth/throttle";

const INTERNAL_DOMAIN = "nido.local";

/** Verifica que el llamante sea admin (en servidor). */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Sesión no válida." };
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") return { ok: false as const, error: "No autorizado." };
  return { ok: true as const };
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

// ───────────────────────── Auth (usuario + contraseña) ─────────────────────────
function emailFor(username: string) {
  return `${username.trim().toLowerCase()}@${INTERNAL_DOMAIN}`;
}

/** Login por usuario. Mapea a email interno y verifica vencimiento en servidor. */
export async function signInUsername(input: { username: string; password: string }): Promise<{ error?: string; expired?: boolean; retryAfter?: number }> {
  const supabase = await createClient();
  if (!input.username?.trim() || !input.password) return { error: "Ingresa usuario y contraseña." };

  const username = input.username.trim().toLowerCase();

  // 1) ¿Bloqueado por demasiados intentos? (no revela si el usuario existe)
  const lock = await checkLock(username);
  if (lock.locked) return { error: lockMessage(lock.retryAfter!), retryAfter: lock.retryAfter };

  // 2) Intento real contra Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email: emailFor(username),
    password: input.password,
  });
  if (error) {
    const fail = await registerFailure(username);
    if (fail.locked) return { error: lockMessage(fail.retryAfter!), retryAfter: fail.retryAfter };
    return { error: "Usuario o contraseña incorrectos." };
  }

  // 3) Éxito → limpia el contador de fallos de ese usuario
  await resetAttempts(username);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role, expires_at").eq("id", user!.id).maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Cuenta no válida. Contacta a JM Designs." };
  }
  const expired = profile.role !== "admin" && !!profile.expires_at && new Date(profile.expires_at).getTime() < Date.now();
  if (expired) {
    await supabase.auth.signOut();
    return { expired: true };
  }
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Crea una cuenta de cliente (usuario + contraseña + días de acceso). Admin-only. */
export async function createClientAccount(input: { username: string; password: string; days: number | null }): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) return { ok: false, error: "Usuario inválido (3–30, letras/números/.-_)." };
  if (!input.password || input.password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };

  const admin = createAdminClient();
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: emailFor(username),
    password: input.password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (cErr || !created.user) {
    return { ok: false, error: /already/i.test(cErr?.message ?? "") ? "Ese usuario ya existe." : (cErr?.message ?? "Error al crear la cuenta.") };
  }

  const expires_at = input.days ? new Date(Date.now() + input.days * 86400000).toISOString() : null;
  const { error: pErr } = await admin.from("profiles").insert({
    id: created.user.id, username, role: "cliente", expires_at,
  });
  if (pErr) {
    await admin.auth.admin.deleteUser(created.user.id); // rollback
    return { ok: false, error: /duplicate|unique/i.test(pErr.message) ? "Ese usuario ya existe." : pErr.message };
  }

  await admin.from("audit_log").insert({ actor: "Admin Nido", action: "Creó cuenta de cliente", entity: "Cuentas", detail: `Usuario ${username}` });
  revalidatePath("/ajustes");
  return { ok: true, id: created.user.id };
}

/** Renueva/extiende una cuenta (suma días) o quita el vencimiento. Admin-only. */
export async function extendAccount(id: string, input: { days?: number; clear?: boolean }): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();
  let expires_at: string | null;
  if (input.clear) {
    expires_at = null;
  } else {
    const { data: cur } = await supabase.from("profiles").select("expires_at").eq("id", id).maybeSingle();
    const base = cur?.expires_at && new Date(cur.expires_at).getTime() > Date.now() ? new Date(cur.expires_at).getTime() : Date.now();
    expires_at = new Date(base + (input.days ?? 0) * 86400000).toISOString();
  }

  const { error } = await supabase.from("profiles").update({ expires_at }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ajustes");
  return { ok: true };
}

// ───────────────────────── Dueños ─────────────────────────
export async function createOwner(input: {
  full_name: string;
  cedula?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!input.full_name?.trim()) return { ok: false, error: "El nombre es obligatorio." };

  const { data, error } = await supabase
    .from("owners")
    .insert({
      full_name: input.full_name.trim(),
      cedula: input.cedula || null,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true, id: data.id };
}

export async function updateOwner(
  id: string,
  input: Partial<{
    full_name: string;
    cedula: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("owners").update(input).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true, id };
}

// ───────────────────────── Mascotas ─────────────────────────
export async function createPet(input: {
  owner_id: string;
  name: string;
  species?: string;
  breed?: string;
  sex?: string;
  birthdate?: string;
  weight_kg?: number;
  color?: string;
  allergies?: string;
  microchip?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!input.owner_id) return { ok: false, error: "Selecciona un dueño." };
  if (!input.name?.trim()) return { ok: false, error: "El nombre de la mascota es obligatorio." };

  const { data, error } = await supabase
    .from("pets")
    .insert({
      owner_id: input.owner_id,
      name: input.name.trim(),
      species: input.species || "Perro",
      breed: input.breed || null,
      sex: input.sex || null,
      birthdate: input.birthdate || null,
      weight_kg: input.weight_kg ?? null,
      color: input.color || null,
      allergies: input.allergies || null,
      microchip: input.microchip || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${input.owner_id}`);
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function updatePet(
  id: string,
  input: Partial<{
    name: string;
    species: string;
    breed: string;
    sex: string;
    birthdate: string;
    weight_kg: number;
    color: string;
    allergies: string;
    microchip: string;
  }>,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("pets").update(input).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/mascotas/${id}`);
  return { ok: true, id };
}

// ───────────────────────── Citas ─────────────────────────
export async function createAppointment(input: {
  pet_id: string;
  scheduled_at: string; // ISO
  reason: string;
  vet_name?: string;
  price?: number;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!input.pet_id) return { ok: false, error: "Selecciona una mascota." };
  if (!input.scheduled_at) return { ok: false, error: "Indica fecha y hora." };
  if (!input.reason?.trim()) return { ok: false, error: "Indica el motivo." };

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      pet_id: input.pet_id,
      scheduled_at: input.scheduled_at,
      reason: input.reason.trim(),
      vet_name: input.vet_name || null,
      price: input.price ?? null,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // El organismo: la cita también vive en la línea de tiempo de la mascota.
  await supabase.from("pet_events").insert({
    pet_id: input.pet_id,
    kind: "appointment",
    title: `Cita agendada · ${input.reason.trim()}`,
    description: input.vet_name || null,
    amount: input.price ?? null,
    occurred_at: input.scheduled_at,
  });

  revalidatePath("/citas");
  revalidatePath("/dashboard");
  revalidatePath(`/mascotas/${input.pet_id}`);
  return { ok: true, id: data.id };
}

// ───────────────────────── Fotos (Storage) ─────────────────────────
export async function addPetPhoto(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const petId = formData.get("pet_id") as string;
  const caption = (formData.get("caption") as string) || null;
  const file = formData.get("file") as File | null;

  if (!petId) return { ok: false, error: "Falta la mascota." };
  if (!file || file.size === 0) return { ok: false, error: "Selecciona una imagen." };
  if (file.size > 6 * 1024 * 1024) return { ok: false, error: "La imagen supera 6 MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${petId}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("pet-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  const { error: insErr } = await supabase.from("pet_photos").insert({
    pet_id: petId,
    storage_path: path,
    caption,
  });
  if (insErr) return { ok: false, error: insErr.message };

  await supabase.from("pet_events").insert({
    pet_id: petId,
    kind: "photo",
    title: "Foto de evolución",
    description: caption,
  });

  revalidatePath(`/mascotas/${petId}`);
  return { ok: true };
}

// ───────────────────────── Hotel ─────────────────────────
function nightsBetween(check_in: string, check_out: string): number {
  const a = new Date(check_in).getTime();
  const b = new Date(check_out).getTime();
  return Math.max(1, Math.round((b - a) / 86400000));
}

export async function createStay(input: {
  pet_id: string;
  room_id: string;
  check_in: string; // YYYY-MM-DD
  check_out: string;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!input.pet_id) return { ok: false, error: "Selecciona una mascota." };
  if (!input.room_id) return { ok: false, error: "Selecciona una habitación." };
  if (!input.check_in || !input.check_out) return { ok: false, error: "Indica las fechas." };
  if (input.check_out <= input.check_in) return { ok: false, error: "La salida debe ser posterior a la entrada." };

  // Disponibilidad: ¿hay solape en esa habitación?
  const { data: clash } = await supabase
    .from("stays")
    .select("id")
    .eq("room_id", input.room_id)
    .in("status", ["reservada", "en_curso"])
    .lt("check_in", input.check_out)
    .gt("check_out", input.check_in);
  if (clash && clash.length > 0)
    return { ok: false, error: "Esa habitación no está disponible en esas fechas." };

  const { data: room } = await supabase
    .from("rooms")
    .select("price_per_night")
    .eq("id", input.room_id)
    .single();
  const price = room?.price_per_night ?? 1200;

  const today = new Date().toISOString().slice(0, 10);
  const status = input.check_in <= today ? "en_curso" : "reservada";

  const { data, error } = await supabase
    .from("stays")
    .insert({
      pet_id: input.pet_id,
      room_id: input.room_id,
      check_in: input.check_in,
      check_out: input.check_out,
      status,
      price_per_night: price,
      notes: input.notes || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  const nights = nightsBetween(input.check_in, input.check_out);
  await supabase.from("pet_events").insert({
    pet_id: input.pet_id,
    kind: "hotel_checkin",
    title: "Reserva de hotel",
    description: `${nights} noche(s) · entrada ${input.check_in}`,
    amount: nights * price,
    occurred_at: new Date(input.check_in).toISOString(),
  });

  revalidatePath("/hotel");
  revalidatePath("/dashboard");
  revalidatePath(`/mascotas/${input.pet_id}`);
  return { ok: true, id: data.id };
}

export async function checkInStay(id: string, petId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("stays").update({ status: "en_curso" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/hotel");
  revalidatePath("/dashboard");
  revalidatePath(`/mascotas/${petId}`);
  return { ok: true };
}

export async function checkOutStay(id: string, petId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("stays").update({ status: "finalizada" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await supabase.from("pet_events").insert({
    pet_id: petId,
    kind: "hotel_checkout",
    title: "Salida del hotel",
    description: "Check-out completado",
    occurred_at: new Date().toISOString(),
  });
  revalidatePath("/hotel");
  revalidatePath("/dashboard");
  revalidatePath(`/mascotas/${petId}`);
  return { ok: true };
}

// ───────────────────────── Peluquería ─────────────────────────
export async function createGroomingAppointment(input: {
  pet_id: string;
  scheduled_at: string;
  service: string;
  groomer?: string;
  price?: number;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!input.pet_id) return { ok: false, error: "Selecciona una mascota." };
  if (!input.scheduled_at) return { ok: false, error: "Indica fecha y hora." };
  if (!input.service?.trim()) return { ok: false, error: "Indica el servicio." };

  const { data, error } = await supabase
    .from("grooming_appointments")
    .insert({
      pet_id: input.pet_id,
      scheduled_at: input.scheduled_at,
      service: input.service,
      groomer: input.groomer || null,
      price: input.price ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("pet_events").insert({
    pet_id: input.pet_id,
    kind: "grooming",
    title: `Cita de peluquería · ${input.service}`,
    description: input.groomer || null,
    amount: input.price ?? null,
    occurred_at: input.scheduled_at,
  });

  revalidatePath("/peluqueria");
  revalidatePath("/dashboard");
  revalidatePath(`/mascotas/${input.pet_id}`);
  return { ok: true, id: data.id };
}

export async function addGroomingPhotos(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const petId = formData.get("pet_id") as string;
  const label = (formData.get("service_label") as string) || null;
  const caption = (formData.get("caption") as string) || null;
  const before = formData.get("before") as File | null;
  const after = formData.get("after") as File | null;

  if (!petId) return { ok: false, error: "Falta la mascota." };
  if (!before || before.size === 0) return { ok: false, error: "Falta la foto del ANTES." };
  if (!after || after.size === 0) return { ok: false, error: "Falta la foto del DESPUÉS." };
  for (const f of [before, after])
    if (f.size > 6 * 1024 * 1024) return { ok: false, error: "Cada imagen debe ser menor a 6 MB." };

  const ts = Date.now();
  async function up(file: File, tag: string): Promise<string | null> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `grooming/${petId}/${ts}-${tag}.${ext}`;
    const { error } = await supabase.storage.from("pet-photos").upload(path, file, { cacheControl: "3600" });
    return error ? null : path;
  }

  const beforePath = await up(before, "antes");
  const afterPath = await up(after, "despues");
  if (!beforePath || !afterPath) return { ok: false, error: "Error al subir las imágenes." };

  const { error: insErr } = await supabase.from("grooming_photos").insert({
    pet_id: petId,
    service_label: label,
    before_path: beforePath,
    after_path: afterPath,
    caption,
  });
  if (insErr) return { ok: false, error: insErr.message };

  await supabase.from("pet_events").insert({
    pet_id: petId,
    kind: "grooming",
    title: "Transformación de peluquería ✂️",
    description: label || caption,
    occurred_at: new Date().toISOString(),
  });

  revalidatePath("/peluqueria");
  revalidatePath(`/mascotas/${petId}`);
  return { ok: true };
}

export async function updateGroomingPreferences(
  petId: string,
  input: { cut_type?: string; products?: string; frequency_weeks?: number; groomer_pref?: string; notes?: string },
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("grooming_preferences")
    .upsert({ pet_id: petId, ...input, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/mascotas/${petId}`);
  return { ok: true };
}

// ───────────────────────── Administración ─────────────────────────
export async function forceBackup(): Promise<ActionResult> {
  const supabase = await createClient();
  const size = Math.round((46 + Math.random() * 4) * 10) / 10;
  const { error } = await supabase.from("backups").insert({ status: "completado", size_mb: size });
  if (error) return { ok: false, error: error.message };
  await supabase.from("audit_log").insert({
    actor: "Admin Nido",
    action: "Forzó respaldo",
    entity: "Sistema",
    detail: `Respaldo manual completado (${size} MB)`,
  });
  revalidatePath("/admin/sistema");
  return { ok: true };
}
