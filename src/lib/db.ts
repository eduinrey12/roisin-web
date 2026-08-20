import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:qwer@127.0.0.1:3306/roisin_db';

  let adapter: PrismaMariaDb;
  try {
    const parsed = new URL(dbUrl);
    adapter = new PrismaMariaDb({
      host: parsed.hostname || '127.0.0.1',
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || 'root'),
      password: decodeURIComponent(parsed.password || 'qwer'),
      database: parsed.pathname.replace(/^\//, '') || 'roisin_db',
      connectionLimit: 10,
      connectTimeout: 8000,
      acquireTimeout: 8000,
      allowPublicKeyRetrieval: true,
    });
  } catch {
    adapter = new PrismaMariaDb(dbUrl);
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    const p = globalForPrisma.prisma as any;
    // If delegates like faq or review are missing, recreate client
    if (!p.faq || !p.review || !p.promotion || !p.category || !p.product) {
      try {
        globalForPrisma.prisma.$disconnect().catch(() => {});
      } catch {}
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}

// Proxy wrapper so any direct property access like prisma.faq, prisma.review, etc.
// dynamically routes to the current up-to-date client instance!
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
