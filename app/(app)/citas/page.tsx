"use client";

import { CalendarHeart } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function CitasPage() {
  return (
    <ComingSoon
      icon={CalendarHeart}
      title="Citas"
      description="Agenda clínica completa: programación, recordatorios y estado de cada cita en tiempo real."
    />
  );
}