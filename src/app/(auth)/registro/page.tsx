'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/lib/actions/auth.actions';
import { useCartStore } from '@/lib/store/cartStore';
import Link from 'next/link';
import { Lock, Mail, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { initCart } = useCartStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await registerAction(formData);
    setLoading(false);

    if (res.success) {
      await initCart();
      router.push('/cuenta');
      router.refresh();
    } else {
      setError(res.error || 'Error al registrar la cuenta');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gray-500">
            ROISIN Joyas
          </span>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-xs text-gray-500">Regístrate para compras más rápidas y seguimiento</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Nombre"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3.5 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Apellido</label>
              <input
                type="text"
                required
                placeholder="Apellido"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3.5 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Teléfono (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="tel"
                placeholder="0991234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Contraseña (Mín. 6 caracteres)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md pt-3.5 mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-bold text-black hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
