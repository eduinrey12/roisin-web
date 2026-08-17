import { getCurrentUser } from '@/lib/auth';
import { getUserOrders } from '@/services/order.service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { Package, MapPin, User, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mi Cuenta | ROISIN Joyas',
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/cuenta');
  }

  const orders = await getUserOrders(user.id);
  const profile = user.customerProfile;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Header Profile Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFCFD6] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#FAF4F5] text-zinc-900 border border-[#EFCFD6] rounded-full flex items-center justify-center font-serif font-bold text-xl shadow-xs">
            {profile?.firstName?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#BE6C7C] block">
              Perfil Exclusivo
            </span>
            <h1 className="font-serif text-2xl font-bold text-zinc-900">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Mi Cuenta'}
            </h1>
            <p className="text-xs text-zinc-500">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-widest bg-zinc-900 text-white px-2.5 py-0.5 rounded-full">
                Rol: Administrador
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-xs uppercase tracking-wider font-bold bg-zinc-900 text-white px-4 py-2.5 rounded-xl hover:bg-black transition"
            >
              Panel Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* Main Grid: Orders & Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={18} color="#BE6C7C" />
            <h2 className="font-serif text-xl font-bold text-zinc-900">
              Historial de Joyas & Pedidos ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#F0E6E8] text-center space-y-3">
              <p className="text-xs text-zinc-500">Aún no has realizado ningún pedido.</p>
              <Link
                href="/productos"
                className="inline-block text-xs uppercase tracking-widest bg-zinc-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-black transition"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-[#F0E6E8] shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-[#FAF4F5]">
                    <div>
                      <span className="font-mono font-bold text-xs text-zinc-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-zinc-400 block">
                        {new Date(order.createdAt).toLocaleDateString('es-EC', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="font-serif font-bold text-sm text-zinc-900">
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="space-y-1 text-xs text-zinc-600">
                    {order.items.map((i) => (
                      <div key={i.id} className="flex justify-between items-center py-1">
                        <span className="truncate pr-2">
                          {i.variant.product.title} (x{i.quantity})
                        </span>
                        <span className="font-medium text-zinc-900 shrink-0">
                          ${Number(i.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#FAF4F5] flex justify-end">
                    <Link
                      href={`/orden-confirmada/${order.id}`}
                      className="text-[11px] uppercase font-bold tracking-wider text-[#D33658] hover:text-[#93203A] inline-flex items-center gap-1 transition-colors group"
                    >
                      <span>Ver Detalle Completo</span>
                      <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Customer Details Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F0E6E8] shadow-xs space-y-4 text-xs">
          <h3 className="font-serif font-bold text-sm text-zinc-900 border-b border-[#F0E6E8] pb-3 flex items-center gap-2">
            <RoisinDiamond size={13} color="#E2A3B0" /> Datos de Contacto
          </h3>
          <div className="space-y-2 text-zinc-600">
            <p>
              <strong className="text-zinc-900 block font-semibold">Nombre:</strong>
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'No especificado'}
            </p>
            <p>
              <strong className="text-zinc-900 block font-semibold">Correo:</strong>
              {user.email}
            </p>
            <p>
              <strong className="text-zinc-900 block font-semibold">WhatsApp:</strong>
              {profile?.phone || 'No registrado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
