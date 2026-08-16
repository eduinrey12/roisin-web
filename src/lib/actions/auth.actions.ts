'use server';

import prisma from '@/lib/db';
import { hashPassword, comparePassword, setAuthSession, clearAuthSession } from '@/lib/auth';
import { loginSchema, registerSchema } from '@/lib/validations';
import { cookies } from 'next/headers';
import { mergeCarts } from '@/services/cart.service';

export async function loginAction(formData: unknown) {
  try {
    const data = loginSchema.parse(formData);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    await setAuthSession(user);

    // Merge guest cart if present
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('guest_token')?.value;
    if (guestToken) {
      await mergeCarts(guestToken, user.id);
    }

    return {
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error en autenticación' };
  }
}

export async function registerAction(formData: unknown) {
  try {
    const data = registerSchema.parse(formData);
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: 'Ya existe una cuenta con este correo electrónico' };
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: 'CUSTOMER',
        customerProfile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || null,
          },
        },
      },
    });

    await setAuthSession(user);

    // Merge guest cart if present
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('guest_token')?.value;
    if (guestToken) {
      await mergeCarts(guestToken, user.id);
    }

    return {
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al registrar la cuenta' };
  }
}

export async function logoutAction() {
  await clearAuthSession();
  return { success: true };
}
