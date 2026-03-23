import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ColorProvider } from "@/components/providers/ColorProvider";
import { Toaster } from "sonner";
import { Softphone } from "@/components/pbx/softphone";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  const name = branding?.name || "NextWave CRM";

  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: "Sistema de gestão de clientes e projetos profissional",
  };
}

type AccentColor = "blue" | "orange" | "green" | "purple" | "rose" | "pink";
type LayoutTheme = "default" | "professional";

const VALID_COLORS: AccentColor[] = ["blue", "orange", "green", "purple", "rose", "pink"];
const VALID_LAYOUTS: LayoutTheme[] = ["default", "professional"];

async function getLicenseStatus() {
  try {
    const license = await prisma.systemLicense.findFirst({
      where: { id: "default" }
    });
    return license?.status || "active";
  } catch (e) {
    return "active"; 
  }
}

async function getBranding() {
  try {
    return await prisma.systemBranding.findFirst({
      where: { id: "default" }
    });
  } catch (e: any) {
    if (e.message?.includes("Unable to open the database file") || e.code === 'P2024') {
      return null;
    }
    console.warn("Branding load failed", e.message);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = headers();
  const initialColor = (cookies().get("nextwave-accent-color")?.value as AccentColor) || "blue";
  const initialLayout = (cookies().get("nextwave-layout-theme")?.value as LayoutTheme) || "default";
  const session = await auth();

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-color={initialColor}
      data-layout={initialLayout}
    >
      <body className="antialiased font-sans">
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
              {session?.user && <Softphone />}
            </ColorProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
