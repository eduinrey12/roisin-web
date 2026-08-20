import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'PAYMENT_PENDING':
      return 'Pago Pendiente';
    case 'PROCESSING':
      return 'En Proceso';
    case 'SHIPPED':
      return 'Enviado';
    case 'DELIVERED':
      return 'Entregado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'PAYMENT_PENDING':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'PROCESSING':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'SHIPPED':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-800 border-red-200';
    default:
      return 'bg-zinc-100 text-zinc-800 border-zinc-200';
  }
}

export function getPaymentMethodLabel(method?: string | null): string {
  switch (method) {
    case 'BANK_TRANSFER':
      return 'Transferencia Bancaria';
    case 'BANK_DEPOSIT':
      return 'Depósito Bancario (Corresponsales)';
    case 'CREDIT_CARD':
      return 'Tarjeta de Crédito / Débito';
    case 'CASH_ON_DELIVERY':
      return 'Contra Entrega';
    default:
      return 'Por definir';
  }
}

/**
 * Strips non-plain objects (such as Prisma.Decimal, Dates without JSON prototypes, class instances)
 * into safe, pure plain JSON objects for seamless transfer from Server Components to Client Components.
 */
export function serializePlain<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}


