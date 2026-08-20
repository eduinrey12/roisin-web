import prisma from '@/lib/db';
import ReviewsClient from './ReviewsClient';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return <ReviewsClient initialReviews={reviews as any} />;
}
