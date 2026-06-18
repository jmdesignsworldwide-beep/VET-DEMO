"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Brand } from "@/components/layout/Brand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales no válidas. Verifica tu correo y contraseña.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

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

          <h1 className="font-display text-2xl font-bold tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-muted">
            Accede al panel de gestión de Clínica Nido.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field
              icon={<Mail className="h-4 w-4" />}
              type="email"
              placeholder="correo@clinicanido.do"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm font-medium text-accent"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-glow font-semibold text-[#04201d] shadow-glow transition-transform active:scale-[0.99] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-hairline/10" />
            solo personal autorizado
            <span className="h-px flex-1 bg-hairline/10" />
          </div>

          {/* Acceso de revisión (mientras no existan cuentas) */}
          <Link
            href="/dashboard"
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl glass text-sm font-medium transition-shadow hover:shadow-glow"
          >
            Entrar a la demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="group flex h-12 items-center gap-3 rounded-xl border border-hairline/10 bg-ink/[0.03] px-4 transition-colors focus-within:border-brand/40 focus-within:bg-ink/[0.05]">
      <span className="text-muted transition-colors group-focus-within:text-brand-glow">
        {icon}
      </span>
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
