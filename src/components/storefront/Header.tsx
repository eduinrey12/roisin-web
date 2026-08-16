'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingBag, User, Search, Menu, X, Sparkles, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import RoisinLogo from '@/components/branding/RoisinLogo';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';

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

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, deseo consultar sobre sus colecciones.`
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#F0E6E8] transition-all">
      {/* 1. Romantic Top Announcement Bar */}
      <div className="bg-[#FAF4F5] border-b border-[#EFCFD6]/60 text-zinc-800 text-[11px] font-medium tracking-widest text-center py-2 px-4 flex items-center justify-center gap-2">
        <RoisinDiamond size={12} color="#E2A3B0" />
        <span className="hidden sm:inline">Alta Joyería en Plata 925 & Oro 18k</span>
        <span className="hidden sm:inline text-[#E2A3B0]">•</span>
        <span>Envíos Seguros a Todo el Ecuador</span>
        <span className="hidden sm:inline text-[#E2A3B0]">•</span>
        <span className="hidden sm:inline text-zinc-600">Empaque de Regalo Exclusivo</span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 hover:text-[#BE6C7C] focus:outline-none transition"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Official Brand Logo */}
        <div className="flex-1 md:flex-initial flex items-center justify-center md:justify-start">
          <RoisinLogo symbolSize={30} showTagline={true} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 lg:space-x-9">
          <Link
            href="/productos"
            className="text-xs uppercase tracking-[0.18em] text-zinc-800 hover:text-[#BE6C7C] font-semibold transition relative group py-2"
          >
            Colecciones
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#E2A3B0] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/productos?category=anillos"
            className="text-xs uppercase tracking-[0.18em] text-zinc-600 hover:text-[#BE6C7C] font-medium transition relative group py-2"
          >
            Anillos
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#E2A3B0] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/productos?category=collares"
            className="text-xs uppercase tracking-[0.18em] text-zinc-600 hover:text-[#BE6C7C] font-medium transition relative group py-2"
          >
            Collares
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#E2A3B0] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/productos?category=pulseras"
            className="text-xs uppercase tracking-[0.18em] text-zinc-600 hover:text-[#BE6C7C] font-medium transition relative group py-2"
          >
            Pulseras
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#E2A3B0] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/productos?category=aretes"
            className="text-xs uppercase tracking-[0.18em] text-zinc-600 hover:text-[#BE6C7C] font-medium transition relative group py-2"
          >
            Aretes
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#E2A3B0] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/nosotros"
            className="text-xs uppercase tracking-[0.18em] text-zinc-500 hover:text-[#BE6C7C] font-medium transition relative group py-2"
          >
            La Marca
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#E2A3B0] transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* Actions (Search, Account, Cart) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 text-zinc-700 hover:text-[#BE6C7C] hover:bg-[#FAF4F5] rounded-full transition"
            aria-label="Buscar productos"
          >
            <Search size={19} />
          </button>

          <Link
            href={user ? '/cuenta' : '/login'}
            className="p-2.5 text-zinc-700 hover:text-[#BE6C7C] hover:bg-[#FAF4F5] rounded-full transition flex items-center gap-2"
            aria-label="Mi Cuenta"
          >
            <User size={19} />
            {user && (
              <span className="hidden lg:inline text-xs font-semibold text-zinc-800">
                {user.role === 'ADMIN' ? 'Admin' : 'Mi Cuenta'}
              </span>
            )}
          </Link>

          <button
            onClick={toggleCart}
            className="relative p-2.5 text-zinc-800 hover:text-[#BE6C7C] hover:bg-[#FAF4F5] rounded-full transition group"
            aria-label="Carrito de compras"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute 1 right-1 bg-[#E2A3B0] text-zinc-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Search Bar Overlay */}
      {searchOpen && (
        <div className="border-t border-[#F0E6E8] bg-white/95 backdrop-blur-md py-4 px-4 sm:px-6 animate-fade-in shadow-sm">
          <form
            action="/productos"
            method="GET"
            className="max-w-2xl mx-auto flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar anillos de promesa, solitarios, collares de oro..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#FAF4F5] border border-[#EFCFD6] rounded-full text-xs text-zinc-900 focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition placeholder:text-zinc-400"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="bg-zinc-900 text-white text-xs uppercase tracking-widest px-6 py-2.5 rounded-full font-semibold hover:bg-zinc-800 hover:border-[#E2A3B0] transition active:scale-95 shadow-xs"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-zinc-400 hover:text-zinc-700"
              aria-label="Cerrar búsqueda"
            >
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[115px] bottom-0 bg-black/40 backdrop-blur-xs z-50 animate-fade-in">
          <div className="bg-white border-b border-[#F0E6E8] p-6 space-y-6 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="space-y-3 border-b border-[#F0E6E8] pb-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#BE6C7C]">
                Navegación
              </span>
              <Link
                href="/productos"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold uppercase tracking-wider text-zinc-900 hover:text-[#BE6C7C]"
              >
                Ver Catálogo Completo
              </Link>
            </div>

            <div className="space-y-3 border-b border-[#F0E6E8] pb-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-400">
                Categorías de Joyas
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/productos?category=anillos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-[#FAF4F5] rounded-xl font-medium text-zinc-800 hover:bg-[#F6E8EB] transition flex items-center gap-2"
                >
                  <RoisinDiamond size={12} color="#E2A3B0" /> Anillos
                </Link>
                <Link
                  href="/productos?category=collares"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-[#FAF4F5] rounded-xl font-medium text-zinc-800 hover:bg-[#F6E8EB] transition flex items-center gap-2"
                >
                  <RoisinDiamond size={12} color="#E2A3B0" /> Collares
                </Link>
                <Link
                  href="/productos?category=pulseras"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-[#FAF4F5] rounded-xl font-medium text-zinc-800 hover:bg-[#F6E8EB] transition flex items-center gap-2"
                >
                  <RoisinDiamond size={12} color="#E2A3B0" /> Pulseras
                </Link>
                <Link
                  href="/productos?category=aretes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-[#FAF4F5] rounded-xl font-medium text-zinc-800 hover:bg-[#F6E8EB] transition flex items-center gap-2"
                >
                  <RoisinDiamond size={12} color="#E2A3B0" /> Aretes
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/nosotros"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:text-[#BE6C7C]"
              >
                Historia & Compromiso de Calidad
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl w-full justify-center"
              >
                <MessageCircle size={15} /> Asesoría por WhatsApp
              </a>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-bold text-black pt-2 border-t text-center"
                >
                  Ir al Panel Administrativo
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
