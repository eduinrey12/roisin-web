import { adminGetAllCoupons } from '@/services/coupon.service';
import CouponsClient from './CouponsClient';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await adminGetAllCoupons();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900">Cupones y Promociones</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Crea códigos promocionales y monitorea su uso en el checkout
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
