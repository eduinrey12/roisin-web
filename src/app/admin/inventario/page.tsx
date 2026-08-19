import { adminGetInventoryOverview } from '@/services/inventory.service';
import InventoryTableClient from './InventoryTableClient';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const inventory = await adminGetInventoryOverview();

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DFD0EC] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] mb-1">
          <RoisinDiamond size={13} color="#7043A0" /> Control de Existencias
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
          Inventario de Joyas & Stock en Vivo
        </h1>
        <p className="text-xs text-zinc-500 font-light mt-0.5">
          Supervisa las existencias por SKU/talla y realiza ajustes rápidos de stock con registro atómico de auditoría.
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
          imageUrl: item.variant.product.images[0]?.url || 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop',
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

