'use client';

import { useState } from 'react';
import { register } from '@/lib/api/auth';
import { useCartStore } from '@/lib/store/cartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const router = useRouter();
  const mergeCart = useCartStore(s => s.mergeCart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      await mergeCart();
      router.push('/productos');
    } catch (err) {
      setError('Error al registrarse. Intente con otro correo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border rounded-lg shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Crear Cuenta</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required placeholder="Nombre" className="appearance-none rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              <input type="text" required placeholder="Apellido" className="appearance-none rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <input type="email" required placeholder="Correo electrónico" className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="password" required placeholder="Contraseña" className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              Registrar
            </button>
          </div>
          <div className="text-sm text-center">
            ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
