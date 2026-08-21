import prisma from '@/lib/db';
import PromotionsClient from './PromotionsClient';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const [promotions, collections, products] = await Promise.all([
    prisma.promotion.findMany({
      where: { isActive: true },
      include: {
        collection: true,
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true, basePrice: true },
    }),
  ]);

  return (
    <PromotionsClient
      initialPromotions={serializePlain(promotions) as any}
      collections={serializePlain(collections)}
      products={serializePlain((products || []).map((p: any) => ({ ...p, basePrice: Number(p.basePrice) })))}
    />
  );
}

