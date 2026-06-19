import Link from "next/link";
import { Boxes, ReceiptText, Users, BarChart3, ServerCog, ArrowUpRight } from "lucide-react";
import { getFinance } from "@/lib/supabase/queries";
import { FinanceView } from "@/components/admin/FinanceView";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/motion/Magnetic";
import { Stagger, Reveal } from "@/components/motion/Reveal";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "/admin/inventario", icon: Boxes, title: "Inventario", desc: "Stock, medicamentos y vencimientos" },
  { href: "/admin/facturacion", icon: ReceiptText, title: "Facturación NCF", desc: "Comprobantes fiscales e ITBIS" },
  { href: "/admin/empleados", icon: Users, title: "Empleados", desc: "Equipo, nóminas y vacaciones" },
  { href: "/admin/reportes", icon: BarChart3, title: "Reportes", desc: "Estadísticas y rendimiento" },
  { href: "/admin/sistema", icon: ServerCog, title: "Sistema", desc: "Respaldos, WhatsApp, auditoría y roles" },
];

export default async function AdminPage() {
  const [hoy, semana, mes] = await Promise.all([
    getFinance("hoy"), getFinance("semana"), getFinance("mes"),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Administración <span className="text-gradient">general</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Finanzas, inventario, equipo y sistema de Clínica Nido</p>
      </div>

      <FinanceView data={{ hoy, semana, mes }} />

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">Módulos</h2>
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.href}>
              <Magnetic strength={0.12}>
                <Link href={s.href}>
                  <GlassCard className="group flex h-full items-center gap-4 transition-shadow hover:shadow-glow">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold">{s.title}</p>
                      <p className="truncate text-xs text-muted">{s.desc}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </GlassCard>
                </Link>
              </Magnetic>
            </Reveal>
          );
        })}
      </Stagger>
    </div>
  );
}
