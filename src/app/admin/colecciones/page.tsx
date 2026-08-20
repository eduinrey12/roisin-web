import prisma from '@/lib/db';
import CollectionsClient from './CollectionsClient';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <CollectionsClient initialCollections={serializePlain(collections)} />;
}

