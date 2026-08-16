'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header({ user }: { user?: { email: string; role: string } | null }) {
  const { cart, toggleCart, initCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initCart();
  }, [initCart]);

  const itemCount =
    cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      {/* Top Notification Bar */}
      <div className="bg-black text-white text-[11px] font-medium tracking-widest text-center py-1.5 px-4 uppercase">
        Envíos seguros a todo el Ecuador • Calidad en Plata 925 y Baño de Oro 18k
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-black focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Brand Logo */}
        <div className="flex-1 md:flex-initial text-center md:text-left">
          <Link href="/" className="inline-block group">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.25em] text-black">
              ROISIN
            </span>
            <span className="block text-[9px] uppercase tracking-[0.4em] text-gray-500 font-sans -mt-1 group-hover:text-black transition">
              Joyas & Accesorios
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/productos"
            className="text-xs uppercase tracking-widest text-gray-700 hover:text-black font-semibold transition"
          >
            Catálogo Completo
          </Link>
          <Link
            href="/productos?category=anillos"
            className="text-xs uppercase tracking-widest text-gray-700 hover:text-black font-medium transition"
          >
            Anillos
          </Link>
          <Link
            href="/productos?category=collares"
            className="text-xs uppercase tracking-widest text-gray-700 hover:text-black font-medium transition"
          >
            Collares
          </Link>
          <Link
            href="/productos?category=pulseras"
            className="text-xs uppercase tracking-widest text-gray-700 hover:text-black font-medium transition"
          >
            Pulseras
          </Link>
          <Link
            href="/productos?category=aretes"
            className="text-xs uppercase tracking-widest text-gray-700 hover:text-black font-medium transition"
          >
            Aretes
          </Link>
        </nav>

        {/* Actions (Search, Account, Cart) */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-700 hover:text-black transition"
            aria-label="Buscar productos"
          >
            <Search size={20} />
          </button>

          <Link
            href={user ? '/cuenta' : '/login'}
            className="p-2 text-gray-700 hover:text-black transition flex items-center gap-1.5"
            aria-label="Mi Cuenta"
          >
            <User size={20} />
            {user && (
              <span className="hidden lg:inline text-xs font-medium text-gray-700">
                {user.role === 'ADMIN' ? 'Admin' : 'Mi Cuenta'}
              </span>
            )}
          </Link>

          <button
            onClick={toggleCart}
            className="relative p-2 text-gray-700 hover:text-black transition"
            aria-label="Carrito de compras"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute 0 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar Dropdown */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-gray-50/90 py-4 px-4 sm:px-6">
          <form
            action="/productos"
            method="GET"
            className="max-w-2xl mx-auto flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar anillos, collares, plata 925..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-black transition"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white text-xs uppercase tracking-widest px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 px-6 space-y-4">
          <Link
            href="/productos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider font-semibold text-black py-1"
          >
            Catálogo Completo
          </Link>
          <Link
            href="/productos?category=anillos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-gray-600 py-1"
          >
            Anillos
          </Link>
          <Link
            href="/productos?category=collares"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-gray-600 py-1"
          >
            Collares y Gargantillas
          </Link>
          <Link
            href="/productos?category=pulseras"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-gray-600 py-1"
          >
            Pulseras y Brazaletes
          </Link>
          <Link
            href="/productos?category=aretes"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-gray-600 py-1"
          >
            Aretes
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-purple-600 pt-2 border-t"
            >
              Panel de Administración
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
