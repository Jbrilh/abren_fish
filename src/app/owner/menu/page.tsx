import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { isOutOfStock } from "@/lib/inventory-status";
import { MenuTable } from "./menu-table";

export default async function MenuPage() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { recipeItems: { include: { inventoryItem: true } } },
  });

  const rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price.toString(),
    isActive: item.isActive,
    recipeItemCount: item.recipeItems.length,
    outOfStock: item.recipeItems.length > 0 && isOutOfStock(item.recipeItems),
  }));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Menu</h1>
        <Button render={<Link href="/owner/menu/new" />}>New menu item</Button>
      </div>
      <MenuTable items={rows} />
    </div>
  );
}
