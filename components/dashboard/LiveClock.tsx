"use client";

import { useEffect, useState } from "react";

/** Reloj en vivo — aporta sensación de "sala de control" que respira. */
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <span className="tabular-nums">--:--:--</span>;

  return (
    <span className="tabular-nums">
      {now.toLocaleTimeString("es-DO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}
