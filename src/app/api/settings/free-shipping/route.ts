import { NextResponse } from 'next/server';
import { getFreeShippingThreshold, adminUpdateFreeShippingThresholdAction } from '@/lib/actions/admin.actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const threshold = await getFreeShippingThreshold();
    return NextResponse.json({ threshold });
  } catch (err: any) {
    return NextResponse.json({ threshold: 50.0 }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const threshold = Number(body?.threshold);
    const res = await adminUpdateFreeShippingThresholdAction(threshold);
    if (res.success) {
      return NextResponse.json({ success: true, threshold: res.threshold });
    }
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
