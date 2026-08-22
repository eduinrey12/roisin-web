import { requireAdmin } from '@/lib/auth';
import {
  adminGetProductById,
  adminGetAllCategories,
  adminGetAllCollections,
  adminGetAllMaterials,
  adminGetAllCategorySizes,
  adminGetAllJewelryColors,
} from '@/services/catalog.service';
import { notFound } from 'next/navigation';
import ProductEditForm from './ProductEditForm';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories, collections, materials, categorySizes, jewelryColors] =
    await Promise.all([
      adminGetProductById(id),
      adminGetAllCategories(),
      adminGetAllCollections(),
      adminGetAllMaterials(),
      adminGetAllCategorySizes(),
      adminGetAllJewelryColors(),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProductEditForm
        product={serializePlain(product)}
        categories={serializePlain(categories)}
        collections={serializePlain(collections)}
        materials={serializePlain(materials)}
        categorySizes={serializePlain(categorySizes)}
        jewelryColors={serializePlain(jewelryColors)}
      />
    </div>
  );
}
