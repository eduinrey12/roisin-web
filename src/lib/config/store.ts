/**
 * Configuración comercial centralizada de ROISIN Joyas
 * Permite personalizar datos bancarios, teléfonos, mensajes y parámetros del negocio.
 */

export const STORE_CONFIG = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'ROISIN',
  tagline: 'Joyas & Accesorios',
  description:
    'Exclusiva joyería fina en Plata de Ley 925 y Baño de Oro 18k. Diseños para realzar tu belleza en cada momento especial.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://roisinjoyas.com',
  currency: process.env.NEXT_PUBLIC_STORE_CURRENCY || 'USD',
  currencySymbol: '$',

  // Contacto & Atención al Cliente
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '593999999999',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'contacto@roisinjoyas.com',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '0999999999',
  city: 'Quito',
  country: 'Ecuador',

  // Cuentas Bancarias para Transferencias / Depósitos en Ecuador (Configurables)
  bankAccounts: [
    {
      bankName: process.env.NEXT_PUBLIC_BANK_1_NAME || 'Banco Pichincha',
      accountType: process.env.NEXT_PUBLIC_BANK_1_TYPE || 'Cuenta de Ahorros',
      accountNumber: process.env.NEXT_PUBLIC_BANK_1_NUMBER || '2200000000',
      beneficiary: process.env.NEXT_PUBLIC_BANK_1_BENEFICIARY || 'ROISIN Joyas',
      idDocument: process.env.NEXT_PUBLIC_BANK_1_RUC || '1790000000001',
    },
    {
      bankName: process.env.NEXT_PUBLIC_BANK_2_NAME || 'Banco Guayaquil / Produbanco',
      accountType: process.env.NEXT_PUBLIC_BANK_2_TYPE || 'Cuenta Corriente',
      accountNumber: process.env.NEXT_PUBLIC_BANK_2_NUMBER || '0010000000',
      beneficiary: process.env.NEXT_PUBLIC_BANK_2_BENEFICIARY || 'ROISIN Joyas',
      idDocument: process.env.NEXT_PUBLIC_BANK_2_RUC || '1790000000001',
    },
  ],

  // Calidad & Garantías
  guarantees: {
    metal: 'Plata de Ley 925 Certificada & Baño de Oro 18k',
    shipping: 'Envíos asegurados a todo el Ecuador en 24h a 48h vía Servientrega / Courier Express',
    warranty: 'Garantía de autenticidad en todos los metales y piedras',
  },
};
