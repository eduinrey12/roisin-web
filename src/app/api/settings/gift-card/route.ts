import { NextResponse } from 'next/server';
import { getGiftCardConfig, adminUpdateGiftCardConfig } from '@/services/shipping.service';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getGiftCardConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ price: 2.5, firstFree: true }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const price = Number(body?.price);
    const firstFree = body?.firstFree !== false;

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser un número mayor o igual a 0' },
        { status: 400 }
      );
    }

    const updated = await adminUpdateGiftCardConfig(price, firstFree);
    return NextResponse.json({ success: true, ...updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
