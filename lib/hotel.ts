/** Lógica de hotel compartida (cliente + servidor). */

export function hotelToday(): string {
  const n = new Date();
  return `${n.getFullYear()}-${`${n.getMonth() + 1}`.padStart(2, "0")}-${`${n.getDate()}`.padStart(2, "0")}`;
}

export function nights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(1, Math.round((b - a) / 86400000));
}

/** ¿Se solapan dos rangos [aIn,aOut) y [bIn,bOut)? (fechas YYYY-MM-DD) */
export function rangesOverlap(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && aOut > bIn;
}

/** ¿La estadía está activa hoy (huésped presente)? */
export function stayActiveToday(s: { check_in: string; check_out: string; status: string }): boolean {
  const t = hotelToday();
  return s.status !== "cancelada" && s.status !== "finalizada" && s.check_in <= t && s.check_out > t;
}
