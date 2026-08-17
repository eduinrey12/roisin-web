'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingBag, User, Search, Menu, X, ChevronDown, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import RoisinLogo from '@/components/branding/RoisinLogo';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';

export default function Header({ user }: { user?: { email: string; role: string } | null }) {
  const { cart, toggleCart, initCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsHover, setCollectionsHover] = useState(false);

  useEffect(() => {
    initCart();
  }, [initCart]);

  const itemCount =
    cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, deseo consultar sobre sus colecciones de alta joyería.`
  )}`;

  const categories = [
    {
      name: 'Anillos',
      slug: 'anillos',
      desc: 'Solitarios eternos, anillos de promesa y piezas de compromiso en Plata 925.',
    },
    {
      name: 'Collares & Gargantillas',
      slug: 'collares',
      desc: 'Cadenas finas con dijes delicados y baño de oro 18k.',
    },
    {
      name: 'Pulseras & Brazaletes',
      slug: 'pulseras',
      desc: 'Pulseras tennis con circonias suizas y brazaletes de lujo.',
    },
    {
      name: 'Aretes & Candongas',
      slug: 'aretes',
      desc: 'Candongas huggies y aretes sutiles para iluminar tu rostro.',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#FAD1DC] transition-all shadow-2xs">
      {/* 1. Luminous Pink Diamond Announcement Bar */}
      <div className="bg-[#FFF5F7] border-b border-[#FAD1DC] text-zinc-800 text-[11px] font-medium tracking-widest text-center py-2 px-4 flex items-center justify-center gap-2">
        <RoisinDiamond size={13} color="#E65573" />
        <span className="font-bold text-[#D33658] uppercase">Alta Joyería Roisin</span>
        <span className="hidden sm:inline text-[#E65573]">•</span>
        <span className="hidden sm:inline">Plata de Ley 925 & Oro 18k Certificado</span>
        <span className="hidden sm:inline text-[#E65573]">•</span>
        <span>Envíos Seguros en Ecuador</span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-20 sm:h-22 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-zinc-700 hover:text-[#D33658] focus:outline-none transition"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Official Brand Logo in radiant Pink Diamond */}
        <div className="flex-1 md:flex-initial flex items-center justify-center md:justify-start">
          <RoisinLogo />
        </div>

        {/* Desktop Navigation with "Colecciones" Dropdown */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {/* Colecciones with Hover Dropdown Megamenu */}
          <div
            className="relative"
            onMouseEnter={() => setCollectionsHover(true)}
            onMouseLeave={() => setCollectionsHover(false)}
          >
            <Link
              href="/productos"
              className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-800 hover:text-[#D33658] transition py-4 inline-flex items-center gap-1.5 group"
            >
              <span>Colecciones</span>
              <ChevronDown
                size={14}
                className={`text-[#E65573] transition-transform duration-300 ${
                  collectionsHover ? 'rotate-180' : ''
                }`}
              />
            </Link>

            {/* Megamenu Floating Card */}
            {collectionsHover && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[540px] bg-white rounded-3xl p-6 shadow-2xl border border-[#FAD1DC] animate-fade-in z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#FAD1DC] mb-4">
                  <div className="flex items-center gap-2">
                    <RoisinDiamond size={16} color="#E65573" />
                    <span className="text-xs uppercase font-bold tracking-widest text-[#D33658]">
                      Categorías de Joyería
                    </span>
                  </div>
                  <Link
                    href="/productos"
                    className="text-[11px] font-bold text-zinc-600 hover:text-[#D33658] flex items-center gap-1"
                  >
                    Ver Todo <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/productos?category=${cat.slug}`}
                      className="p-3.5 rounded-2xl bg-[#FFF8FA] hover:bg-[#FDE8ED] border border-[#FAD1DC]/60 hover:border-[#E65573] transition group text-left"
                    >
                      <div className="flex items-center gap-2">
                        <RoisinDiamond
                          size={12}
                          color="#E65573"
                          className="group-hover:scale-110 transition-transform"
                        />
                        <h4 className="font-serif font-bold text-sm text-zinc-900 group-hover:text-[#D33658] transition-colors">
                          {cat.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-snug font-light">
                        {cat.desc}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* Banner inside megamenu */}
                <div className="mt-4 pt-3 border-t border-[#FAD1DC] flex items-center justify-between text-xs text-zinc-600">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-700">
                    <Sparkles size={13} className="text-[#E65573]" /> Garantía de autenticidad en todas las piezas
                  </span>
                  <Link
                    href="/productos"
                    className="btn-pink-diamond text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-xl shadow-xs"
                  >
                    Catálogo Completo
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/nosotros"
            className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-700 hover:text-[#D33658] transition py-4 relative group"
          >
            Nuestra Esencia
            <span className="absolute bottom-2 left-0 w-0 h-[1.5px] bg-[#E65573] transition-all duration-300 group-hover:w-full" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-[0.2em] font-semibold text-emerald-700 hover:text-emerald-800 transition py-4 inline-flex items-center gap-1.5"
          >
            <MessageCircle size={15} /> Asesoría
          </a>
        </nav>

        {/* Actions (Search, Account, Pink Diamond Cart Button) */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 text-zinc-700 hover:text-[#D33658] hover:bg-[#FFF5F7] rounded-full transition"
            aria-label="Buscar productos"
          >
            <Search size={20} />
          </button>

          <Link
            href={user ? '/cuenta' : '/login'}
            className="p-2.5 text-zinc-700 hover:text-[#D33658] hover:bg-[#FFF5F7] rounded-full transition flex items-center gap-2"
            aria-label="Mi Cuenta"
          >
            <User size={20} />
            {user && (
              <span className="hidden lg:inline text-xs font-bold text-zinc-900">
                {user.role === 'ADMIN' ? 'Admin' : 'Mi Cuenta'}
              </span>
            )}
          </Link>

          {/* Luminous Pink Diamond Cart Trigger Button */}
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 p-2.5 sm:px-4 sm:py-2.5 bg-[#FFF5F7] hover:bg-[#FDE8ED] border border-[#FAD1DC] hover:border-[#E65573] rounded-2xl transition-all duration-200 group shadow-2xs"
            aria-label="Bolsa de compras"
          >
            <ShoppingBag size={19} className="text-[#D33658] transition-transform group-hover:scale-108" />
            <span className="hidden sm:inline text-xs font-bold text-zinc-900">
              Bolsa
            </span>
            {itemCount > 0 ? (
              <span className="bg-[#D33658] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                {itemCount}
              </span>
            ) : (
              <span className="hidden sm:inline text-[10px] text-zinc-400 font-bold">
                (0)
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Search Bar Overlay */}
      {searchOpen && (
        <div className="border-t border-[#FAD1DC] bg-white/98 backdrop-blur-md py-4 px-4 sm:px-6 animate-fade-in shadow-md">
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
                placeholder="Buscar anillos de promesa, solitarios, collares de oro, pulseras..."
                className="w-full pl-11 pr-4 py-3 bg-[#FFF5F7] border border-[#FAD1DC] rounded-full text-xs text-zinc-900 focus:outline-none focus:border-[#D33658] focus:bg-white transition placeholder:text-zinc-400"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-pink-diamond text-xs uppercase tracking-widest px-7 py-3 rounded-full font-bold transition active:scale-95 shadow-md"
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
        <div className="md:hidden fixed inset-x-0 top-[115px] bottom-0 bg-black/50 backdrop-blur-xs z-50 animate-fade-in">
          <div className="bg-white border-b border-[#FAD1DC] p-6 space-y-6 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="space-y-3 border-b border-[#FAD1DC] pb-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#D33658]">
                Catálogo de Joyas
              </span>
              <Link
                href="/productos"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-bold text-zinc-900 hover:text-[#D33658]"
              >
                Ver Colección Completa
              </Link>
            </div>

            <div className="space-y-3 border-b border-[#FAD1DC] pb-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-400">
                Por Categoría
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/productos?category=${c.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-[#FFF5F7] rounded-2xl font-semibold text-zinc-800 hover:bg-[#FDE8ED] border border-[#FAD1DC] transition flex items-center gap-2"
                  >
                    <RoisinDiamond size={12} color="#E65573" /> {c.name.split('&')[0]}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/nosotros"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-[#D33658]"
              >
                Nuestra Historia & Compromiso
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl w-full justify-center"
              >
                <MessageCircle size={16} /> Asesoría por WhatsApp
              </a>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-bold text-purple-700 pt-2 border-t text-center"
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
