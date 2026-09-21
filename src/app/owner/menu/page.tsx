import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { MenuTable } from "./menu-table";

export default async function MenuPage() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { _count: { select: { recipeItems: true } } },
  });

  const rows = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price.toString(),
    isActive: item.isActive,
    recipeItemCount: item._count.recipeItems,
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
