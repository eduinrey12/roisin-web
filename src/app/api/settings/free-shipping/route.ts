import { NextResponse } from 'next/server';
import { getFreeShippingThreshold } from '@/lib/actions/admin.actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const threshold = await getFreeShippingThreshold();
    return NextResponse.json({ threshold });
  } catch (err: any) {
    return NextResponse.json({ threshold: 50.0 }, { status: 200 });
  }
}
