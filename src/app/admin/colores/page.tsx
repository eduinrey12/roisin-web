import { adminGetAllJewelryColors } from '@/services/catalog.service';
import JewelryColorsClient from './JewelryColorsClient';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminJewelryColorsPage() {
  const colors = await adminGetAllJewelryColors();
  return <JewelryColorsClient initialColors={serializePlain(colors)} />;
}
