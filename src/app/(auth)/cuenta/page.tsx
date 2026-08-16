import { getCurrentUser } from '@/lib/auth';
import { getUserOrders } from '@/services/order.service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { Package, MapPin, User, ShieldAlert, ArrowRight } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Profile Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
            {profile?.firstName?.[0] || user.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Mi Cuenta'}
            </h1>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-widest bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                Rol: Administrador
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-xs uppercase tracking-wider font-semibold bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition"
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
            <Package size={20} className="text-black" />
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Historial de Pedidos ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center space-y-3">
              <p className="text-xs text-gray-500">Aún no has realizado ningún pedido.</p>
              <Link
                href="/productos"
                className="inline-block text-xs uppercase tracking-widest bg-black text-white px-6 py-2.5 rounded-full font-semibold hover:bg-zinc-800 transition"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-mono font-bold text-xs text-gray-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        {new Date(order.createdAt).toLocaleDateString('es-EC', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'PROCESSING' || order.status === 'SHIPPED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-700">
                        <span>
                          {item.quantity}x {item.variant.product.title} ({item.variant.sku})
                        </span>
                        <span className="font-semibold">${Number(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                    <span className="font-bold text-gray-900">Total: ${Number(order.total).toFixed(2)}</span>
                    <Link
                      href={`/orden-confirmada/${order.id}`}
                      className="text-black font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Ver Detalle <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Personal Details & Shipping Address */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-black" />
            <h2 className="font-serif text-xl font-bold text-gray-900">Datos de Envío</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-xs">
            <div>
              <span className="text-[11px] text-gray-400 uppercase font-semibold">Teléfono registrado</span>
              <p className="font-medium text-gray-900 mt-0.5">{profile?.phone || 'No registrado'}</p>
            </div>

            {profile?.addresses && profile.addresses.length > 0 ? (
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-semibold">Dirección Principal</span>
                <p className="font-medium text-gray-900 mt-0.5">{profile.addresses[0].street}</p>
                <p className="text-gray-500">
                  {profile.addresses[0].city}, {profile.addresses[0].province}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 italic">No hay direcciones guardadas aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
