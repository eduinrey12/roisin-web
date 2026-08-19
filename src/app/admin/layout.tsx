import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  FolderTree,
  Sparkles,
  Megaphone,
  Boxes,
  Tag,
  Truck,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import RoisinLogo from '@/components/branding/RoisinLogo';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login?redirect=/admin');
  }

  return (
    <div className="min-h-screen flex bg-[#FAF8FC] text-zinc-900 font-sans">
      {/* 1. Admin Sidebar (Deep Obsidian-Purple with Amethyst Diamond Accents) */}
      <aside className="w-68 h-screen sticky top-0 bg-[#1B1124] text-zinc-300 flex flex-col justify-between shrink-0 border-r border-[#341F48] shadow-2xl overflow-y-auto no-scrollbar z-40">
        <div>
          <div className="p-6 border-b border-[#341F48] space-y-1">
            <Link href="/admin" className="inline-block">
              <RoisinLogo theme="light" showTagline={false} />
            </Link>
            <div className="flex items-center gap-1.5 pt-1 text-[9px] uppercase font-bold tracking-[0.25em] text-[#C2A3DF]">
              <RoisinDiamond size={11} color="#C2A3DF" />
              <span>Panel Administrativo</span>
            </div>
          </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1 text-xs font-semibold overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <LayoutDashboard size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Dashboard Principal</span>
          </Link>

          <Link
            href="/admin/pedidos"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <ShoppingBag size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Pedidos & Estados</span>
          </Link>

          <Link
            href="/admin/productos"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <PackageCheck size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Catálogo de Joyas</span>
          </Link>

          <Link
            href="/admin/categorias"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <FolderTree size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Categorías de Joyería</span>
          </Link>

          <Link
            href="/admin/colecciones"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <Sparkles size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Colecciones Exclusivas</span>
          </Link>

          <Link
            href="/admin/promociones"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <Megaphone size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Banners & Promociones</span>
          </Link>

          <Link
            href="/admin/envios"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <Truck size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Tarifas de Envíos</span>
          </Link>

          <Link
            href="/admin/inventario"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <Boxes size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Control de Stock</span>
          </Link>

          <Link
            href="/admin/cupones"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-[#2B1B3A] hover:text-[#DFD0EC] transition text-zinc-300 group border border-transparent hover:border-[#4B2F66]"
          >
            <Tag size={17} className="text-[#C2A3DF] group-hover:scale-110 transition-transform" />
            <span>Cupones de Descuento</span>
          </Link>

          <div className="pt-4 border-t border-[#341F48] mt-4 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-zinc-400 hover:text-white bg-[#241730] hover:bg-[#341F48] border border-[#3C2553] transition text-[11px] font-bold uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={14} className="text-[#C2A3DF]" /> Ver Tienda Pública
              </span>
              <RoisinDiamond size={10} color="#C2A3DF" />
            </Link>
          </div>
        </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-[#341F48] text-[11px] text-zinc-400 flex items-center justify-between bg-[#150D1C] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#FAF8FC]">
        <header className="h-18 bg-white/90 backdrop-blur-md border-b border-[#DFD0EC] px-8 flex items-center justify-between shadow-2xs sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={15} color="#7043A0" />
            <h2 className="text-xs uppercase font-bold tracking-[0.25em] text-[#3F235F]">
              Administración ROISIN Diamante Morado
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#F8F5FA] px-3.5 py-1.5 rounded-full border border-[#DFD0EC] text-xs font-bold text-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Base de Datos Conectada</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1440px] w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

