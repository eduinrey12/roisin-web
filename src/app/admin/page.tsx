import { adminGetDashboardMetrics } from '@/services/order.service';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Clock, AlertTriangle, ArrowRight, PlusCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { getOrderStatusLabel, getOrderStatusColor, getPaymentMethodLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const metrics = await adminGetDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* 1. Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#DFD0EC] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] mb-1">
            <RoisinDiamond size={13} color="#7043A0" /> Métricas & Desempeño
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
            Dashboard General
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Monitoreo en tiempo real de ingresos, órdenes activas y stock de joyas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="btn-purple-diamond text-xs uppercase tracking-wider font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md cursor-pointer"
          >
            <PlusCircle size={15} /> Nueva Joya
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards Grid in Purple Diamond Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Ventas Totales</span>
            <div className="p-2.5 bg-[#F8F5FA] text-[#3F235F] rounded-2xl border border-[#DFD0EC]">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="font-sans text-3xl font-bold text-[#3F235F]">
            ${metrics.totalSales.toFixed(2)}
          </p>
          <span className="text-[11px] text-zinc-400 block font-light">Calculado sobre órdenes válidas</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Pedidos Totales</span>
            <div className="p-2.5 bg-[#F8F5FA] text-[#3F235F] rounded-2xl border border-[#DFD0EC]">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="font-sans text-3xl font-bold text-zinc-900">{metrics.totalOrders}</p>
          <span className="text-[11px] text-zinc-400 block font-light">Histórico completo de compras</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Por Procesar</span>
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl border border-purple-200">
              <Clock size={18} />
            </div>
          </div>
          <p className="font-sans text-3xl font-bold text-purple-800">{metrics.pendingOrders}</p>
          <span className="text-[11px] text-zinc-400 block font-light">Pendientes de pago o despacho</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-700">Stock Crítico</span>
            <div className="p-2.5 bg-red-50 text-red-700 rounded-2xl border border-red-200">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="font-sans text-3xl font-bold text-red-600">{metrics.lowStockCount}</p>
          <span className="text-[11px] text-zinc-400 block font-light">Variantes con 5 o menos u.</span>
        </div>
      </div>

      {/* 3. Recent Orders Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RoisinDiamond size={15} color="#7043A0" />
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-zinc-900">
                Últimos Pedidos Registrados
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-light mt-0.5">Actividad comercial más reciente en la tienda</p>
          </div>

          <Link
            href="/admin/pedidos"
            className="text-xs uppercase font-bold tracking-wider text-[#3F235F] hover:text-[#7043A0] transition inline-flex items-center gap-1.5 px-4 py-2 bg-[#F8F5FA] rounded-full border border-[#DFD0EC] cursor-pointer"
          >
            <span>Ver Todos los Pedidos</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#DFD0EC]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DFD0EC] bg-[#F8F5FA] text-zinc-900 font-bold">
                <th className="p-4 uppercase tracking-wider">Código</th>
                <th className="p-4 uppercase tracking-wider">Cliente</th>
                <th className="p-4 uppercase tracking-wider">Fecha</th>
                <th className="p-4 uppercase tracking-wider">Total</th>
                <th className="p-4 uppercase tracking-wider">Método de Pago</th>
                <th className="p-4 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFD0EC]/60">
              {(metrics.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="hover:bg-[#F8F5FA]/50 transition">
                  <td className="p-4 font-mono font-bold text-zinc-900">
                    <Link
                      href="/admin/pedidos"
                      className="text-[#3F235F] hover:text-[#7043A0] font-bold"
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
                  <td className="p-4 font-sans font-bold text-[#3F235F] text-sm">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="p-4 text-zinc-700 font-medium">
                    <span className="inline-flex items-center gap-1 text-[#3F235F] bg-[#F8F5FA] px-2.5 py-1 rounded-full border border-[#DFD0EC] font-bold text-[10.5px]">
                      {getPaymentMethodLabel(order.payment?.method)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {getOrderStatusLabel(order.status)}
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

