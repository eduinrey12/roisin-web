import 'dotenv/config';
import prisma from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.ADMIN_EMAIL;
  const password = args[1] || process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password) {
    console.error('Uso: npx tsx scripts/create-admin.ts <correo> <contraseña>');
    console.error('O define las variables de entorno ADMIN_EMAIL y ADMIN_INITIAL_PASSWORD');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: La contraseña debe tener al menos 8 caracteres por seguridad.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      customerProfile: {
        create: {
          firstName: 'Administrador',
          lastName: 'Roisin',
          phone: process.env.NEXT_PUBLIC_STORE_PHONE || '0999999999',
        },
      },
    },
  });

  console.log(`✅ Administrador configurado exitosamente: ${user.email} (Rol: ${user.role})`);
}

createAdmin()
  .catch((e) => {
    console.error('Error al crear administrador:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
