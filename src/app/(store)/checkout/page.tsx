'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function CheckoutPage() {
  const { cart, guestToken, initCart } = useCartStore();
  const [regions, setRegions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', province: '', regionId: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/shipping/regions`)
      .then(res => res.json())
      .then(data => setRegions(data));
  }, []);

  const selectedRegion = regions.find(r => r.id === formData.regionId);
  const shippingCost = selectedRegion ? selectedRegion.baseRate : 0;
  
  const subtotal = cart?.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.variant.price), 0) || 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    
    setLoading(true);
    try {
      const authToken = Cookies.get('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-guest-token': guestToken,
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...formData, shippingCost })
      });

      if (res.ok) {
        await initCart(); // refresh cart (now empty)
        router.push('/success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items?.length === 0) {
    return <div className="text-center py-20">Tu carrito está vacío.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">Datos de Envío</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required placeholder="Nombre" className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <input type="text" required placeholder="Apellido" className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="email" required placeholder="Email" className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="tel" required placeholder="Teléfono" className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <input type="text" required placeholder="Dirección completa" className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, address: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required placeholder="Ciudad" className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, city: e.target.value})} />
              <input type="text" required placeholder="Provincia" className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, province: e.target.value})} />
            </div>
            <select required className="w-full px-4 py-2 border rounded" onChange={e => setFormData({...formData, regionId: e.target.value})}>
              <option value="">Seleccione zona de envío</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name} - ${r.baseRate.toFixed(2)}</option>
              ))}
            </select>
          </form>
        </div>
        
        <div className="w-full lg:w-96">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
            <div className="space-y-4 mb-4">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.variant.product.title}</span>
                  <span>${(item.quantity * item.variant.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Calculando...'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              form="checkout-form" 
              type="submit" 
              disabled={loading || !formData.regionId}
              className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
