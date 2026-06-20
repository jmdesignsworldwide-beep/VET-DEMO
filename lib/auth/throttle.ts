import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Throttle de login por usuario (anti fuerza bruta).
 *
 * Cuenta los intentos fallidos por nombre de usuario y, a partir del
 * umbral, aplica un bloqueo temporal CRECIENTE: 30s → 1min → 5min.
 *
 * Persistido en la tabla `login_attempts` (RLS estricto), accedida solo
 * con el cliente admin (service_role) en el SERVIDOR — el cliente nunca
 * puede manipular el contador.
 *
 * Filosofía "fail-open": si el almacén de intentos no responde, NO
 * bloqueamos al usuario legítimo (preferimos disponibilidad). El login
 * normal de Supabase sigue funcionando aunque esta tabla falle o aún no
 * exista.
 */

const THRESHOLD = 5; // intentos fallidos permitidos antes del primer bloqueo
const TIERS = [30, 60, 300]; // segundos: 30s, 1min, 5min (el último se mantiene)

export interface ThrottleState {
  locked: boolean;
  /** Segundos restantes del bloqueo (solo si locked). */
  retryAfter?: number;
}

/** ¿El usuario está bloqueado ahora mismo? (no incrementa nada) */
export async function checkLock(username: string): Promise<ThrottleState> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("login_attempts")
      .select("locked_until")
      .eq("username", username)
      .maybeSingle();

    if (data?.locked_until) {
      const ms = new Date(data.locked_until).getTime() - Date.now();
      if (ms > 0) return { locked: true, retryAfter: Math.ceil(ms / 1000) };
    }
  } catch {
    // fail-open
  }
  return { locked: false };
}

/** Registra un intento fallido y aplica el bloqueo si toca. */
export async function registerFailure(username: string): Promise<ThrottleState> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("login_attempts")
      .select("fail_count")
      .eq("username", username)
      .maybeSingle();

    const fail = (data?.fail_count ?? 0) + 1;
    let lockedUntil: string | null = null;
    let retryAfter: number | undefined;

    if (fail >= THRESHOLD) {
      const tier = Math.min(fail - THRESHOLD, TIERS.length - 1); // 0,1,2 (capado)
      const secs = TIERS[tier];
      lockedUntil = new Date(Date.now() + secs * 1000).toISOString();
      retryAfter = secs;
    }

    const now = new Date().toISOString();
    await admin.from("login_attempts").upsert({
      username,
      fail_count: fail,
      locked_until: lockedUntil,
      last_failed_at: now,
      updated_at: now,
    });

    return lockedUntil ? { locked: true, retryAfter } : { locked: false };
  } catch {
    return { locked: false }; // fail-open
  }
}

/** Login exitoso → borra el historial de fallos de ese usuario. */
export async function resetAttempts(username: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("login_attempts").delete().eq("username", username);
  } catch {
    // sin efecto si falla
  }
}

/** Mensaje elegante y genérico para el estado de bloqueo. */
export function lockMessage(retryAfter: number): string {
  let label: string;
  if (retryAfter >= 60) {
    const mins = Math.round(retryAfter / 60);
    label = `${mins} ${mins === 1 ? "minuto" : "minutos"}`;
  } else {
    label = `${retryAfter} segundos`;
  }
  return `Demasiados intentos fallidos. Intenta de nuevo en ${label}.`;
}
