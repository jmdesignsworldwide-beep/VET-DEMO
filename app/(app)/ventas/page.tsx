import { redirect } from "next/navigation";

/** La sección de ventas/ingresos vive ahora en Administración. */
export default function VentasPage() {
  redirect("/admin");
}
