import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ColorProvider } from "@/components/providers/ColorProvider";
import type { AccentColor, LayoutTheme } from "@/components/providers/ColorProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextWave CRM",
  description: "Sistema de gestão de clientes e projetos profissional",
};

const VALID_COLORS: AccentColor[] = ["blue", "orange", "green", "purple", "rose"];
const VALID_LAYOUTS: LayoutTheme[] = ["default", "professional"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lê cookies do servidor para renderizar sem flash
  const cookieStore = cookies();
  const rawColor = cookieStore.get("nextwave-accent-color")?.value as AccentColor;
  const rawLayout = cookieStore.get("nextwave-layout-theme")?.value as LayoutTheme;
  const initialColor: AccentColor = VALID_COLORS.includes(rawColor) ? rawColor : "blue";
  const initialLayout: LayoutTheme = VALID_LAYOUTS.includes(rawLayout) ? rawLayout : "default";

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-color={initialColor}
      data-layout={initialLayout}
    >
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ColorProvider initialColor={initialColor} initialLayout={initialLayout}>
              {children}
              <Toaster
                richColors
                position="top-right"
                toastOptions={{
                  duration: 3000,
                }}
              />
            </ColorProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
