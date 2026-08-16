import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ ERROR CRÍTICO: La variable DATABASE_URL no está configurada en el archivo .env');
  }

  let adapter: PrismaMariaDb;
  try {
    const urlString = dbUrl || 'mysql://root:@127.0.0.1:3306/roisin_db';
    const parsed = new URL(urlString);

    adapter = new PrismaMariaDb({
      host: parsed.hostname || '127.0.0.1',
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || 'root'),
      password: decodeURIComponent(parsed.password || ''),
      database: parsed.pathname.replace(/^\//, '') || 'roisin_db',
      connectionLimit: 5,
      connectTimeout: 5000,
      acquireTimeout: 3000,
      allowPublicKeyRetrieval: true,
    });
  } catch {
    adapter = new PrismaMariaDb(dbUrl || 'mysql://root:@127.0.0.1:3306/roisin_db');
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
