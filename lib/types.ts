/** Tipos del dominio Clínica (espejo del esquema de Supabase). */

export interface Owner {
  id: string;
  full_name: string;
  cedula: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birthdate: string | null;
  weight_kg: number | null;
  color: string | null;
  allergies: string | null;
  microchip: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  scheduled_at: string;
  reason: string;
  status: "programada" | "completada" | "cancelada";
  vet_name: string | null;
  notes: string | null;
  price: number | null;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  pet_id: string;
  type: string;
  title: string;
  description: string | null;
  diagnosis: string | null;
  treatment: string | null;
  vet_name: string | null;
  price: number | null;
  occurred_at: string;
  created_at: string;
}

export interface Vaccination {
  id: string;
  pet_id: string;
  vaccine: string;
  applied_at: string;
  next_due: string | null;
  vet_name: string | null;
  lot: string | null;
  created_at: string;
}

export interface Hospitalization {
  id: string;
  pet_id: string;
  reason: string;
  status: "estable" | "en observación" | "crítico" | "recuperación";
  treatment: string | null;
  notes: string | null;
  vet_name: string | null;
  admitted_at: string;
  discharged_at: string | null;
  created_at: string;
}

export interface PrescriptionItem {
  medication: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  pet_id: string;
  vet_name: string;
  issued_at: string;
  items: PrescriptionItem[];
  instructions: string | null;
  created_at: string;
}

export interface PetPhoto {
  id: string;
  pet_id: string;
  storage_path: string;
  caption: string | null;
  taken_at: string;
  created_at: string;
}

export type EventKind =
  | "hotel_checkin"
  | "hotel_checkout"
  | "grooming"
  | "vaccine"
  | "consultation"
  | "hospitalization"
  | "discharge"
  | "photo"
  | "appointment";

export interface PetEvent {
  id: string;
  pet_id: string;
  kind: EventKind;
  title: string;
  description: string | null;
  amount: number | null;
  occurred_at: string;
  created_at: string;
}

/** Mascota con su dueño (join). */
export interface PetWithOwner extends Pet {
  owner: Owner;
}

/** Dueño con sus mascotas. */
export interface OwnerWithPets extends Owner {
  pets: Pet[];
}

// ───────────────────────── Hotel ─────────────────────────

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price_per_night: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export type StayStatus = "reservada" | "en_curso" | "finalizada" | "cancelada";

export interface Stay {
  id: string;
  pet_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  status: StayStatus;
  price_per_night: number;
  notes: string | null;
  created_at: string;
}

export interface StayFull extends Stay {
  pet: PetWithOwner;
  room: Room;
}

export interface DailyReport {
  id: string;
  stay_id: string;
  pet_id: string;
  report_date: string;
  mood: string;
  message: string;
  activities: string[];
  photo_path: string | null;
  created_at: string;
}

// ───────────────────────── Peluquería ─────────────────────────

export interface GroomingAppointment {
  id: string;
  pet_id: string;
  scheduled_at: string;
  service: string;
  groomer: string | null;
  status: "programada" | "en_proceso" | "completada" | "cancelada";
  price: number | null;
  notes: string | null;
  created_at: string;
}

export interface GroomingAppointmentFull extends GroomingAppointment {
  pet: PetWithOwner;
}

export interface GroomingService {
  id: string;
  pet_id: string;
  service: string;
  groomer: string | null;
  price: number | null;
  notes: string | null;
  performed_at: string;
  created_at: string;
}

export interface GroomingPreferences {
  pet_id: string;
  cut_type: string | null;
  products: string | null;
  frequency_weeks: number | null;
  groomer_pref: string | null;
  notes: string | null;
  updated_at: string;
}

export interface GroomingPhoto {
  id: string;
  pet_id: string;
  service_label: string | null;
  before_path: string;
  after_path: string;
  caption: string | null;
  created_at: string;
}

export interface GroomingPhotoFull extends GroomingPhoto {
  pet: PetWithOwner;
}

// ───────────────────────── Administración ─────────────────────────

export interface Employee {
  id: string;
  full_name: string;
  role: string;
  area: string;
  cedula: string | null;
  phone: string | null;
  email: string | null;
  salary: number | null;
  hired_on: string | null;
  vacation_total: number;
  vacation_taken: number;
  status: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  min_stock: number;
  price: number | null;
  expiry_date: string | null;
  supplier: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  category: string;
  area: string;
  description: string | null;
  amount: number;
  spent_on: string;
  created_at: string;
}

export interface InvoiceItem {
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface Invoice {
  id: string;
  ncf: string;
  ncf_type: string;
  customer_name: string;
  customer_rnc: string | null;
  area: string;
  subtotal: number;
  itbis: number;
  total: number;
  status: string;
  items: InvoiceItem[];
  issued_at: string;
}

export interface WhatsAppLog {
  id: string;
  to_name: string;
  to_phone: string | null;
  message: string;
  kind: string;
  sent_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string | null;
  detail: string | null;
  created_at: string;
}

export interface Backup {
  id: string;
  status: string;
  size_mb: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  role: "admin" | "cliente";
  expires_at: string | null;
  created_at: string;
}
