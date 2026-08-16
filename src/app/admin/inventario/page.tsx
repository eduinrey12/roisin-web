import { adminGetInventoryOverview } from '@/services/inventory.service';
import InventoryTableClient from './InventoryTableClient';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const inventory = await adminGetInventoryOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900">Control de Inventario</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Supervisa las existencias por variante y realiza ajustes de stock con registro de auditoría
        </p>
      </div>

      <InventoryTableClient
        items={inventory.map((item) => ({
          id: item.id,
          variantId: item.variantId,
          sku: item.variant.sku,
          productTitle: item.variant.product.title,
          price: Number(item.variant.price),
          quantity: item.quantity,
          imageUrl: item.variant.product.images[0]?.url || '/placeholder.png',
          lastMovements: item.movements.map((m) => ({
            id: m.id,
            change: m.quantityChange,
            reason: m.reason,
            date: m.createdAt.toISOString(),
          })),
        }))}
      />
    </div>
  );
}
