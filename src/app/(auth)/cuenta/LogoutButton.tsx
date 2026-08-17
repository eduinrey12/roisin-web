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
      className="text-xs uppercase tracking-wider font-bold border border-[#FAD1DC] bg-white text-[#D33658] hover:bg-[#FFF5F7] hover:border-[#E65573] px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
    >
      <LogOut size={14} />
      {loading ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  );
}
