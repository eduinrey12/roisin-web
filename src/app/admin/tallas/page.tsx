import { adminGetAllCategorySizes, getCategories } from '@/services/catalog.service';
import CategorySizesClient from './CategorySizesClient';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCategorySizesPage() {
  const [sizes, categories] = await Promise.all([
    adminGetAllCategorySizes(),
    getCategories(),
  ]);

  return (
    <CategorySizesClient
      initialSizes={serializePlain(sizes)}
      categories={serializePlain(categories)}
    />
  );
}
