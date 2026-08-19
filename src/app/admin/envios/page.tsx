import prisma from '@/lib/db';
import ShippingClient from './ShippingClient';

export const dynamic = 'force-dynamic';

export default async function AdminShippingPage() {
  const regions = await prisma.shippingRegion.findMany({
    where: { isActive: true },
    orderBy: { baseRate: 'asc' },
  });

  return <ShippingClient initialRegions={regions} />;
}
