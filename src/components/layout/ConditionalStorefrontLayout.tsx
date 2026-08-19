'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import CartDrawer from '@/components/storefront/CartDrawer';

interface ConditionalStorefrontLayoutProps {
  children: React.ReactNode;
  user: { email: string; role: string } | null;
}

export default function ConditionalStorefrontLayout({
  children,
  user,
}: ConditionalStorefrontLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
