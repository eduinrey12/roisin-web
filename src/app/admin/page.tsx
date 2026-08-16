import { adminGetDashboardMetrics } from '@/services/order.service';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Clock, Tag, AlertTriangle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const metrics = await adminGetDashboardMetrics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900">Dashboard General</h1>
        <p className="text-xs text-zinc-500 mt-1">Resumen en vivo de ventas, pedidos e inventario</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs uppercase font-bold tracking-wider">Ventas Totales</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">
            ${metrics.totalSales.toFixed(2)}
          </p>
          <span className="text-[11px] text-zinc-400 block">Calculado sobre pedidos activos</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs uppercase font-bold tracking-wider">Pedidos Totales</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{metrics.totalOrders}</p>
          <span className="text-[11px] text-zinc-400 block">Histórico de órdenes</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs uppercase font-bold tracking-wider">Pedidos por Procesar</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-700">{metrics.pendingOrders}</p>
          <span className="text-[11px] text-zinc-400 block">Requieren verificación o envío</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs uppercase font-bold tracking-wider">Alertas de Stock</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{metrics.lowStockCount}</p>
          <span className="text-[11px] text-zinc-400 block">Variantes con 5 o menos unidades</span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-zinc-900">Últimos Pedidos</h2>
            <p className="text-xs text-zinc-500">Actividad reciente de compras</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs uppercase tracking-wider font-semibold text-black hover:underline flex items-center gap-1"
          >
            Ver todos los pedidos <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600">
                <th className="p-3.5 font-bold uppercase tracking-wider">Código</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Cliente</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Fecha</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Total</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Método</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition">
                  <td className="p-3.5 font-mono font-bold text-black">{order.orderNumber}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-black">{order.customerName}</p>
                    <span className="text-[11px] text-zinc-500">{order.customerEmail}</span>
                  </td>
                  <td className="p-3.5 text-zinc-600">
                    {new Date(order.createdAt).toLocaleDateString('es-EC')}
                  </td>
                  <td className="p-3.5 font-bold text-black">${Number(order.total).toFixed(2)}</td>
                  <td className="p-3.5 text-zinc-600">
                    {order.payment?.method === 'BANK_TRANSFER' ? 'Transferencia' : 'Contra Entrega'}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase tracking-wider ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'PROCESSING' || order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {metrics.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
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
