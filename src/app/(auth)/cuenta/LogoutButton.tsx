'use client';

import { logoutAction } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutAction();
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-xs uppercase tracking-wider font-semibold border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
    >
      <LogOut size={14} />
      {loading ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  );
}
