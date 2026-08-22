import path from 'path';
import { mkdir, writeFile, readFile, stat } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Check magic numbers for common image formats
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WebP: RIFF ... WEBP (52 49 46 46 .... 57 45 42 50)
  if (mimeType === 'image/webp') {
    return (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.toString('utf-8', 8, 12) === 'WEBP'
    );
  }

  return false;
}

export function getUploadsDirectory(): string {
  // If custom persistent directory is configured in Hostinger (e.g. UPLOADS_DIR=/home/user/uploads)
  if (process.env.UPLOADS_DIR) {
    return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR);
  }
  return path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'uploads');
}

export function getPossibleUploadDirectories(): string[] {
  const dirs: string[] = [];
  if (process.env.UPLOADS_DIR) {
    dirs.push(path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR));
  }
  // Standard Next.js paths
  dirs.push(path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'uploads'));
  dirs.push(path.join(/*turbopackIgnore: true*/ process.cwd(), '.next', 'standalone', 'public', 'uploads'));
  
  // Hostinger relative & standard paths
  dirs.push(path.join(/*turbopackIgnore: true*/ process.cwd(), '..', 'public', 'uploads'));
  dirs.push(path.join(/*turbopackIgnore: true*/ process.cwd(), '..', '..', 'public', 'uploads'));
  dirs.push('/home/u275304993/public_html/uploads');
  dirs.push('/home/u275304993/domains/roisinjoyasyaccesorios.com/public_html/uploads');

  return dirs;
}

export async function saveUploadedFile(file: File): Promise<{
  url: string;
  filename: string;
  size: number;
}> {
  const mimeType = file.type.toLowerCase();
  const safeExt = ALLOWED_MIME_TYPES[mimeType];

  if (!safeExt) {
    throw new Error('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.');
  }

  // Max size: 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo excede el tamaño máximo permitido de 5MB.');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!validateMagicBytes(buffer, mimeType)) {
    throw new Error('El contenido del archivo no corresponde a una imagen válida.');
  }

  const filename = `${uuidv4()}.${safeExt}`;
  const candidateDirs = getPossibleUploadDirectories();
  let writeSuccess = false;

  for (const dir of candidateDirs) {
    try {
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, filename);
      await writeFile(filePath, buffer);
      writeSuccess = true;
    } catch {}
  }

  if (!writeSuccess) {
    const fallbackDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'uploads');
    await mkdir(fallbackDir, { recursive: true });
    await writeFile(path.join(fallbackDir, filename), buffer);
  }

  // Return standard public URL
  const publicUrl = `/api/uploads/${filename}`;
  return { url: publicUrl, filename, size: file.size };
}

export async function readUploadedFile(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);
  if (safeFilename !== filename || filename.includes('..')) {
    return null;
  }

  const ext = path.extname(safeFilename).toLowerCase().replace('.', '');
  const extToMime: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  const contentType = extToMime[ext];
  if (!contentType) return null;

  const candidateDirs = getPossibleUploadDirectories();
  for (const dir of candidateDirs) {
    try {
      const filePath = path.join(dir, safeFilename);
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) {
        const buffer = await readFile(filePath);
        return { buffer, contentType };
      }
    } catch {
      // Continue checking next candidate directory
    }
  }

  return null;
}
