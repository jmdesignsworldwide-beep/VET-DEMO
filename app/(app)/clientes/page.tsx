"use client";

import { PawPrint } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function ClientesPage() {
  return (
    <ComingSoon
      icon={PawPrint}
      title="Clientes y mascotas"
      description="Fichas de cada mascota y su dueño, historial médico y visitas anteriores."
    />
  );
}