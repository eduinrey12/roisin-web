'use client';

import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(console.error);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Pedidos</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">ID Pedido</th>
              <th className="p-4 font-semibold text-gray-600">Cliente</th>
              <th className="p-4 font-semibold text-gray-600">Fecha</th>
              <th className="p-4 font-semibold text-gray-600">Total</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">{order.orderNumber}</td>
                <td className="p-4">
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.customerEmail}</div>
                </td>
                <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-4 font-bold">${order.total.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.status === 'PAYMENT_PENDING' || order.status === 'VERIFYING' ? 'bg-orange-100 text-orange-800' : ''}
                    ${order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' : ''}
                    ${order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : ''}
                    ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    value={order.status} 
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="PAYMENT_PENDING">Pago Pendiente</option>
                    <option value="PROCESSING">Procesando</option>
                    <option value="SHIPPED">Enviado</option>
                    <option value="DELIVERED">Entregado</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay pedidos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
