import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const result = await saveUploadedFile(file);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error al subir archivo:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno al procesar el archivo' },
      { status: 400 }
    );
  }
}
