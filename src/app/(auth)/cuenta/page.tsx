import { getCurrentUser } from '@/lib/auth';
import { getUserOrders } from '@/services/order.service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import {
  Package,
  MapPin,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageCircle,
} from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mi Cuenta VIP | ROISIN Joyas',
  description: 'Historial de joyas adquiridas, estado de pedidos y perfil exclusivo en ROISIN.',
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/cuenta');
  }

  const orders = await getUserOrders(user.id);
  const profile = user.customerProfile;

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, soy ${profile?.firstName || 'cliente'} y requiero asistencia con mi cuenta o pedido.`
  )}`;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 space-y-10">
      {/* 1. VIP Profile Header Banner */}
      <div className="relative bg-gradient-to-r from-[#FFF5F7] via-white to-[#FDE8ED] p-7 sm:p-10 rounded-3xl border border-[#FAD1DC] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
        {/* Subtle Ambient Diamond Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#F08097]/15 to-transparent pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar with Pink Diamond Rim */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-br from-[#F08097] via-[#E65573] to-[#C22648] text-white rounded-3xl flex items-center justify-center font-serif font-black text-2xl sm:text-3xl shadow-lg border-2 border-white">
            {profile?.firstName?.[0] || user.email[0].toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.25em] text-[#D33658] bg-white px-3 py-1 rounded-full border border-[#FAD1DC] shadow-xs">
                <RoisinDiamond size={11} color="#E65573" /> Cliente VIP Roisin
              </span>
              {user.role === 'ADMIN' && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-[#141013] text-[#FAD1DC] px-3 py-1 rounded-full border border-[#3D1E26]">
                  Administrador
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Mi Espacio Exclusivo'}
            </h1>
            <p className="text-xs text-zinc-500 font-light">{user.email}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="btn-pink-outline text-xs uppercase tracking-wider font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xs"
            >
              <ShieldCheck size={16} /> Panel de Control
            </Link>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-5 py-3 rounded-2xl transition shadow-xs"
          >
            <MessageCircle size={15} /> Asistencia VIP
          </a>
          <LogoutButton />
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Orders History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[#FAD1DC] pb-4">
            <div className="flex items-center gap-2.5">
              <RoisinDiamond size={18} color="#E65573" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900">
                Historial de Joyas & Pedidos ({orders.length})
              </h2>
            </div>
            <Link
              href="/productos"
              className="text-xs uppercase font-bold tracking-widest text-[#D33658] hover:text-[#93203A] transition hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#FFF5F7] p-10 rounded-3xl border border-[#FAD1DC] text-center space-y-4 shadow-xs">
              <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-[#FAD1DC] shadow-xs">
                <ShoppingBag size={28} className="text-[#E65573]" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif text-lg font-bold text-zinc-900">
                  Aún no has adquirido joyas en tu cuenta
                </h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">
                  Descubre piezas en Plata de Ley 925 y Baño de Oro 18k con envío seguro a todo el país.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/productos"
                  className="btn-pink-diamond text-xs uppercase tracking-widest px-8 py-3.5 rounded-full font-bold transition shadow-md shimmer-button inline-flex items-center gap-2"
                >
                  Ver Joyas <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const isPaid = order.payment?.status === 'COMPLETED';
                const isVerifying = order.payment?.status === 'VERIFYING';

                return (
                  <div
                    key={order.id}
                    className="bg-white p-6 sm:p-7 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-5 luxury-card-hover"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-[#FFF0F3]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-zinc-900">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF5F7] text-[#D33658] border border-[#FAD1DC]">
                            {order.payment?.method === 'BANK_TRANSFER' ? 'Transferencia' : 'Contra Entrega'}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 block font-light">
                          {new Date(order.createdAt).toLocaleDateString('es-EC', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-[#FFF5F7] text-[#D33658] border border-[#FAD1DC]'
                          }`}
                        >
                          {order.status === 'PENDING'
                            ? 'Pendiente'
                            : order.status === 'PROCESSING'
                            ? 'En Preparación'
                            : order.status === 'SHIPPED'
                            ? 'En Camino'
                            : order.status === 'DELIVERED'
                            ? 'Entregado'
                            : 'Cancelado'}
                        </span>
                        <span className="font-serif font-bold text-lg text-zinc-900">
                          ${Number(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-2 text-xs">
                      {order.items.map((i) => (
                        <div
                          key={i.id}
                          className="flex justify-between items-center py-2 px-3 bg-[#FFF8FA] rounded-2xl border border-[#FAD1DC]/60"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <RoisinDiamond size={11} color="#E65573" />
                            <span className="font-medium text-zinc-900 truncate">
                              {i.variant.product.title}
                            </span>
                            <span className="text-zinc-500 font-semibold">
                              (x{i.quantity})
                            </span>
                          </div>
                          <span className="font-serif font-bold text-zinc-900 shrink-0">
                            ${(Number(i.price) * i.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer & Action Links */}
                    <div className="pt-3 border-t border-[#FFF0F3] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <CheckCircle2 size={14} /> Pago Confirmado
                          </span>
                        ) : isVerifying ? (
                          <span className="inline-flex items-center gap-1.5 text-[#D33658] font-semibold">
                            <Clock size={14} /> Comprobante en Verificación
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
                            <AlertCircle size={14} /> Pago Pendiente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/orden-confirmada/${order.id}`}
                          className="btn-pink-diamond text-[11px] uppercase font-bold tracking-wider px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Ver Resumen & Recibo</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: VIP Profile Card & Delivery Info */}
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#FAD1DC] pb-4">
              <RoisinDiamond size={15} color="#E65573" />
              <h3 className="font-serif font-bold text-base text-zinc-900">
                Información de Contacto
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-700">
              <div className="p-3.5 bg-[#FFF8FA] rounded-2xl border border-[#FAD1DC]/80 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Nombre Completo
                </span>
                <p className="font-bold text-zinc-900 text-sm">
                  {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'No especificado'}
                </p>
              </div>

              <div className="p-3.5 bg-[#FFF8FA] rounded-2xl border border-[#FAD1DC]/80 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Correo Electrónico
                </span>
                <p className="font-bold text-zinc-900 truncate">{user.email}</p>
              </div>

              <div className="p-3.5 bg-[#FFF8FA] rounded-2xl border border-[#FAD1DC]/80 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Teléfono / WhatsApp
                </span>
                <p className="font-bold text-zinc-900">{profile?.phone || 'No registrado'}</p>
              </div>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="bg-[#FFF5F7] p-7 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-sm text-zinc-900 flex items-center gap-2">
              <Sparkles size={16} className="text-[#E65573]" /> Garantías de tu Cuenta VIP
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-600 font-light">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#D33658] shrink-0" />
                <span>Certificado digital de autenticidad en cada compra</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#D33658] shrink-0" />
                <span>Acceso anticipado a lanzamientos de colecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#D33658] shrink-0" />
                <span>Atención prioritaria y personalizada por WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
