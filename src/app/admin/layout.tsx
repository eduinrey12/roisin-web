import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Boxes,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
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
    <div className="min-h-screen flex bg-[#FFF8FA] text-zinc-900 font-sans">
      {/* 1. Admin Sidebar (Deep Obsidian-Plum with Pink Diamond Accents) */}
      <aside className="w-68 bg-[#140E12] text-zinc-300 flex flex-col shrink-0 border-r border-[#2C1820] shadow-2xl">
        <div className="p-6 border-b border-[#2C1820] space-y-1">
          <Link href="/admin" className="inline-block">
            <RoisinLogo theme="light" showTagline={false} />
          </Link>
          <div className="flex items-center gap-1.5 pt-1 text-[9px] uppercase font-bold tracking-[0.25em] text-[#F08097]">
            <RoisinDiamond size={11} color="#F08097" />
            <span>Panel Administrativo</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2 text-xs font-semibold">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#23141B] hover:text-[#FAD1DC] transition text-zinc-300 group border border-transparent hover:border-[#3D1E28]"
          >
            <LayoutDashboard size={18} className="text-[#F08097] group-hover:scale-110 transition-transform" />
            <span>Dashboard Principal</span>
          </Link>

          <Link
            href="/admin/pedidos"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#23141B] hover:text-[#FAD1DC] transition text-zinc-300 group border border-transparent hover:border-[#3D1E28]"
          >
            <ShoppingBag size={18} className="text-[#F08097] group-hover:scale-110 transition-transform" />
            <span>Pedidos & Comprobantes</span>
          </Link>

          <Link
            href="/admin/productos"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#23141B] hover:text-[#FAD1DC] transition text-zinc-300 group border border-transparent hover:border-[#3D1E28]"
          >
            <PackageCheck size={18} className="text-[#F08097] group-hover:scale-110 transition-transform" />
            <span>Catálogo de Joyas</span>
          </Link>

          <Link
            href="/admin/inventario"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#23141B] hover:text-[#FAD1DC] transition text-zinc-300 group border border-transparent hover:border-[#3D1E28]"
          >
            <Boxes size={18} className="text-[#F08097] group-hover:scale-110 transition-transform" />
            <span>Control de Stock</span>
          </Link>

          <Link
            href="/admin/cupones"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#23141B] hover:text-[#FAD1DC] transition text-zinc-300 group border border-transparent hover:border-[#3D1E28]"
          >
            <Tag size={18} className="text-[#F08097] group-hover:scale-110 transition-transform" />
            <span>Cupones de Descuento</span>
          </Link>

          <div className="pt-6 border-t border-[#2C1820] mt-6 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-zinc-400 hover:text-white bg-[#1C1217] hover:bg-[#281720] border border-[#2E1822] transition text-[11px] font-bold uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={14} className="text-[#F08097]" /> Ver Tienda Pública
              </span>
              <RoisinDiamond size={10} color="#F08097" />
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-[#2C1820] text-[11px] text-zinc-400 flex items-center justify-between bg-[#100B0E]">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#FFF8FA]">
        <header className="h-18 bg-white/90 backdrop-blur-md border-b border-[#FAD1DC] px-8 flex items-center justify-between shadow-2xs sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={15} color="#E65573" />
            <h2 className="text-xs uppercase font-bold tracking-[0.25em] text-[#D33658]">
              Administración ROISIN
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#FFF5F7] px-3.5 py-1.5 rounded-full border border-[#FAD1DC] text-xs font-bold text-zinc-800">
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
