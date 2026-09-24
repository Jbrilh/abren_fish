import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isOutOfStock } from "@/lib/inventory-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OwnerPage() {
  const [inventoryItems, menuItems] = await Promise.all([
    prisma.inventoryItem.findMany(),
    prisma.menuItem.findMany({
      where: { isActive: true },
      include: { recipeItems: { include: { inventoryItem: true } } },
    }),
  ]);

  const lowStockCount = inventoryItems.filter(
    (item) => item.stockQty.toNumber() <= item.lowStockThreshold.toNumber()
  ).length;

  const outOfStockCount = menuItems.filter(
    (item) => item.recipeItems.length > 0 && isOutOfStock(item.recipeItems)
  ).length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Owner Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <Link href="/owner/inventory">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Low-stock ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{lowStockCount}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/owner/inventory">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Menu items out of stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{outOfStockCount}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Financials, reconciliation, and reports will land here in later
        phases. Use the nav above to manage the menu and inventory.
      </p>
    </div>
  );
}
