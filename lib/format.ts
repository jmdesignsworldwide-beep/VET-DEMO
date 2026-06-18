/** Utilidades de formato (RD$, fechas, edad). */

export function rd(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return (
    "RD$ " +
    amount.toLocaleString("es-DO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-DO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Edad legible a partir de fecha de nacimiento. */
export function age(birthdate: string | null | undefined): string {
  if (!birthdate) return "Edad N/D";
  const b = new Date(birthdate);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years <= 0) return `${months} ${months === 1 ? "mes" : "meses"}`;
  return `${years} ${years === 1 ? "año" : "años"}`;
}

/** "hace X min/h/d" a partir de una fecha pasada. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

/** Minutos hasta una fecha futura (null si ya pasó). */
export function minutesUntil(iso: string): number | null {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  return Math.round(diff / 60000);
}

export function publicPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/pet-photos/${path}`;
}
