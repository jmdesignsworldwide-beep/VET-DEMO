"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

// ───────────────────────── Auth demo ─────────────────────────
export async function signInDemo() {
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: "demo@clinicanido.do",
    password: "NidoDemo2026!",
  });
  redirect("/dashboard");
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
