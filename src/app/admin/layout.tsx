import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">
          ROISIN ADMIN
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-800 transition">Dashboard</Link>
          <Link href="/admin/orders" className="block px-4 py-2 rounded hover:bg-gray-800 transition">Pedidos</Link>
          <Link href="/admin/coupons" className="block px-4 py-2 rounded hover:bg-gray-800 transition">Cupones</Link>
          <Link href="/" className="block px-4 py-2 rounded hover:bg-gray-800 transition text-gray-400 mt-8">Volver a Tienda</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow px-8 py-4 flex justify-end">
          <span className="font-semibold">Panel de Administración</span>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
