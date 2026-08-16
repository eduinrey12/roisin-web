import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function CouponsRedirect() {
  redirect('/admin/cupones');
}
