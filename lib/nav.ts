import {
  LayoutDashboard,
  CalendarHeart,
  BedDouble,
  Scissors,
  PawPrint,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Módulo aún por construir → se muestra con etiqueta "Pronto". */
  soon?: boolean;
}

export const NAV: NavItem[] = [
  { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { label: "Citas", href: "/citas", icon: CalendarHeart, soon: true },
  { label: "Hotel canino", href: "/hotel", icon: BedDouble, soon: true },
  { label: "Peluquería", href: "/peluqueria", icon: Scissors, soon: true },
  { label: "Clientes", href: "/clientes", icon: PawPrint, soon: true },
  { label: "Ventas", href: "/ventas", icon: TrendingUp, soon: true },
  { label: "Ajustes", href: "/ajustes", icon: Settings, soon: true },
];
