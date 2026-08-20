import prisma from '@/lib/db';
import CategoriesClient from './CategoriesClient';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return <CategoriesClient initialCategories={serializePlain(categories)} />;
}

