import { adminGetDashboardMetrics } from '@/services/order.service';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Clock, Tag, AlertTriangle, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const metrics = await adminGetDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* 1. Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#FAD1DC] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#D33658] mb-1">
            <RoisinDiamond size={13} color="#E65573" /> Métricas & Desempeño
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
            Dashboard General
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Monitoreo en tiempo real de ingresos, órdenes activas y stock de joyas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="btn-pink-diamond text-xs uppercase tracking-wider font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md shimmer-button"
          >
            <PlusCircle size={15} /> Nueva Joya
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards Grid in Pink Diamond Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-2 diamond-glow luxury-card-hover">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Ventas Totales</span>
            <div className="p-2.5 bg-[#FFF5F7] text-[#D33658] rounded-2xl border border-[#FAD1DC]">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-zinc-900">
            ${metrics.totalSales.toFixed(2)}
          </p>
          <span className="text-[11px] text-zinc-400 block font-light">Calculado sobre órdenes válidas</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-2 diamond-glow luxury-card-hover">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Pedidos Totales</span>
            <div className="p-2.5 bg-[#FFF5F7] text-[#D33658] rounded-2xl border border-[#FAD1DC]">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-zinc-900">{metrics.totalOrders}</p>
          <span className="text-[11px] text-zinc-400 block font-light">Histórico completo de compras</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-2 diamond-glow luxury-card-hover">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Por Procesar</span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
              <Clock size={18} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-amber-800">{metrics.pendingOrders}</p>
          <span className="text-[11px] text-zinc-400 block font-light">Pendientes de pago o despacho</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-2 diamond-glow luxury-card-hover">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Stock Crítico</span>
            <div className="p-2.5 bg-red-50 text-red-700 rounded-2xl border border-red-200">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-red-600">{metrics.lowStockCount}</p>
          <span className="text-[11px] text-zinc-400 block font-light">Variantes con 5 o menos u.</span>
        </div>
      </div>

      {/* 3. Recent Orders Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RoisinDiamond size={15} color="#E65573" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900">
                Últimos Pedidos Registrados
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-light mt-0.5">Actividad comercial más reciente en la tienda</p>
          </div>

          <Link
            href="/admin/pedidos"
            className="text-xs uppercase font-bold tracking-wider text-[#D33658] hover:text-[#93203A] transition inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF5F7] rounded-full border border-[#FAD1DC]"
          >
            <span>Ver Todos los Pedidos</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#FAD1DC]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#FAD1DC] bg-[#FFF5F7] text-zinc-900 font-bold">
                <th className="p-4 uppercase tracking-wider">Código</th>
                <th className="p-4 uppercase tracking-wider">Cliente</th>
                <th className="p-4 uppercase tracking-wider">Fecha</th>
                <th className="p-4 uppercase tracking-wider">Total</th>
                <th className="p-4 uppercase tracking-wider">Método de Pago</th>
                <th className="p-4 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAD1DC]/60">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FFF8FA] transition">
                  <td className="p-4 font-mono font-bold text-zinc-900">
                    <Link
                      href="/admin/pedidos"
                      className="text-[#D33658] hover:text-[#93203A] font-bold"
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-zinc-900">{order.customerName}</p>
                    <span className="text-[11px] text-zinc-400 font-light">{order.customerEmail}</span>
                  </td>
                  <td className="p-4 text-zinc-600">
                    {new Date(order.createdAt).toLocaleDateString('es-EC', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="p-4 font-serif font-bold text-zinc-900 text-sm">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="p-4 text-zinc-700 font-medium">
                    {order.payment?.method === 'BANK_TRANSFER' ? (
                      <span className="inline-flex items-center gap-1 text-[#D33658] bg-[#FFF5F7] px-2.5 py-1 rounded-full border border-[#FAD1DC] font-bold text-[10.5px]">
                        Transferencia
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200 font-bold text-[10.5px]">
                        Contra Entrega
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
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
                        ? 'En Proceso'
                        : order.status === 'SHIPPED'
                        ? 'Enviado'
                        : order.status === 'DELIVERED'
                        ? 'Entregado'
                        : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
              {metrics.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-zinc-400 font-light">
                    No se han registrado pedidos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
