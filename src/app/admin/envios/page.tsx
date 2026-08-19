import prisma from '@/lib/db';
import ShippingClient from './ShippingClient';
import { getFreeShippingThreshold } from '@/lib/actions/admin.actions';

export const dynamic = 'force-dynamic';

export default async function AdminShippingPage() {
  const [regions, initialThreshold] = await Promise.all([
    prisma.shippingRegion.findMany({
      where: { isActive: true },
      orderBy: { baseRate: 'asc' },
    }),
    getFreeShippingThreshold(),
  ]);

  return (
    <ShippingClient
      initialRegions={regions}
      initialThreshold={initialThreshold}
    />
  );
}
