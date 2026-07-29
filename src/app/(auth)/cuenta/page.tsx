'use client';

import { useEffect, useState } from 'react';
import { getProfile, logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getProfile().then(p => {
      if (!p) router.push('/login');
      else setProfile(p);
    });
  }, [router]);

  if (!profile) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Datos Personales</h2>
        <p className="text-gray-600">Email: {profile.email}</p>
        <p className="text-gray-600">Rol: {profile.role}</p>
      </div>

      <button 
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="text-red-600 border border-red-600 px-6 py-2 rounded-md hover:bg-red-50 transition"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
