import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PaymentRedirect({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  redirect(`/checkout/${orderId}`);
}
