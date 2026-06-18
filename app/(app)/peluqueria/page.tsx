"use client";

import { Scissors } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function PeluqueriaPage() {
  return (
    <ComingSoon
      icon={Scissors}
      title="Peluquería"
      description="Cola de servicios, tiempos por mascota e ingresos del día del área de estética."
    />
  );
}