"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Tarjeta de usuario + cerrar sesión. */
export function UserChip() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-glow text-sm font-bold text-[#3a0d18]">
        AN
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">Admin Nido</p>
        <p className="truncate text-[11px] text-muted">Administrador</p>
      </div>
      <button
        type="button"
        onClick={signOut}
        aria-label="Cerrar sesión"
        className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-ink/[0.06] hover:text-accent"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
