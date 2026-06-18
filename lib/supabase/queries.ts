import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Owner,
  Pet,
  PetWithOwner,
  OwnerWithPets,
  Appointment,
  MedicalRecord,
  Vaccination,
  Hospitalization,
  Prescription,
  PetPhoto,
  PetEvent,
} from "@/lib/types";

/** Dueños con sus mascotas (búsqueda opcional por nombre/cédula/teléfono). */
export async function getOwnersWithPets(search?: string): Promise<OwnerWithPets[]> {
  const supabase = await createClient();
  let q = supabase
    .from("owners")
    .select("*, pets(*)")
    .order("created_at", { ascending: false });

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    q = q.or(`full_name.ilike.${s},cedula.ilike.${s},phone.ilike.${s}`);
  }
  const { data } = await q;
  return (data as OwnerWithPets[]) ?? [];
}

export async function getOwner(id: string): Promise<OwnerWithPets | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("owners")
    .select("*, pets(*)")
    .eq("id", id)
    .single();
  return (data as OwnerWithPets) ?? null;
}

export async function getOwnersList(): Promise<Owner[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("owners").select("*").order("full_name");
  return (data as Owner[]) ?? [];
}

/** Mascotas con dueño (para listados y buscador). */
export async function getPetsWithOwner(search?: string): Promise<PetWithOwner[]> {
  const supabase = await createClient();
  let q = supabase
    .from("pets")
    .select("*, owner:owners(*)")
    .order("created_at", { ascending: false });

  if (search && search.trim()) {
    q = q.ilike("name", `%${search.trim()}%`);
  }
  const { data } = await q;
  return (data as PetWithOwner[]) ?? [];
}

export interface PetFull extends PetWithOwner {
  records: MedicalRecord[];
  vaccinations: Vaccination[];
  hospitalizations: Hospitalization[];
  prescriptions: Prescription[];
  photos: PetPhoto[];
  events: PetEvent[];
}

/** Ficha completa de una mascota (todo lo que cuelga de ella). */
export async function getPetFull(id: string): Promise<PetFull | null> {
  const supabase = await createClient();
  const { data: pet } = await supabase
    .from("pets")
    .select("*, owner:owners(*)")
    .eq("id", id)
    .single();
  if (!pet) return null;

  const [records, vaccinations, hospitalizations, prescriptions, photos, events] =
    await Promise.all([
      supabase.from("medical_records").select("*").eq("pet_id", id).order("occurred_at", { ascending: false }),
      supabase.from("vaccinations").select("*").eq("pet_id", id).order("applied_at", { ascending: false }),
      supabase.from("hospitalizations").select("*").eq("pet_id", id).order("admitted_at", { ascending: false }),
      supabase.from("prescriptions").select("*").eq("pet_id", id).order("issued_at", { ascending: false }),
      supabase.from("pet_photos").select("*").eq("pet_id", id).order("taken_at", { ascending: false }),
      supabase.from("pet_events").select("*").eq("pet_id", id).order("occurred_at", { ascending: false }),
    ]);

  return {
    ...(pet as PetWithOwner),
    records: (records.data as MedicalRecord[]) ?? [],
    vaccinations: (vaccinations.data as Vaccination[]) ?? [],
    hospitalizations: (hospitalizations.data as Hospitalization[]) ?? [],
    prescriptions: (prescriptions.data as Prescription[]) ?? [],
    photos: (photos.data as PetPhoto[]) ?? [],
    events: (events.data as PetEvent[]) ?? [],
  };
}

export interface AppointmentWithPet extends Appointment {
  pet: PetWithOwner;
}

export async function getAppointments(): Promise<AppointmentWithPet[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("*, pet:pets(*, owner:owners(*))")
    .order("scheduled_at", { ascending: true });
  return (data as AppointmentWithPet[]) ?? [];
}

export async function getTodayAppointments(): Promise<AppointmentWithPet[]> {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const { data } = await supabase
    .from("appointments")
    .select("*, pet:pets(*, owner:owners(*))")
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });
  return (data as AppointmentWithPet[]) ?? [];
}

export interface HospWithPet extends Hospitalization {
  pet: PetWithOwner;
}

export async function getActiveHospitalizations(): Promise<HospWithPet[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hospitalizations")
    .select("*, pet:pets(*, owner:owners(*))")
    .is("discharged_at", null)
    .order("admitted_at", { ascending: false });
  return (data as HospWithPet[]) ?? [];
}

export async function getHospitalizations(): Promise<HospWithPet[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hospitalizations")
    .select("*, pet:pets(*, owner:owners(*))")
    .order("discharged_at", { ascending: true, nullsFirst: true })
    .order("admitted_at", { ascending: false });
  return (data as HospWithPet[]) ?? [];
}

export interface RecentEvent {
  id: string;
  pet_id: string;
  kind: string;
  title: string;
  occurred_at: string;
  petName: string;
}

/** Eventos recientes (para el feed de actividad del dashboard). */
export async function getRecentEvents(limit = 6): Promise<RecentEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pet_events")
    .select("id, pet_id, kind, title, occurred_at, pet:pets(name)")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return (
    (data as { id: string; pet_id: string; kind: string; title: string; occurred_at: string; pet: { name: string } | null }[] | null) ?? []
  ).map((e) => ({
    id: e.id,
    pet_id: e.pet_id,
    kind: e.kind,
    title: e.title,
    occurred_at: e.occurred_at,
    petName: e.pet?.name ?? "?",
  }));
}

/** Métricas en vivo para el dashboard (lee de las mismas tablas). */
export async function getDashboardLive() {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [hosp, todayAppts, revenueRows] = await Promise.all([
    supabase
      .from("hospitalizations")
      .select("pet:pets(name)")
      .is("discharged_at", null),
    supabase
      .from("appointments")
      .select("scheduled_at, reason, pet:pets(name)")
      .gte("scheduled_at", start.toISOString())
      .lt("scheduled_at", end.toISOString())
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("medical_records")
      .select("price, occurred_at")
      .gte("occurred_at", start.toISOString())
      .lt("occurred_at", end.toISOString()),
  ]);

  const hospNames =
    (hosp.data as { pet: { name: string } | null }[] | null)?.map(
      (h) => h.pet?.name ?? "?",
    ) ?? [];
  const appts = (todayAppts.data as { scheduled_at: string; reason: string; pet: { name: string } | null }[] | null) ?? [];
  const revenue =
    (revenueRows.data as { price: number | null }[] | null)?.reduce(
      (sum, r) => sum + (r.price ?? 0),
      0,
    ) ?? 0;

  return {
    hospitalizedCount: hospNames.length,
    hospitalizedNames: hospNames,
    todayCount: appts.length,
    nextAppointment: appts.find(
      (a) => new Date(a.scheduled_at).getTime() > Date.now(),
    ),
    revenueToday: revenue,
  };
}
