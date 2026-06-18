import { createClient } from "@/lib/supabase/server";

/**
 * Página de inicio que muestra el estado de la conexión con Supabase.
 * Sirve como verificación visual: si ves "Conectado a Supabase" en verde,
 * las llaves están bien configuradas.
 */
export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let status: "ok" | "missing-keys" | "error" = "ok";
  let detail = "";

  if (!url || !anon) {
    status = "missing-keys";
  } else {
    try {
      const supabase = await createClient();
      // Llamada ligera que solo valida que las llaves y la URL funcionan.
      const { error } = await supabase.auth.getSession();
      if (error) {
        status = "error";
        detail = error.message;
      }
    } catch (e) {
      status = "error";
      detail = e instanceof Error ? e.message : "Error desconocido";
    }
  }

  const colors = {
    ok: "#22c55e",
    "missing-keys": "#f59e0b",
    error: "#ef4444",
  } as const;

  const messages = {
    ok: "✅ Conectado a Supabase",
    "missing-keys": "⚠️ Faltan las llaves de Supabase",
    error: "❌ Error al conectar con Supabase",
  } as const;

  return (
    <main
      style={{
        maxWidth: 540,
        textAlign: "center",
        background: "#1e293b",
        padding: "2.5rem",
        borderRadius: 16,
        border: "1px solid #334155",
      }}
    >
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        🐾 Vet Demo
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Aplicación Next.js + Supabase
      </p>

      <div
        style={{
          display: "inline-block",
          padding: "0.75rem 1.25rem",
          borderRadius: 999,
          background: `${colors[status]}22`,
          color: colors[status],
          fontWeight: 600,
          border: `1px solid ${colors[status]}`,
        }}
      >
        {messages[status]}
      </div>

      {status === "missing-keys" && (
        <p style={{ color: "#94a3b8", marginTop: "1.25rem", fontSize: "0.9rem" }}>
          Añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en tu archivo{" "}
          <code>.env.local</code> (o en Vercel) y recarga.
        </p>
      )}

      {status === "error" && (
        <p style={{ color: "#94a3b8", marginTop: "1.25rem", fontSize: "0.9rem" }}>
          {detail}
        </p>
      )}
    </main>
  );
}
