import { adminGetAllPresentationOptions } from '@/services/catalog.service';
import PresentationsClient from './PresentationsClient';
import { serializePlain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPresentationsPage() {
  const options = await adminGetAllPresentationOptions();

  return <PresentationsClient initialOptions={serializePlain(options)} />;
}

