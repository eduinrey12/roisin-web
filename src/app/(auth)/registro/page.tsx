'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/lib/actions/auth.actions';
import { useCartStore } from '@/lib/store/cartStore';
import Link from 'next/link';
import { Lock, Mail, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import RoisinLogo from '@/components/branding/RoisinLogo';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

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
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#EFCFD6] shadow-xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <RoisinLogo width={180} height={50} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Crear Cuenta Exclusiva
          </h1>
          <p className="text-xs text-zinc-500 font-light">
            Regístrate para compras más ágiles, guardar tus joyas favoritas y seguimiento
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Tu nombre"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-2xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Apellido</label>
              <input
                type="text"
                required
                placeholder="Tu apellido"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-2xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-2xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Teléfono (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="tel"
                placeholder="0991234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-2xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Contraseña (Mín. 6 caracteres)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-2xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md pt-3.5 mt-2 shimmer-button"
          >
            {loading ? 'Creando cuenta...' : 'Completar Registro'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-[#F0E6E8] text-center text-xs text-zinc-500">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-bold text-zinc-900 hover:text-[#BE6C7C] transition">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
