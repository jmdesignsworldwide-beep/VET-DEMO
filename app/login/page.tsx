"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import { signInUsername } from "@/lib/supabase/actions";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Brand } from "@/components/layout/Brand";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lockRemaining, setLockRemaining] = useState(0); // segundos restantes del bloqueo

  const locked = lockRemaining > 0;

  // En la pantalla de login, reinicia el flag para que la bienvenida
  // aparezca de nuevo tras el próximo inicio de sesión.
  useEffect(() => {
    try { sessionStorage.removeItem("nido_welcome_seen"); } catch {}
  }, []);

  // Cuenta regresiva del bloqueo: tic-tac hasta liberar el formulario.
  useEffect(() => {
    if (lockRemaining <= 0) return;
    const id = setInterval(() => {
      setLockRemaining((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [lockRemaining]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setError(null);
    start(async () => {
      const res = await signInUsername({ username, password });
      if (res?.expired) return router.push("/acceso-expirado");
      if (res?.retryAfter) { setError(null); setLockRemaining(res.retryAfter); return; }
      if (res?.error) return setError(res.error);
    });
  }

  const mmss = `${Math.floor(lockRemaining / 60)}:${String(lockRemaining % 60).padStart(2, "0")}`;

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <AuroraBackground />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="relative rounded-3xl glass-strong p-8 shadow-lift sm:p-10">
          <Brand className="mb-8" />

          <h1 className="font-display text-2xl font-bold tracking-tight">Bienvenido</h1>
          <p className="mt-1 text-sm text-muted">Ingresa con el usuario y la contraseña que te asignaron.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field
              icon={<User className="h-4 w-4" />}
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={setUsername}
              autoComplete="username"
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {error && !locked && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-sm font-medium text-accent">
                {error}
              </motion.p>
            )}

            {locked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] px-4 py-3"
              >
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Demasiados intentos fallidos</p>
                  <p className="text-xs text-muted">
                    Por seguridad, espera <span className="tnum font-semibold text-ink">{mmss}</span> antes de volver a intentar.
                  </p>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={pending || locked}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-glow font-semibold text-[#04201d] shadow-glow transition-transform active:scale-[0.99] disabled:opacity-70"
            >
              {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : locked ? (
                <><Lock className="h-4 w-4" /> Bloqueado · {mmss}</>
              ) : (
                <>Iniciar sesión <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            ¿Problemas para entrar? Contacta a <span className="font-medium text-ink">JM Designs</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon, type, placeholder, value, onChange, autoComplete,
}: {
  icon: React.ReactNode; type: string; placeholder: string; value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <label className="group flex h-12 items-center gap-3 rounded-xl border border-hairline/10 bg-ink/[0.03] px-4 transition-colors focus-within:border-brand/40 focus-within:bg-ink/[0.05]">
      <span className="text-muted transition-colors group-focus-within:text-brand dark:group-focus-within:text-brand-glow">{icon}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
      />
    </label>
  );
}
