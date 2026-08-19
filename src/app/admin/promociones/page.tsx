import prisma from '@/lib/db';
import PromotionsClient from './PromotionsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return <PromotionsClient initialPromotions={promotions} />;
}
