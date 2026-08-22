import { adminGetAllMaterials } from '@/services/catalog.service';
import MaterialsClient from './MaterialsClient';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminMaterialsPage() {
  const materials = await adminGetAllMaterials();
  return <MaterialsClient initialMaterials={serializePlain(materials)} />;
}
