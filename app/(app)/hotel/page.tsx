"use client";

import { BedDouble } from "lucide-react";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function HotelPage() {
  return (
    <ComingSoon
      icon={BedDouble}
      title="Hotel canino"
      description="Ocupación por habitación, check-ins y check-outs, y el estado de cada huésped del día."
    />
  );
}