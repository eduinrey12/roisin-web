import { NextRequest, NextResponse } from 'next/server';
import { readUploadedFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// 100x100 clean luxury placeholder PNG base64
const FALLBACK_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeDAyNAABxJq27QAAAABJRU5ErkJggg==';
const FALLBACK_PNG_BUFFER = Buffer.from(FALLBACK_PNG_BASE64, 'base64');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const file = await readUploadedFile(filename);

  if (!file) {
    // Return a valid PNG image placeholder so next/image optimizer always succeeds without 400
    return new NextResponse(FALLBACK_PNG_BUFFER as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return new NextResponse(file.buffer as any, {
    status: 200,
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
