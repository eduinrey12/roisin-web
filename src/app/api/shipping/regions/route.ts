import { NextResponse } from 'next/server';
import { getActiveShippingRegions } from '@/services/shipping.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const regions = await getActiveShippingRegions();
    return NextResponse.json(regions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
