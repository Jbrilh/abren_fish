import { prisma } from "@/lib/prisma";
import { isOutOfStock } from "@/lib/inventory-status";
import { InventoryList } from "./inventory-list";

export default async function InventoryPage() {
  const [items, menuItems] = await Promise.all([
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
    prisma.menuItem.findMany({
      where: { isActive: true },
      include: { recipeItems: { include: { inventoryItem: true } } },
    }),
  ]);

  const serializable = items.map((item) => ({
    ...item,
    stockQty: item.stockQty.toString(),
    lowStockThreshold: item.lowStockThreshold.toString(),
  }));

  const outOfStockMenuItems = menuItems.filter(
    (item) => item.recipeItems.length > 0 && isOutOfStock(item.recipeItems)
  );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-6">Inventory</h1>
        <InventoryList initialItems={serializable} />
      </div>

      {outOfStockMenuItems.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">
            Menu items out of stock ({outOfStockMenuItems.length})
          </h2>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            {outOfStockMenuItems.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
