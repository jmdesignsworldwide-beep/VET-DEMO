"use client";

import { TrendingUp } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function VentasPage() {
  return (
    <ComingSoon
      icon={TrendingUp}
      title="Ventas e ingresos"
      description="Ingresos por área, tendencias del mes y reportes financieros de Clínica Nido."
    />
  );
}