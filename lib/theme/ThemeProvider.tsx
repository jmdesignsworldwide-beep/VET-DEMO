"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Proveedor de tema (oscuro / claro) con preferencia recordada en
 * localStorage. Oscuro por defecto. Sin parpadeo gracias a next-themes.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemeProvider>) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
