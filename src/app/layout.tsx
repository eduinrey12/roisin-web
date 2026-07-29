import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roisin Joyas y Accesorios | Elegancia en cada detalle",
  description: "Descubre nuestra exclusiva colección de anillos, collares y pulseras. En Roisin ofrecemos joyas de alta calidad con diseños únicos para realzar tu belleza.",
  keywords: "joyas, accesorios, anillos, collares, pulseras, joyería online, Roisin, Ecuador",
  openGraph: {
    title: "Roisin Joyas y Accesorios",
    description: "Exclusiva colección de anillos, collares y pulseras.",
    url: "https://roisinjoyas.com",
    siteName: "Roisin Joyas",
    locale: "es_EC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
