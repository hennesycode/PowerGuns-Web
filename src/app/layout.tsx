import type { Metadata } from "next";
import { Inter, Barlow_Condensed, Rajdhani } from "next/font/google";
import { Toaster } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Power Guns Polígono S.A.S. — Villavicencio, Meta",
  description:
    "Polígono de tiro certificado en Villavicencio. Armería premium, instructores certificados y el ambiente táctico más profesional de los Llanos Orientales.",
  keywords: ["polígono de tiro", "Villavicencio", "tiro deportivo", "power guns", "armería"],
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Power Guns Polígono S.A.S.",
    description:
      "El polígono de tiro más completo de los Llanos Orientales. Seguridad, profesionalismo y experiencia táctica premium.",
    locale: "es_CO",
    type: "website",
  },
  alternates: { canonical: "https://powergunspoligono.com" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${barlowCondensed.variable} ${rajdhani.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#050403] text-[#F0F3F6]" suppressHydrationWarning>
        <CartProvider>
          <AdminShell>{children}</AdminShell>
          <CartDrawer />
        </CartProvider>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: { background: "#171513", color: "#F0F3F6", border: "1px solid rgba(196,135,26,.2)" },
          }}
        />
      </body>
    </html>
  );
}
