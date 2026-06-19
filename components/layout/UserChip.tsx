"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Tarjeta de usuario + cerrar sesión. */
export function UserChip({ username, role }: { username: string; role: string }) {
  const router = useRouter();
  const isAdmin = role === "admin";
  const initials = username.slice(0, 2).toUpperCase();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-2.5">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-sm font-bold ${isAdmin ? "from-brand to-brand-glow text-[#04201d]" : "from-accent to-accent-glow text-[#3a0d18]"}`}>
        {initials}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{username}</p>
        <p className="truncate text-[11px] text-muted">{isAdmin ? "Administrador" : "Cliente"}</p>
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
