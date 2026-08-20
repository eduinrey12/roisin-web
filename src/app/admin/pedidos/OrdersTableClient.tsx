'use client';

import { useState } from 'react';
import { adminUpdateOrderStatusAction } from '@/lib/actions/admin.actions';
import { OrderStatus } from '@prisma/client';
import { Eye, CheckCircle2, X, PenTool } from 'lucide-react';
import Image from 'next/image';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { getOrderStatusLabel, getOrderStatusColor, getPaymentMethodLabel } from '@/lib/utils';
import CustomSelect from '@/components/ui/CustomSelect';

interface OrderItem {
  id: string;
  productTitle: string;
  sku: string;
  quantity: number;
  price: number;
  dedication?: string | null;
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
  dedication?: string | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
  payment: {
    id: string;
    method: string;
    status: string;
    cardLastFour?: string | null;
    cardBrand?: string | null;
    installments?: number | null;
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
      {/* Filter Tabs in Purple Diamond Style */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { key: 'ALL', label: 'Todos los Pedidos' },
          { key: 'PENDING', label: 'Pendientes' },
          { key: 'PAYMENT_PENDING', label: 'Pago Pendiente' },
          { key: 'PROCESSING', label: 'En Proceso' },
          { key: 'SHIPPED', label: 'Enviados' },
          { key: 'DELIVERED', label: 'Entregados' },
          { key: 'CANCELLED', label: 'Cancelados' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2.5 rounded-2xl font-bold uppercase tracking-wider transition shrink-0 cursor-pointer ${
              filterStatus === tab.key
                ? 'btn-purple-diamond shadow-xs'
                : 'bg-white text-zinc-700 hover:bg-[#F8F5FA] border border-[#DFD0EC] hover:border-[#7043A0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#DFD0EC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DFD0EC] bg-[#F8F5FA] text-zinc-900 font-bold">
                <th className="p-4 uppercase tracking-wider">Código</th>
                <th className="p-4 uppercase tracking-wider">Cliente</th>
                <th className="p-4 uppercase tracking-wider">Fecha</th>
                <th className="p-4 uppercase tracking-wider">Total</th>
                <th className="p-4 uppercase tracking-wider">Método de Pago</th>
                <th className="p-4 uppercase tracking-wider">Estado (Español)</th>
                <th className="p-4 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFD0EC]/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F8F5FA]/50 transition">
                  <td className="p-4 font-mono font-bold text-zinc-900">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#3F235F] hover:text-[#7043A0] font-bold cursor-pointer"
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
                  <td className="p-4 font-sans font-bold text-[#3F235F] text-sm">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-zinc-800">
                        {getPaymentMethodLabel(order.payment?.method)}
                      </span>
                      {order.payment?.evidenceUrl && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 text-[10px] bg-[#F8F5FA] text-[#3F235F] border border-[#DFD0EC] px-2 py-0.5 rounded-md font-bold hover:bg-[#F0E9F5] w-fit cursor-pointer"
                        >
                          <CheckCircle2 size={11} className="text-emerald-600" /> Ver Comprobante
                        </button>
                      )}
                      {order.payment?.cardLastFour && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {order.payment.cardBrand} •••• {order.payment.cardLastFour}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <CustomSelect
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                      options={[
                        { value: 'PENDING', label: 'Pendiente' },
                        { value: 'PAYMENT_PENDING', label: 'Pago Pendiente' },
                        { value: 'PROCESSING', label: 'En Proceso' },
                        { value: 'SHIPPED', label: 'Enviado' },
                        { value: 'DELIVERED', label: 'Entregado' },
                        { value: 'CANCELLED', label: 'Cancelado' },
                      ]}
                      triggerClassName={`text-xs font-bold border rounded-xl px-3 py-1.5 shadow-2xs ${getOrderStatusColor(
                        order.status
                      )}`}
                      dropdownClassName="w-48 right-0 left-auto"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-[#F8F5FA] rounded-xl text-zinc-600 hover:text-[#3F235F] transition border border-transparent hover:border-[#DFD0EC] cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-[#DFD0EC]">
            <div className="flex justify-between items-center pb-4 border-b border-[#DFD0EC]">
              <div className="flex items-center gap-2.5">
                <RoisinDiamond size={20} color="#7043A0" />
                <div>
                  <h3 className="font-sans text-2xl font-bold text-zinc-900">
                    Pedido #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-zinc-400 font-light">
                    Registrado el {new Date(selectedOrder.createdAt).toLocaleString('es-EC')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-black rounded-full hover:bg-[#F8F5FA] transition border border-transparent hover:border-[#DFD0EC] cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Datos del Cliente</span>
                <p className="font-bold text-zinc-900 text-sm">{selectedOrder.customerName}</p>
                <p className="text-zinc-600">{selectedOrder.customerEmail}</p>
                <p className="text-zinc-600 font-medium">{selectedOrder.customerPhone || 'Sin teléfono'}</p>
              </div>

              <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Dirección de Entrega</span>
                <p className="font-bold text-zinc-900">{selectedOrder.shippingAddress}</p>
                <p className="text-zinc-600">{selectedOrder.city}, {selectedOrder.province}</p>
                <p className="text-[#3F235F] font-bold mt-1">
                  {getPaymentMethodLabel(selectedOrder.payment?.method)}
                </p>
              </div>
            </div>

            {/* Dedication on Order */}
            {selectedOrder.dedication && (
              <div className="p-4 bg-[#F0E9F5] rounded-2xl border border-[#DFD0EC] space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#3F235F]">
                  <PenTool size={13} />
                  <span>Mensaje de Dedicatoria para Tarjeta de Regalo:</span>
                </div>
                <p className="italic text-zinc-800">&ldquo;{selectedOrder.dedication}&rdquo;</p>
              </div>
            )}

            {/* Payment Evidence */}
            {selectedOrder.payment?.evidenceUrl && (
              <div className="p-5 bg-[#F8F5FA] border border-[#DFD0EC] rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#3F235F] flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Comprobante de Pago
                  </span>
                  {selectedOrder.payment.referenceNumber && (
                    <span className="text-xs font-mono font-bold text-zinc-800 bg-white px-2.5 py-0.5 rounded-full border border-[#DFD0EC]">
                      Ref: {selectedOrder.payment.referenceNumber}
                    </span>
                  )}
                </div>
                <div className="relative aspect-video max-w-md rounded-2xl overflow-hidden border border-[#DFD0EC] bg-white shadow-xs mx-auto">
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
              <div className="divide-y divide-[#DFD0EC]/60 border border-[#DFD0EC] rounded-2xl overflow-hidden text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3.5 flex justify-between items-center bg-white hover:bg-[#F8F5FA]">
                    <div className="flex items-center gap-2">
                      <RoisinDiamond size={10} color="#7043A0" />
                      <div>
                        <p className="font-bold text-zinc-900">{it.productTitle}</p>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          SKU: {it.sku} • Cant: {it.quantity}
                        </span>
                        {it.dedication && (
                          <span className="text-[10px] text-zinc-400 italic block">
                            Nota: &ldquo;{it.dedication}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-sans font-bold text-[#3F235F] text-sm">
                      ${it.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#DFD0EC] text-sm">
              <span className="font-bold text-zinc-700">Total Facturado:</span>
              <span className="font-sans text-2xl font-bold text-[#3F235F]">${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

