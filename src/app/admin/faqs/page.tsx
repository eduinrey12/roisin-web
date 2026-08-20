import prisma from '@/lib/db';
import FaqsClient from './FaqsClient';

export const dynamic = 'force-dynamic';

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return <FaqsClient initialFaqs={faqs as any} />;
}
