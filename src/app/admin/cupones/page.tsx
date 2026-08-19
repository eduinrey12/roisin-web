import { adminGetAllCoupons } from '@/services/coupon.service';
import CouponsClient from './CouponsClient';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await adminGetAllCoupons();

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DFD0EC] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] mb-1">
          <RoisinDiamond size={13} color="#7043A0" /> Promociones & Fidelización
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
          Cupones de Descuento
        </h1>
        <p className="text-xs text-zinc-500 font-light mt-0.5">
          Crea códigos promocionales porcentuales y monitorea su redención en el checkout de la tienda.
        </p>
      </div>

      <CouponsClient
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          discountPercentage: c.discountPercentage,
          maxUses: c.maxUses,
          currentUses: c.currentUses,
          validUntil: c.validUntil ? c.validUntil.toISOString() : null,
          isActive: c.isActive,
        }))}
      />
    </div>
  );
}

