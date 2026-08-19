'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Layers,
  Tag,
  Gem,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RoisinLogo from '@/components/branding/RoisinLogo';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';

export default function Header({ user }: { user?: { email: string; role: string } | null }) {
  const { cart, toggleCart, initCart } = useCartStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsMenuOpen, setCollectionsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initCart();
  }, [initCart]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const itemCount =
    cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, deseo consultar sobre sus exclusivas joyas.`
  )}`;

  const categories = [
    {
      name: 'Anillos',
      slug: 'anillos',
      desc: 'Solitarios eternos, anillos de promesa y compromiso en Plata 925.',
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

  const collections = [
    {
      name: 'Colección Diamante Morado 2026',
      slug: 'diamante-morado',
      desc: 'Nuestra más alta expresión de elegancia y distinción.',
      tag: 'Exclusiva',
    },
    {
      name: 'Colección Promesa Eterna',
      slug: 'promesa-eterna',
      desc: 'Anillos y duetos para sellar momentos inolvidables.',
      tag: 'Popular',
    },
    {
      name: 'Especial Regalos de Amor',
      slug: 'san-valentin',
      desc: 'Sets con empaque rígido y dedicatoria personalizada.',
      tag: 'Regalo',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/98 backdrop-blur-md border-b border-[#DFD0EC] transition-all shadow-2xs">
      {/* 1. Luminous Purple Diamond Announcement Bar */}
      <div className="bg-[#F8F5FA] border-b border-[#DFD0EC] text-zinc-800 text-[11px] font-medium tracking-widest text-center py-2 px-4 flex items-center justify-center gap-2">
        <RoisinDiamond size={13} color="#7043A0" />
        <span className="font-bold text-[#3F235F] uppercase">Alta Joyería Roisin</span>
        <span className="hidden sm:inline text-[#7043A0]">•</span>
        <span className="hidden sm:inline">Diamante Morado & Plata de Ley 925 Certificada</span>
        <span className="hidden sm:inline text-[#7043A0]">•</span>
        <span>Envíos Seguros a Todo el Ecuador</span>
      </div>

      {/* 2. Main Navigation Bar with Logo (Left) | Search (Center) | Actions (Right) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 hover:text-[#3F235F] focus:outline-none transition"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* LEFT: Official Brand Logo with Name */}
        <div className="flex items-center shrink-0">
          <RoisinLogo theme="purple" />
        </div>

        {/* CENTER: Integrated Product Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-3 lg:mx-6">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-[#F8F5FA] hover:bg-white focus-within:bg-white border border-[#DFD0EC] focus-within:border-[#7043A0] rounded-full p-1 pl-3.5 transition-all shadow-2xs">
            <Search className="text-[#7043A0] shrink-0" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar anillos de promesa, solitarios, collares, pulseras..."
              className="w-full bg-transparent px-3 py-1 text-xs text-zinc-900 focus:outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="shrink-0 btn-purple-diamond text-[10.5px] uppercase font-bold tracking-wider px-4 py-2 rounded-full transition active:scale-95 shadow-xs cursor-pointer"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* RIGHT: Colecciones (Categorías & Colecciones) | WhatsApp | Login | Carrito */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 shrink-0">
          {/* 1. Colecciones & Categorías Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCollectionsMenuOpen(!collectionsMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider transition ${
                collectionsMenuOpen
                  ? 'bg-[#F0E9F5] border-[#7043A0] text-[#3F235F] shadow-xs'
                  : 'bg-[#F8F5FA] hover:bg-[#F0E9F5] border-[#DFD0EC] text-zinc-800 hover:border-[#7043A0]'
              }`}
              aria-label="Ver Colecciones y Categorías"
            >
              <Gem size={16} className="text-[#7043A0]" />
              <span className="hidden xl:inline">Colecciones</span>
              <ChevronDown
                size={14}
                className={`text-[#7043A0] transition-transform duration-200 ${
                  collectionsMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Mega Dropdown Showing BOTH Categorías & Colecciones */}
            {collectionsMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-[340px] sm:w-[580px] bg-white rounded-3xl p-6 shadow-2xl border border-[#DFD0EC] animate-fade-in z-50 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFD0EC]">
                  <div className="flex items-center gap-2">
                    <RoisinDiamond size={16} color="#7043A0" />
                    <span className="text-xs uppercase font-bold tracking-widest text-[#3F235F]">
                      Catálogo & Colecciones Exclusivas
                    </span>
                  </div>
                  <Link
                    href="/productos"
                    onClick={() => setCollectionsMenuOpen(false)}
                    className="text-[11px] font-bold text-zinc-600 hover:text-[#3F235F] flex items-center gap-1 transition"
                  >
                    Ver Todo <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Left Column: Categorías */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider text-zinc-500 py-1 leading-normal">
                      <Layers size={14} className="text-[#7043A0]" />
                      <span>Categorías de Joyería</span>
                    </div>
                    <div className="space-y-1.5">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/productos?category=${cat.slug}`}
                          onClick={() => setCollectionsMenuOpen(false)}
                          className="p-2.5 rounded-2xl bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC]/70 hover:border-[#7043A0] transition flex flex-col text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-zinc-900 group-hover:text-[#3F235F] transition-colors">
                              {cat.name}
                            </span>
                            <ArrowRight
                              size={11}
                              className="text-zinc-400 group-hover:text-[#7043A0] transition-transform group-hover:translate-x-1"
                            />
                          </div>
                          <span className="text-[10px] text-zinc-500 font-light mt-0.5 line-clamp-1">
                            {cat.desc}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Colecciones */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider text-zinc-500 py-1 leading-normal">
                      <Sparkles size={14} className="text-[#7043A0]" />
                      <span>Colecciones Especiales</span>
                    </div>
                    <div className="space-y-1.5">
                      {collections.map((col) => (
                        <Link
                          key={col.slug}
                          href={`/productos?collection=${col.slug}`}
                          onClick={() => setCollectionsMenuOpen(false)}
                          className="p-2.5 rounded-2xl bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC]/70 hover:border-[#7043A0] transition flex flex-col text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-zinc-900 group-hover:text-[#3F235F] transition-colors">
                              {col.name}
                            </span>
                            <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#DFD0EC] text-[#3F235F]">
                              {col.tag}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-light mt-0.5 line-clamp-1">
                            {col.desc}
                          </span>
                        </Link>
                      ))}

                      {/* Direct Discounts Link */}
                      <Link
                        href="/productos?ofertas=true"
                        onClick={() => setCollectionsMenuOpen(false)}
                        className="p-2.5 rounded-2xl bg-gradient-to-r from-[#F0E9F5] to-[#DFD0EC]/50 border border-[#C7B0DE] hover:border-[#7043A0] transition flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <Tag size={13} className="text-[#3F235F]" />
                          <span className="font-bold text-xs text-[#3F235F]">
                            Piezas en Descuento & Promoción
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#7043A0]">Ver Ofertas →</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DFD0EC] flex items-center justify-between text-xs text-zinc-600">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-700">
                    <Sparkles size={13} className="text-[#7043A0]" /> Plata 925 & Oro 18k Certificado
                  </span>
                  <Link
                    href="/productos"
                    onClick={() => setCollectionsMenuOpen(false)}
                    className="btn-purple-diamond text-[10px] uppercase font-bold tracking-wider px-4 py-1.5 rounded-xl shadow-xs"
                  >
                    Ver Catálogo Completo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. WhatsApp Advisor Icon Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition shadow-2xs"
            title="Asesoría personalizada por WhatsApp"
            aria-label="Asesoría WhatsApp"
          >
            <MessageCircle size={19} />
          </a>

          {/* 3. User Login / Account Icon Button */}
          <Link
            href={user ? '/cuenta' : '/login'}
            className="p-2.5 text-zinc-700 hover:text-[#3F235F] bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] rounded-2xl transition shadow-2xs flex items-center gap-1.5"
            title={user ? 'Mi Cuenta' : 'Iniciar Sesión'}
            aria-label="Mi Cuenta"
          >
            <User size={19} />
            {user && (
              <span className="hidden lg:inline text-xs font-bold text-zinc-900">
                {user.role === 'ADMIN' ? 'Admin' : 'Mi Cuenta'}
              </span>
            )}
          </Link>

          {/* 4. Carrito Trigger Button (Renamed from Bolsa to Carrito) */}
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 p-2.5 sm:px-4 sm:py-2.5 bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] hover:border-[#7043A0] rounded-2xl transition-all duration-200 group shadow-2xs cursor-pointer"
            aria-label="Carrito de compras"
          >
            <ShoppingBag
              size={19}
              className="text-[#3F235F] transition-transform group-hover:scale-108"
            />
            <span className="hidden sm:inline text-xs font-bold text-zinc-900">Carrito</span>
            {itemCount > 0 && (
              <span className="bg-[#3F235F] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-[#F8F5FA] border border-[#DFD0EC] focus-within:border-[#7043A0] focus-within:bg-white rounded-full p-1 pl-3 transition shadow-2xs">
          <Search className="text-[#7043A0] shrink-0" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar joyas, anillos, collares..."
            className="w-full bg-transparent px-2.5 py-1 text-xs text-zinc-900 focus:outline-none placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="shrink-0 btn-purple-diamond text-[10px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full shadow-xs cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[125px] bottom-0 bg-black/50 backdrop-blur-xs z-50 animate-fade-in">
          <div className="bg-white border-b border-[#DFD0EC] p-6 space-y-5 max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Categorías */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
                Categorías de Joyería
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/productos?category=${c.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-[#F8F5FA] rounded-2xl font-semibold text-zinc-800 hover:bg-[#F0E9F5] border border-[#DFD0EC] transition flex items-center gap-2"
                  >
                    <RoisinDiamond size={11} color="#7043A0" /> {c.name.split('&')[0]}
                  </Link>
                ))}
              </div>
            </div>

            {/* Colecciones */}
            <div className="space-y-2.5 border-t border-[#DFD0EC] pt-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
                Colecciones Exclusivas
              </span>
              <div className="space-y-2 text-xs">
                {collections.map((col) => (
                  <Link
                    key={col.slug}
                    href={`/productos?collection=${col.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-[#F8F5FA] rounded-2xl font-semibold text-zinc-900 hover:bg-[#F0E9F5] border border-[#DFD0EC] transition flex items-center justify-between"
                  >
                    <span>{col.name}</span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#DFD0EC] text-[#3F235F]">
                      {col.tag}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/productos?ofertas=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-gradient-to-r from-[#F0E9F5] to-[#DFD0EC]/50 rounded-2xl font-bold text-[#3F235F] border border-[#C7B0DE] transition flex items-center justify-between"
                >
                  <span>🔥 Descuentos & Ofertas Especiales</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Links & WhatsApp */}
            <div className="space-y-3 border-t border-[#DFD0EC] pt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl w-full justify-center shadow-2xs"
              >
                <MessageCircle size={16} /> Asesoría por WhatsApp
              </a>

              <Link
                href={user ? '/cuenta' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-[#3F235F] text-center py-2"
              >
                {user ? 'Mi Cuenta & Historial' : 'Iniciar Sesión / Registrarse'}
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-bold text-[#3F235F] pt-2 border-t text-center"
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

