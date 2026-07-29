'use client';

import { useCartStore } from '@/lib/store/cartStore';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Header() {
  const { cart, isOpen, toggleCart, initCart } = useCartStore();

  useEffect(() => {
    initCart();
  }, [initCart]);

  const itemCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          ROISIN
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/productos" className="text-sm font-medium hover:text-gray-600 transition">Catálogo</Link>
          <Link href="/nosotros" className="text-sm font-medium hover:text-gray-600 transition">Nosotros</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-gray-600">
            Cuenta
          </Link>
          <button onClick={toggleCart} className="relative p-2 hover:bg-gray-100 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
