"use client";

import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function AjustesPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Ajustes"
      description="Configuración de la clínica, usuarios del equipo y preferencias del sistema."
    />
  );
}