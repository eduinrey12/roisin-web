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
} from 'lucide-react';

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
    <div className="min-h-screen flex bg-zinc-100 text-zinc-900 font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col shrink-0 border-r border-zinc-900">
        <div className="p-6 border-b border-zinc-800/80">
          <Link href="/admin" className="block">
            <span className="font-serif text-xl font-bold tracking-[0.2em] text-white">
              ROISIN
            </span>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-purple-400 font-sans mt-0.5">
              Panel Administrativo
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 hover:text-white transition text-zinc-300"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 hover:text-white transition text-zinc-300"
          >
            <ShoppingBag size={18} />
            Pedidos y Pagos
          </Link>
          <Link
            href="/admin/productos"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 hover:text-white transition text-zinc-300"
          >
            <PackageCheck size={18} />
            Catálogo / Productos
          </Link>
          <Link
            href="/admin/inventario"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 hover:text-white transition text-zinc-300"
          >
            <Boxes size={18} />
            Control de Inventario
          </Link>
          <Link
            href="/admin/cupones"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-900 hover:text-white transition text-zinc-300"
          >
            <Tag size={18} />
            Cupones y Descuentos
          </Link>

          <div className="pt-8 border-t border-zinc-900 mt-8">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              <ArrowLeft size={18} />
              Volver a la Tienda
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-900 text-[11px] text-zinc-500 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Sesión: {user.email}</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-zinc-200/80 px-8 flex items-center justify-between shadow-xs">
          <h2 className="text-xs uppercase font-bold tracking-widest text-zinc-500">
            Administración General
          </h2>
          <div className="text-xs text-zinc-600 font-medium">
            Entorno de Producción
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
