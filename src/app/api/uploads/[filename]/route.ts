import { NextRequest, NextResponse } from 'next/server';
import { readUploadedFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const FALLBACK_JEWELRY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8F5FA"/>
      <stop offset="100%" stop-color="#EDE6F3"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <circle cx="300" cy="270" r="110" fill="#F0E9F5" stroke="#DFD0EC" stroke-width="3"/>
  <path d="M300 200 L355 270 L300 340 L245 270 Z" fill="#7043A0" opacity="0.85"/>
  <text x="300" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="#3F235F" letter-spacing="3" text-anchor="middle">ROISIN JOYAS</text>
  <text x="300" y="445" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#7043A0" opacity="0.7" text-anchor="middle">Fotograf&#237;a en actualizaci&#243;n</text>
</svg>`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const file = await readUploadedFile(filename);

  if (!file) {
    // Return a valid SVG image placeholder so next/image optimizer doesn't fail with 400 Bad Request
    const fallbackBuffer = Buffer.from(FALLBACK_JEWELRY_SVG, 'utf-8');
    return new NextResponse(fallbackBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
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
