import { NextRequest, NextResponse } from 'next/server';
import { readUploadedFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const file = await readUploadedFile(filename);

  if (!file) {
    return new NextResponse('Archivo no encontrado', { status: 404 });
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
