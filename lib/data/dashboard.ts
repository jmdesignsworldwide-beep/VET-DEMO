/** Datos de ejemplo (creíbles, dominicanos) para la Sala de Mando.
 *  Más adelante se reemplazan por consultas reales a Supabase. */

export interface Pet {
  name: string;
  breed: string;
}

export const hospitalized: Pet[] = [
  { name: "Max", breed: "Pastor Alemán" },
  { name: "Luna", breed: "Sato dominicano" },
  { name: "Bella", breed: "Golden Retriever" },
];

export const hotelGuests: Pet[] = [
  { name: "Rocky", breed: "Pitbull" },
  { name: "Coco", breed: "Poodle Toy" },
  { name: "Toby", breed: "Schnauzer" },
  { name: "Kira", breed: "Husky Siberiano" },
  { name: "Simba", breed: "Labrador" },
  { name: "Nina", breed: "Chihuahua" },
  { name: "Thor", breed: "Boxer" },
  { name: "Maya", breed: "Beagle" },
];

export const todayStats = {
  appointments: 24,
  nextInMin: 18,
  nextPet: "Luna",
  nextService: "Peluquería completa",
  revenue: 142800, // RD$
};

export interface AreaSummary {
  key: string;
  title: string;
  href: string;
  tone: "brand" | "accent";
  metrics: { label: string; value: string }[];
  highlight: string;
  fill: number; // 0–100 para barra
}

export const areas: AreaSummary[] = [
  {
    key: "clinica",
    title: "Clínica",
    href: "/citas",
    tone: "brand",
    metrics: [
      { label: "Consultas hoy", value: "14" },
      { label: "Internadas", value: "3" },
    ],
    highlight: "Próxima cirugía 15:30 · esterilización",
    fill: 72,
  },
  {
    key: "hotel",
    title: "Hotel canino",
    href: "/hotel",
    tone: "accent",
    metrics: [
      { label: "Ocupación", value: "86%" },
      { label: "Check-ins", value: "5" },
    ],
    highlight: "3 salidas programadas para hoy",
    fill: 86,
  },
  {
    key: "peluqueria",
    title: "Peluquería",
    href: "/peluqueria",
    tone: "brand",
    metrics: [
      { label: "En proceso", value: "2" },
      { label: "En cola", value: "5" },
    ],
    highlight: "Ingreso del día RD$ 28,400",
    fill: 58,
  },
];

export interface Activity {
  pet: string;
  text: string;
  ago: string;
  tone: "brand" | "accent" | "muted";
  live?: boolean;
}

export const activity: Activity[] = [
  { pet: "Bella", text: "ingresó a internamiento", ago: "ahora", tone: "accent", live: true },
  { pet: "Luna", text: "pago recibido · RD$ 3,500", ago: "hace 6 min", tone: "brand" },
  { pet: "Rocky", text: "check-in en el hotel", ago: "hace 14 min", tone: "brand" },
  { pet: "Coco", text: "terminó peluquería completa", ago: "hace 28 min", tone: "muted" },
  { pet: "Max", text: "control post-operatorio realizado", ago: "hace 41 min", tone: "muted" },
  { pet: "Toby", text: "reservó cita para mañana 10:00", ago: "hace 55 min", tone: "muted" },
];

export interface Appointment {
  time: string;
  pet: string;
  service: string;
  owner: string;
  tone: "brand" | "accent";
}

export const appointments: Appointment[] = [
  { time: "11:00", pet: "Luna", service: "Peluquería completa", owner: "M. Pérez", tone: "accent" },
  { time: "11:30", pet: "Rocky", service: "Check-in hotel", owner: "J. Santos", tone: "brand" },
  { time: "12:15", pet: "Coco", service: "Consulta general", owner: "A. Díaz", tone: "brand" },
  { time: "13:00", pet: "Bella", service: "Curación", owner: "R. Fernández", tone: "accent" },
  { time: "14:30", pet: "Toby", service: "Vacunación", owner: "L. Mateo", tone: "brand" },
];
