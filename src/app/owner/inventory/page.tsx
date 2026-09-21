import { prisma } from "@/lib/prisma";
import { InventoryList } from "./inventory-list";

export default async function InventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
  });

  const serializable = items.map((item) => ({
    ...item,
    stockQty: item.stockQty.toString(),
    lowStockThreshold: item.lowStockThreshold.toString(),
  }));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inventory</h1>
      </div>
      <InventoryList initialItems={serializable} />
    </div>
  );
}
