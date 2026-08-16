'use client';

import { useState } from 'react';
import { adminUpdateOrderStatusAction } from '@/lib/actions/admin.actions';
import { OrderStatus } from '@prisma/client';
import { Eye, CheckCircle2, XCircle, ExternalLink, X } from 'lucide-react';
import Image from 'next/image';

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
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {['ALL', 'PENDING', 'PAYMENT_PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl font-semibold uppercase tracking-wider transition shrink-0 ${
                filterStatus === st
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st}
            </button>
          )
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600">
                <th className="p-4 font-bold uppercase tracking-wider">Código</th>
                <th className="p-4 font-bold uppercase tracking-wider">Cliente</th>
                <th className="p-4 font-bold uppercase tracking-wider">Fecha</th>
                <th className="p-4 font-bold uppercase tracking-wider">Total</th>
                <th className="p-4 font-bold uppercase tracking-wider">Pago</th>
                <th className="p-4 font-bold uppercase tracking-wider">Estado</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition">
                  <td className="p-4 font-mono font-bold text-black">{order.orderNumber}</td>
                  <td className="p-4">
                    <p className="font-semibold text-black">{order.customerName}</p>
                    <span className="text-[11px] text-zinc-400 block">{order.customerEmail}</span>
                  </td>
                  <td className="p-4 text-zinc-600">
                    {new Date(order.createdAt).toLocaleDateString('es-EC')}
                  </td>
                  <td className="p-4 font-bold text-black">${order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="font-medium block text-zinc-800">
                      {order.payment?.method === 'BANK_TRANSFER' ? 'Transferencia' : 'Contra Entrega'}
                    </span>
                    {order.payment?.evidenceUrl && (
                      <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded mt-0.5">
                        Comprobante adjunto
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="text-xs font-semibold bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-black"
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="PAYMENT_PENDING">Pago Pendiente</option>
                      <option value="PROCESSING">Procesando</option>
                      <option value="SHIPPED">Enviado</option>
                      <option value="DELIVERED">Entregado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 hover:text-black transition"
                      title="Ver detalle del pedido"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    No se encontraron pedidos con este estado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
              <div>
                <h3 className="font-serif text-2xl font-bold text-black">
                  Pedido {selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-zinc-400">
                  Creado el {new Date(selectedOrder.createdAt).toLocaleString('es-EC')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-zinc-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Datos del Cliente</span>
                <p className="font-bold text-black">{selectedOrder.customerName}</p>
                <p className="text-zinc-600">{selectedOrder.customerEmail}</p>
                <p className="text-zinc-600">{selectedOrder.customerPhone || 'Sin teléfono'}</p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Dirección de Entrega</span>
                <p className="font-bold text-black">{selectedOrder.shippingAddress}</p>
                <p className="text-zinc-600">{selectedOrder.city}, {selectedOrder.province}</p>
              </div>
            </div>

            {/* Payment Evidence */}
            {selectedOrder.payment?.evidenceUrl && (
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-900">
                    Comprobante de Transferencia
                  </span>
                  {selectedOrder.payment.referenceNumber && (
                    <span className="text-xs font-mono text-amber-800">
                      Ref: {selectedOrder.payment.referenceNumber}
                    </span>
                  )}
                </div>
                <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-amber-300">
                  <Image
                    src={selectedOrder.payment.evidenceUrl}
                    alt="Comprobante"
                    fill
                    className="object-contain bg-black/5"
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                Productos del Pedido ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3.5 flex justify-between items-center bg-white">
                    <div>
                      <p className="font-bold text-black">{it.productTitle}</p>
                      <span className="text-[11px] text-zinc-500">
                        SKU: {it.sku} • Cant: {it.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-black">${it.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-100 text-sm">
              <span className="font-bold text-zinc-900">Total del Pedido:</span>
              <span className="text-xl font-bold text-black">${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
