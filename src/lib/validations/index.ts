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
  dedication: z.string().optional(),
  dedications: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

export const productSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'Slug no válido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  tag: z.string().optional(),
  basePrice: z.number().positive('El precio debe ser mayor a 0').optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
  categoryId: z.string().min(1, 'Categoría inválida'),
  collectionId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      url: z.string().min(1, 'URL de imagen no válida'),
      altText: z.string().optional(),
      label: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })
  ).min(1, 'Se requiere al menos una imagen'),
  materials: z.array(
    z.object({
      materialName: z.string().min(1, 'El nombre del material es requerido'),
      basePrice: z.number().positive('El precio del material debe ser positivo'),
      initialStock: z.number().int().nonnegative().optional(),
      sizes: z.array(
        z.object({
          sizeName: z.string().min(1, 'La talla es requerida'),
          price: z.number().positive().optional().nullable(),
          stock: z.number().int().nonnegative().optional(),
        })
      ).optional(),
      colors: z.array(
        z.object({
          metalColor: z.string().optional(),
          gemColor: z.string().optional(),
          imageUrls: z.array(z.string()).optional(),
        })
      ).optional(),
    })
  ).optional(),
  variants: z.array(
    z.object({
      sku: z.string().min(2, 'SKU requerido'),
      price: z.number().positive('El precio debe ser positivo'),
      compareAtPrice: z.number().positive().optional().nullable(),
      initialStock: z.number().int().nonnegative().default(0),
    })
  ).optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').toUpperCase(),
  discountPercentage: z.number().min(1).max(100, 'El porcentaje debe ser entre 1 y 100'),
  maxUses: z.number().int().positive().optional(),
  validUntil: z.string().optional(),
});
