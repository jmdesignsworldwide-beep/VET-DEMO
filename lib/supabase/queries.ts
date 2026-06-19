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
  Room,
  Stay,
  StayFull,
  DailyReport,
  GroomingAppointmentFull,
  GroomingService,
  GroomingPreferences,
  GroomingPhoto,
  GroomingPhotoFull,
  Employee,
  InventoryItem,
  Expense,
  Invoice,
  WhatsAppLog,
  AuditLog,
  Backup,
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
  stays: (Stay & { room: Room })[];
  groomingServices: GroomingService[];
  groomingPhotos: GroomingPhoto[];
  groomingPref: GroomingPreferences | null;
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

  const [records, vaccinations, hospitalizations, prescriptions, photos, events, stays, gServices, gPhotos, gPref] =
    await Promise.all([
      supabase.from("medical_records").select("*").eq("pet_id", id).order("occurred_at", { ascending: false }),
      supabase.from("vaccinations").select("*").eq("pet_id", id).order("applied_at", { ascending: false }),
      supabase.from("hospitalizations").select("*").eq("pet_id", id).order("admitted_at", { ascending: false }),
      supabase.from("prescriptions").select("*").eq("pet_id", id).order("issued_at", { ascending: false }),
      supabase.from("pet_photos").select("*").eq("pet_id", id).order("taken_at", { ascending: false }),
      supabase.from("pet_events").select("*").eq("pet_id", id).order("occurred_at", { ascending: false }),
      supabase.from("stays").select("*, room:rooms(*)").eq("pet_id", id).order("check_in", { ascending: false }),
      supabase.from("grooming_services").select("*").eq("pet_id", id).order("performed_at", { ascending: false }),
      supabase.from("grooming_photos").select("*").eq("pet_id", id).order("created_at", { ascending: false }),
      supabase.from("grooming_preferences").select("*").eq("pet_id", id).maybeSingle(),
    ]);

  return {
    ...(pet as PetWithOwner),
    records: (records.data as MedicalRecord[]) ?? [],
    vaccinations: (vaccinations.data as Vaccination[]) ?? [],
    hospitalizations: (hospitalizations.data as Hospitalization[]) ?? [],
    prescriptions: (prescriptions.data as Prescription[]) ?? [],
    photos: (photos.data as PetPhoto[]) ?? [],
    events: (events.data as PetEvent[]) ?? [],
    stays: (stays.data as (Stay & { room: Room })[]) ?? [],
    groomingServices: (gServices.data as GroomingService[]) ?? [],
    groomingPhotos: (gPhotos.data as GroomingPhoto[]) ?? [],
    groomingPref: (gPref.data as GroomingPreferences) ?? null,
  };
}

// ───────────────────────── Peluquería ─────────────────────────

export interface GroomingData {
  appointments: GroomingAppointmentFull[];
  photos: GroomingPhotoFull[];
}

export async function getGroomingData(): Promise<GroomingData> {
  const supabase = await createClient();
  const [appointments, photos] = await Promise.all([
    supabase
      .from("grooming_appointments")
      .select("*, pet:pets(*, owner:owners(*))")
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("grooming_photos")
      .select("*, pet:pets(*, owner:owners(*))")
      .order("created_at", { ascending: false }),
  ]);
  return {
    appointments: (appointments.data as GroomingAppointmentFull[]) ?? [],
    photos: (photos.data as GroomingPhotoFull[]) ?? [],
  };
}

// ───────────────────────── Administración ─────────────────────────

export type FinancePeriod = "hoy" | "semana" | "mes";

function periodRange(period: FinancePeriod) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === "semana") start.setDate(start.getDate() - 6);
  else if (period === "mes") start.setDate(start.getDate() - 29);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function localDay(d: Date) {
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

export interface FinanceData {
  income: number;
  expense: number;
  balance: number;
  invoiceCount: number;
  byArea: { area: string; ingresos: number }[];
  series: { label: string; ingresos: number; gastos: number }[];
}

export async function getFinance(period: FinancePeriod): Promise<FinanceData> {
  const supabase = await createClient();
  const { start, end } = periodRange(period);

  const [inv, exp] = await Promise.all([
    supabase.from("invoices").select("area, total, issued_at").gte("issued_at", start.toISOString()).lte("issued_at", end.toISOString()),
    supabase.from("expenses").select("amount, spent_on").gte("spent_on", localDay(start)).lte("spent_on", localDay(end)),
  ]);

  const invoices = (inv.data as { area: string; total: number; issued_at: string }[] | null) ?? [];
  const expenses = (exp.data as { amount: number; spent_on: string }[] | null) ?? [];

  const income = invoices.reduce((s, i) => s + Number(i.total), 0);
  const expense = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const areaMap: Record<string, number> = { Clínica: 0, Hotel: 0, Peluquería: 0 };
  for (const i of invoices) areaMap[i.area] = (areaMap[i.area] ?? 0) + Number(i.total);
  const byArea = Object.entries(areaMap).map(([area, ingresos]) => ({ area, ingresos }));

  // Serie diaria
  const days: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(localDay(new Date(d)));
  const incByDay: Record<string, number> = {};
  const expByDay: Record<string, number> = {};
  for (const i of invoices) {
    const k = localDay(new Date(i.issued_at));
    incByDay[k] = (incByDay[k] ?? 0) + Number(i.total);
  }
  for (const e of expenses) expByDay[e.spent_on] = (expByDay[e.spent_on] ?? 0) + Number(e.amount);
  const series = days.map((k) => {
    const dt = new Date(k + "T12:00:00");
    return {
      label: dt.toLocaleDateString("es-DO", { day: "2-digit", month: "short" }),
      ingresos: Math.round(incByDay[k] ?? 0),
      gastos: Math.round(expByDay[k] ?? 0),
    };
  });

  return { income, expense, balance: income - expense, invoiceCount: invoices.length, byArea, series };
}

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("invoices").select("*").order("issued_at", { ascending: false }).limit(60);
  return (data as Invoice[]) ?? [];
}

export async function getInventory(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("inventory_items").select("*").order("category").order("name");
  return (data as InventoryItem[]) ?? [];
}

export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("employees").select("*").order("area").order("full_name");
  return (data as Employee[]) ?? [];
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("employees").select("*").eq("id", id).single();
  return (data as Employee) ?? null;
}

export async function getWhatsappLog(): Promise<WhatsAppLog[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("whatsapp_log").select("*").order("sent_at", { ascending: false }).limit(40);
  return (data as WhatsAppLog[]) ?? [];
}

export async function getAuditLog(): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(40);
  return (data as AuditLog[]) ?? [];
}

export async function getBackups(): Promise<Backup[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("backups").select("*").order("created_at", { ascending: false }).limit(10);
  return (data as Backup[]) ?? [];
}

export interface ReportsData {
  byArea: { area: string; ingresos: number }[];
  topServices: { name: string; count: number }[];
}

export async function getReports(): Promise<ReportsData> {
  const supabase = await createClient();
  const [inv, groom, appts] = await Promise.all([
    supabase.from("invoices").select("area, total"),
    supabase.from("grooming_appointments").select("service"),
    supabase.from("appointments").select("reason"),
  ]);
  const areaMap: Record<string, number> = { Clínica: 0, Hotel: 0, Peluquería: 0 };
  for (const i of (inv.data as { area: string; total: number }[] | null) ?? [])
    areaMap[i.area] = (areaMap[i.area] ?? 0) + Number(i.total);
  const byArea = Object.entries(areaMap).map(([area, ingresos]) => ({ area, ingresos }));

  const counts: Record<string, number> = {};
  for (const g of (groom.data as { service: string }[] | null) ?? []) counts[g.service] = (counts[g.service] ?? 0) + 1;
  for (const a of (appts.data as { reason: string }[] | null) ?? []) counts[a.reason] = (counts[a.reason] ?? 0) + 1;
  const topServices = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return { byArea, topServices };
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

// ───────────────────────── Hotel ─────────────────────────

export interface HotelData {
  rooms: Room[];
  stays: StayFull[];
  reports: DailyReport[];
}

export async function getHotelData(): Promise<HotelData> {
  const supabase = await createClient();
  const [rooms, stays, reports] = await Promise.all([
    supabase.from("rooms").select("*").order("name"),
    supabase
      .from("stays")
      .select("*, pet:pets(*, owner:owners(*)), room:rooms(*)")
      .order("check_in", { ascending: false }),
    supabase.from("daily_reports").select("*").order("report_date", { ascending: false }),
  ]);
  return {
    rooms: (rooms.data as Room[]) ?? [],
    stays: (stays.data as StayFull[]) ?? [],
    reports: (reports.data as DailyReport[]) ?? [],
  };
}

function todayISODate(): string {
  const n = new Date();
  return `${n.getFullYear()}-${`${n.getMonth() + 1}`.padStart(2, "0")}-${`${n.getDate()}`.padStart(2, "0")}`;
}

/** Métricas en vivo para el dashboard (lee de las mismas tablas). */
export async function getDashboardLive() {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const today = todayISODate();

  const [hosp, todayAppts, revenueRows, guests, guestsGrooming] = await Promise.all([
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
    supabase
      .from("stays")
      .select("pet:pets(name)")
      .lte("check_in", today)
      .gt("check_out", today)
      .neq("status", "cancelada"),
    supabase
      .from("grooming_appointments")
      .select("status")
      .gte("scheduled_at", start.toISOString())
      .lt("scheduled_at", end.toISOString()),
  ]);

  const groomingRows = (guestsGrooming.data as { status: string }[] | null) ?? [];

  const hospNames =
    (hosp.data as { pet: { name: string } | null }[] | null)?.map(
      (h) => h.pet?.name ?? "?",
    ) ?? [];
  const guestNames =
    (guests.data as { pet: { name: string } | null }[] | null)?.map(
      (g) => g.pet?.name ?? "?",
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
    hotelGuestCount: guestNames.length,
    hotelGuestNames: guestNames,
    groomingTodayCount: groomingRows.length,
    groomingInProgress: groomingRows.filter((g) => g.status === "en_proceso").length,
    todayCount: appts.length,
    nextAppointment: appts.find(
      (a) => new Date(a.scheduled_at).getTime() > Date.now(),
    ),
    revenueToday: revenue,
  };
}
