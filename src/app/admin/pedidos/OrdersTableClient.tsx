'use client';

import { useState } from 'react';
import { adminUpdateOrderStatusAction } from '@/lib/actions/admin.actions';
import { OrderStatus } from '@prisma/client';
import { Eye, CheckCircle2, XCircle, ExternalLink, X, Clock, AlertCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface OrderItem {
  id: string;
  productTitle: string;
  sku: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string;
  city: string;
  province: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  payment: {
    id: string;
    method: string;
    status: string;
    evidenceUrl: string | null;
    referenceNumber: string | null;
  } | null;
  items: OrderItem[];
}

export default function OrdersTableClient({ orders: initialOrders }: { orders: OrderData[] }) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders =
    filterStatus === 'ALL'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const res = await adminUpdateOrderStatusAction(orderId, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Tabs in Pink Diamond Style */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { key: 'ALL', label: 'Todos los Pedidos' },
          { key: 'PENDING', label: 'Pendientes' },
          { key: 'PROCESSING', label: 'En Preparación' },
          { key: 'SHIPPED', label: 'En Camino' },
          { key: 'DELIVERED', label: 'Entregados' },
          { key: 'CANCELLED', label: 'Cancelados' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2.5 rounded-2xl font-bold uppercase tracking-wider transition shrink-0 shadow-2xs ${
              filterStatus === tab.key
                ? 'btn-pink-diamond shadow-xs'
                : 'bg-white text-zinc-700 hover:bg-[#FFF5F7] border border-[#FAD1DC] hover:border-[#E65573]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#FAD1DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#FAD1DC] bg-[#FFF5F7] text-zinc-900 font-bold">
                <th className="p-4 uppercase tracking-wider">Código</th>
                <th className="p-4 uppercase tracking-wider">Cliente</th>
                <th className="p-4 uppercase tracking-wider">Fecha</th>
                <th className="p-4 uppercase tracking-wider">Total</th>
                <th className="p-4 uppercase tracking-wider">Método & Comprobante</th>
                <th className="p-4 uppercase tracking-wider">Estado</th>
                <th className="p-4 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAD1DC]/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FFF8FA] transition">
                  <td className="p-4 font-mono font-bold text-zinc-900">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#D33658] hover:text-[#93203A] font-bold"
                    >
                      #{order.orderNumber}
                    </button>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-zinc-900">{order.customerName}</p>
                    <span className="text-[11px] text-zinc-400 block font-light">{order.customerEmail}</span>
                  </td>
                  <td className="p-4 text-zinc-600">
                    {new Date(order.createdAt).toLocaleDateString('es-EC', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="p-4 font-serif font-bold text-zinc-900 text-sm">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-zinc-800">
                        {order.payment?.method === 'BANK_TRANSFER' ? 'Transferencia' : 'Contra Entrega'}
                      </span>
                      {order.payment?.evidenceUrl && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 text-[10px] bg-[#FFF5F7] text-[#D33658] border border-[#FAD1DC] px-2 py-0.5 rounded-md font-bold hover:bg-[#FDE8ED] w-fit"
                        >
                          <CheckCircle2 size={11} className="text-emerald-600" /> Ver Comprobante
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="text-xs font-bold bg-[#FFF5F7] border border-[#FAD1DC] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#D33658] text-zinc-900 cursor-pointer shadow-2xs"
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="PAYMENT_PENDING">Pago Pendiente</option>
                      <option value="PROCESSING">En Preparación</option>
                      <option value="SHIPPED">En Camino</option>
                      <option value="DELIVERED">Entregado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-[#FFF5F7] rounded-xl text-zinc-600 hover:text-[#D33658] transition border border-transparent hover:border-[#FAD1DC]"
                      title="Ver detalle del pedido"
                      aria-label="Ver detalle"
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-zinc-400 font-light">
                    No se encontraron pedidos con este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-[#FAD1DC]">
            <div className="flex justify-between items-center pb-4 border-b border-[#FAD1DC]">
              <div className="flex items-center gap-2.5">
                <RoisinDiamond size={20} color="#E65573" />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-zinc-900">
                    Pedido #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-zinc-400 font-light">
                    Registrado el {new Date(selectedOrder.createdAt).toLocaleString('es-EC')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-[#FFF5F7] transition border border-transparent hover:border-[#FAD1DC]"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FAD1DC] space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Datos del Cliente</span>
                <p className="font-bold text-zinc-900 text-sm">{selectedOrder.customerName}</p>
                <p className="text-zinc-600">{selectedOrder.customerEmail}</p>
                <p className="text-zinc-600 font-medium">{selectedOrder.customerPhone || 'Sin teléfono'}</p>
              </div>

              <div className="p-4 bg-[#FFF8FA] rounded-2xl border border-[#FAD1DC] space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Dirección de Entrega</span>
                <p className="font-bold text-zinc-900">{selectedOrder.shippingAddress}</p>
                <p className="text-zinc-600">{selectedOrder.city}, {selectedOrder.province}</p>
              </div>
            </div>

            {/* Payment Evidence */}
            {selectedOrder.payment?.evidenceUrl && (
              <div className="p-5 bg-[#FFF5F7] border border-[#FAD1DC] rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#D33658] flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Comprobante de Transferencia Bancaria
                  </span>
                  {selectedOrder.payment.referenceNumber && (
                    <span className="text-xs font-mono font-bold text-zinc-800 bg-white px-2.5 py-0.5 rounded-full border border-[#FAD1DC]">
                      Ref: {selectedOrder.payment.referenceNumber}
                    </span>
                  )}
                </div>
                <div className="relative aspect-video max-w-md rounded-2xl overflow-hidden border border-[#FAD1DC] bg-white shadow-xs mx-auto">
                  <Image
                    src={selectedOrder.payment.evidenceUrl}
                    alt="Comprobante de Pago"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-700 block">
                Piezas de Joyería en el Pedido ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-[#FAD1DC]/60 border border-[#FAD1DC] rounded-2xl overflow-hidden text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3.5 flex justify-between items-center bg-white hover:bg-[#FFF8FA]">
                    <div className="flex items-center gap-2">
                      <RoisinDiamond size={10} color="#E65573" />
                      <div>
                        <p className="font-bold text-zinc-900">{it.productTitle}</p>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          SKU: {it.sku} • Cant: {it.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-zinc-900 text-sm">
                      ${it.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#FAD1DC] text-sm">
              <span className="font-bold text-zinc-700">Total Facturado:</span>
              <span className="font-serif text-2xl font-bold text-zinc-900">${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
