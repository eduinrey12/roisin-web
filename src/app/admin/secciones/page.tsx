import { adminGetAllHomeSections } from '@/services/catalog.service';
import HomeSectionsClient from './HomeSectionsClient';

export const dynamic = 'force-dynamic';

export default async function AdminHomeSectionsPage() {
  const sections = await adminGetAllHomeSections();

  return <HomeSectionsClient initialSections={JSON.parse(JSON.stringify(sections))} />;
}
