import {
  LayoutDashboard,
  CalendarHeart,
  BedDouble,
  Scissors,
  PawPrint,
  Building2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Solo visible/accesible para el rol admin. */
  adminOnly?: boolean;
}

export const NAV: NavItem[] = [
  { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: PawPrint },
  { label: "Citas", href: "/citas", icon: CalendarHeart },
  { label: "Hotel canino", href: "/hotel", icon: BedDouble },
  { label: "Peluquería", href: "/peluqueria", icon: Scissors },
  { label: "Administración", href: "/admin", icon: Building2 },
  { label: "Cuentas", href: "/ajustes", icon: ShieldCheck, adminOnly: true },
];
