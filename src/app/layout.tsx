import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import ConditionalStorefrontLayout from '@/components/layout/ConditionalStorefrontLayout';
import PageTransitionLoader from '@/components/ui/PageTransitionLoader';
import { getCurrentUser } from '@/lib/auth';
import { Suspense } from 'react';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  display: 'swap',
});

const novaQuinta = localFont({
  src: '../fonts/NovaQuinta.otf',
  variable: '--font-nova-quinta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://roisinjoyas.com'),
  title: {
    default: 'ROISIN Joyas | Diamante Morado & Alta Joyería en Ecuador',
    template: '%s | ROISIN Joyas',
  },
  description:
    'Exclusiva joyería fina en Plata de Ley 925 y Baño de Oro 18k. Anillos de promesa, collares, pulseras tennis y aretes con envíos seguros a todo el Ecuador.',
  keywords: [
    'joyas ecuador',
    'plata 925 quito',
    'anillos de promesa',
    'pulseras tennis',
    'collares oro',
    'diamante morado',
    'joyeria fina',
    'roisin joyas',
  ],
  openGraph: {
    title: 'ROISIN Joyas & Accesorios | Diamante Morado Elegante',
    description: 'Exclusiva joyería en Plata 925 y Baño de Oro 18k con envíos a todo Ecuador.',
    url: 'https://roisinjoyas.com',
    siteName: 'ROISIN Joyas',
    locale: 'es_EC',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${openSans.variable} ${novaQuinta.variable} font-sans bg-white text-zinc-900 antialiased selection:bg-[#DFD0EC] selection:text-[#221235] flex flex-col min-h-screen`}
      >
        <Suspense fallback={null}>
          <PageTransitionLoader />
        </Suspense>
        <ConditionalStorefrontLayout user={user ? { email: user.email, role: user.role } : null}>
          {children}
        </ConditionalStorefrontLayout>
      </body>
    </html>
  );
}
