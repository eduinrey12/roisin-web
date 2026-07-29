'use client';

import { useCartStore } from '@/lib/store/cartStore';

export default function CartDrawer() {
  const { cart, isOpen, toggleCart } = useCartStore();

  if (!isOpen) return null;

  const total = cart?.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.variant.price), 0) || 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={toggleCart} />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Tu Carrito</h2>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cart?.items?.length ? (
            <div className="text-center text-gray-500 py-12">El carrito está vacío</div>
          ) : (
            cart.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <div className="w-20 h-20 bg-gray-100 rounded">
                  {item.variant.product.images?.[0] && (
                    <img src={item.variant.product.images[0].url} alt="" className="w-full h-full object-cover rounded" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.variant.product.title}</h3>
                  <p className="text-sm text-gray-500">{item.variant.sku}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold">${item.variant.price}</span>
                    <span className="text-sm">Cant: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart?.items?.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
            <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition">
              Proceder al pago
            </button>
          </div>
        )}
      </div>
    </>
  );
}
