import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre es requerido'),
  lastName: z.string().min(2, 'El apellido es requerido'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().optional(),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  email: z.string().email('Correo electrónico no válido'),
  phone: z.string().min(7, 'Número de teléfono obligatorio para la entrega'),
  address: z.string().min(5, 'Dirección completa requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  province: z.string().min(2, 'Provincia requerida'),
  regionId: z.string().uuid('Zona de envío no seleccionada'),
  couponCode: z.string().optional(),
});

export const productSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'Slug no válido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  basePrice: z.number().positive('El precio debe ser mayor a 0'),
  categoryId: z.string().uuid('Categoría inválida'),
  isFeatured: z.boolean().default(false),
  images: z.array(
    z.object({
      url: z.string().url('URL de imagen no válida'),
      altText: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })
  ).min(1, 'Se requiere al menos una imagen'),
  variants: z.array(
    z.object({
      sku: z.string().min(2, 'SKU requerido'),
      price: z.number().positive('El precio debe ser positivo'),
      compareAtPrice: z.number().positive().optional(),
      initialStock: z.number().int().nonnegative().default(0),
    })
  ).min(1, 'Se requiere al menos una variante'),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').toUpperCase(),
  discountPercentage: z.number().min(1).max(100, 'El porcentaje debe ser entre 1 y 100'),
  maxUses: z.number().int().positive().optional(),
  validUntil: z.string().optional(),
});
