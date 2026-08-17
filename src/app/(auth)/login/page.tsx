'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth.actions';
import { useCartStore } from '@/lib/store/cartStore';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import RoisinLogo from '@/components/branding/RoisinLogo';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/cuenta';

  const { initCart } = useCartStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await loginAction(formData);
    setLoading(false);

    if (res.success && res.user) {
      await initCart();
      if (res.user.role === 'ADMIN' && redirect.startsWith('/admin')) {
        router.push(redirect);
      } else if (res.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
      router.refresh();
    } else {
      setError(res.error || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#FAD1DC] shadow-xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <RoisinLogo />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Bienvenida de Vuelta
          </h1>
          <p className="text-xs text-zinc-500 font-light">
            Ingresa a tu cuenta para gestionar tus joyas, pedidos y direcciones
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl focus:outline-none focus:border-[#D33658] focus:bg-white transition text-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl focus:outline-none focus:border-[#D33658] focus:bg-white transition text-zinc-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-pink-diamond py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md pt-3.5 mt-2 shimmer-button cursor-pointer"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar a mi Cuenta'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-[#FAD1DC] text-center text-xs text-zinc-500">
          ¿Aún no tienes una cuenta?{' '}
          <Link href="/registro" className="font-bold text-[#D33658] hover:text-[#93203A] transition">
            Crear cuenta aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
