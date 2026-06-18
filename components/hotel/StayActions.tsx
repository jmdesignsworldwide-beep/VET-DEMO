"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { checkInStay, checkOutStay } from "@/lib/supabase/actions";
import { cn } from "@/lib/utils";

export function StayActions({
  stayId,
  petId,
  status,
}: {
  stayId: string;
  petId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean }>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  if (status === "reservada") {
    return (
      <button
        onClick={() => run(() => checkInStay(stayId, petId))}
        disabled={pending}
        className={cn("inline-flex items-center gap-1.5 rounded-xl bg-brand/15 px-3 py-2 text-sm font-semibold text-brand transition-shadow hover:shadow-glow dark:text-brand-glow", pending && "opacity-60")}
      >
        <LogIn className="h-4 w-4" /> Check-in
      </button>
    );
  }
  if (status === "en_curso") {
    return (
      <button
        onClick={() => run(() => checkOutStay(stayId, petId))}
        disabled={pending}
        className={cn("inline-flex items-center gap-1.5 rounded-xl bg-ink/[0.06] px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/[0.1]", pending && "opacity-60")}
      >
        <LogOut className="h-4 w-4" /> Check-out
      </button>
    );
  }
  return null;
}
