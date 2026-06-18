import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Clínica Nido — Gestión Premium",
  description:
    "Veterinaria, hotel canino y peluquería. Experiencia de gestión premium.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
