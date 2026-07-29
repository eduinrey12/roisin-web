import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <div className="mb-8 flex justify-center">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">¡Pedido Confirmado!</h1>
      <p className="text-gray-600 mb-8">
        Gracias por tu compra en Roisin. Hemos recibido tu pedido y lo procesaremos en breve.
        Te contactaremos por correo o WhatsApp con los detalles de pago y envío.
      </p>
      <Link href="/productos" className="inline-block bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition">
        Seguir Comprando
      </Link>
    </div>
  );
}
